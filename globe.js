/* Anvaya — realistic 3D Earth oriented to Indonesia, with glowing city nodes + connecting arcs.
   Uses a baked equirectangular Earth texture (assets/earth.png). Global THREE. */
(function(){
  const mount = document.getElementById('globe-canvas');
  if(!mount || !window.THREE) return;
  const THREE = window.THREE;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D2R = Math.PI/180;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);

  const R = 2.0;
  const root = new THREE.Group();      // holds globe + arcs, gets oriented to Indonesia
  scene.add(root);
  const globe = new THREE.Group();
  root.add(globe);

  // ---- lat/lon -> vector (equirect convention) ----
  function toVec(lat, lon, r){
    const phi = (90 - lat) * D2R;
    const theta = (lon + 180) * D2R;
    return new THREE.Vector3(
      -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
    );
  }

  // ---- textured Earth sphere ----
  const earthUrl = (window.__resources && window.__resources.earth) || 'assets/earth.png';
  const earthTex = new THREE.TextureLoader().load(earthUrl, ()=>renderer.render(scene,camera));
  earthTex.colorSpace = THREE.SRGBColorSpace;
  earthTex.anisotropy = 8;
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(R, 96, 96),
    new THREE.MeshStandardMaterial({ map:earthTex, roughness:1, metalness:0, emissive:0x171010, emissiveIntensity:0.45 })
  );
  globe.add(earth);

  // lights fixed in the scene -> soft day/night terminator as the globe sways
  scene.add(new THREE.AmbientLight(0xffffff, 0.95));
  const sun = new THREE.DirectionalLight(0xfff1ea, 1.5);
  sun.position.set(-1.3, 0.85, 1.7);
  scene.add(sun);

  // ---- atmosphere rim glow (backside additive) ----
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R*1.13, 64, 64),
    new THREE.ShaderMaterial({
      transparent:true, blending:THREE.AdditiveBlending, side:THREE.BackSide, depthWrite:false,
      uniforms:{ c:{value:new THREE.Color(0xACDBE3)} },
      vertexShader:`varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`varying vec3 vN; uniform vec3 c; void main(){ float i=pow(0.62-dot(vN,vec3(0.,0.,1.)),3.2); gl_FragColor=vec4(c, clamp(i,0.,1.)*0.6);}`
    })
  );
  root.add(atmo);

  // ---- Indonesian / regional hub cities ----
  const cities = [
    {n:'Jakarta',   lat:-6.2,  lon:106.8, big:true},
    {n:'Surabaya',  lat:-7.25, lon:112.75},
    {n:'Bandung',   lat:-6.9,  lon:107.6},
    {n:'Medan',     lat:3.6,   lon:98.67},
    {n:'Makassar',  lat:-5.15, lon:119.43},
    {n:'Balikpapan',lat:-1.27, lon:116.83},
    {n:'Batam',     lat:1.13,  lon:104.05},
    {n:'Denpasar',  lat:-8.65, lon:115.22},
    {n:'Jayapura',  lat:-2.53, lon:140.7},
    {n:'Pontianak', lat:-0.03, lon:109.33},
    {n:'Manado',    lat:1.49,  lon:124.84},
    {n:'Padang',    lat:-0.95, lon:100.35}
  ];

  // node sprite
  const nc=document.createElement('canvas'); nc.width=nc.height=64;
  const nx=nc.getContext('2d');
  const ng=nx.createRadialGradient(32,32,0,32,32,32);
  ng.addColorStop(0,'rgba(255,255,255,1)'); ng.addColorStop(.25,'rgba(242,197,124,1)');
  ng.addColorStop(.6,'rgba(230,73,61,.5)'); ng.addColorStop(1,'rgba(230,73,61,0)');
  nx.fillStyle=ng; nx.beginPath(); nx.arc(32,32,32,0,7); nx.fill();
  const nodeTex=new THREE.CanvasTexture(nc);

  const nodes=[];
  cities.forEach(c=>{
    const v=toVec(c.lat,c.lon,R*1.012);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:nodeTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, color:0xffffff}));
    const s=c.big?0.22:0.155; sp.scale.set(s,s,s); sp.position.copy(v);
    globe.add(sp); nodes.push({sp, base:s, ph:Math.random()*7});
  });

  // ---- arcs between hubs (Jakarta as primary spoke + a few mesh links) ----
  const links = [[0,1],[0,2],[0,3],[0,4],[0,6],[0,7],[1,8],[3,5],[4,8],[0,5],[2,11],[4,10],[6,9]];
  const arcs=[];
  const arcMat = ()=> new THREE.LineBasicMaterial({color:0xe8584c, transparent:true, opacity:0.3, blending:THREE.AdditiveBlending, depthWrite:false});
  links.forEach((lk,idx)=>{
    const a=toVec(cities[lk[0]].lat,cities[lk[0]].lon,R), b=toVec(cities[lk[1]].lat,cities[lk[1]].lon,R);
    const mid=a.clone().add(b).multiplyScalar(0.5);
    const lift=1 + a.distanceTo(b)*0.28;
    mid.normalize().multiplyScalar(R*lift);
    const curve=new THREE.QuadraticBezierCurve3(a,mid,b);
    const pts=curve.getPoints(50);
    const geo=new THREE.BufferGeometry().setFromPoints(pts);
    const mat=arcMat();
    const line=new THREE.Line(geo,mat);
    globe.add(line);
    // travelling pulse along the arc
    const pulse=new THREE.Sprite(new THREE.SpriteMaterial({map:nodeTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:0xf2c57c}));
    pulse.scale.set(0.16,0.16,0.16); globe.add(pulse);
    arcs.push({mat,curve,pulse,phase:(idx/links.length), speed:0.10+Math.random()*0.06});
  });

  // ---- orient root so Indonesia faces the camera ----
  let cen=new THREE.Vector3();
  cities.forEach(c=>cen.add(toVec(c.lat,c.lon,1)));
  cen.normalize();
  const q=new THREE.Quaternion().setFromUnitVectors(cen, new THREE.Vector3(0,0.06,1).normalize());
  root.quaternion.copy(q);
  root.rotation.z -= 0.04;

  // ---- resize ----
  function size(){
    const w=mount.clientWidth, h=mount.clientHeight;
    renderer.setSize(w,h);
    camera.aspect=w/h; camera.updateProjectionMatrix();
    const ar = w/h;
    camera.position.z = ar < 1 ? 13.5 : (ar < 1.4 ? 11 : 9.6);
    renderer.render(scene, camera);
  }
  size(); addEventListener('resize', size);
  renderer.render(scene, camera); // paint one frame synchronously (does not depend on rAF)

  // ---- interaction: gentle pointer parallax ----
  let tx=0,ty=0,cx=0,cy=0;
  if(!reduce){
    addEventListener('pointermove', e=>{
      tx=(e.clientX/innerWidth-0.5); ty=(e.clientY/innerHeight-0.5);
    },{passive:true});
  }

  let inView=true;
  const io=new IntersectionObserver(es=>{inView=es[0].isIntersecting;},{threshold:0});
  io.observe(mount);

  const clock=new THREE.Clock();
  function frame(){
    requestAnimationFrame(frame);
    if(!inView) return;
    const t=clock.getElapsedTime();
    // subtle sway keeps Indonesia centred (no full spin)
    cx+=(tx-cx)*0.04; cy+=(ty-cy)*0.04;
    globe.rotation.y = Math.sin(t*0.07)*0.10 + cx*0.5;
    globe.rotation.x = Math.sin(t*0.05)*0.04 - cy*0.35;
    // node twinkle
    nodes.forEach(nd=>{ const k=1+Math.sin(t*1.6+nd.ph)*0.18; nd.sp.scale.setScalar(nd.base*k); });
    // arcs fade-in once, travelling pulses
    arcs.forEach(a=>{
      a.mat.opacity += (0.32 - a.mat.opacity)*0.02;
      a.phase += a.speed*0.016;
      const p=(a.phase%1+1)%1;
      a.curve.getPoint(p, a.pulse.position);
      a.pulse.material.opacity = Math.sin(p*Math.PI);
    });
    renderer.render(scene,camera);
  }
  frame();
})();
