/* Anvaya — topographic contour background (marching squares over a smooth field).
   Static SVG, regenerated on resize. Faint warm lines that fill dark space. */
(function(){
  const host=document.getElementById('contours'); if(!host) return;

  function field(u,v){
    return Math.sin(u*4.6 + Math.sin(v*3.1)*1.25)*1.0
         + Math.cos(v*3.9 - u*2.0)*0.85
         + Math.sin((u*0.7 + v)*5.4)*0.5
         + Math.sin(Math.hypot(u-0.74, v-0.22)*7.0)*0.55
         + Math.cos(Math.hypot(u-0.2, v-0.8)*6.0)*0.4;
  }

  function build(){
    const W=Math.max(innerWidth,900), H=Math.max(innerHeight,640);
    const step=46;
    const cols=Math.ceil(W/step)+1, rows=Math.ceil(H/step)+1;
    const gx=W/(cols-1), gy=H/(rows-1);
    const grid=[];
    for(let j=0;j<rows;j++){ grid[j]=[]; for(let i=0;i<cols;i++){ grid[j][i]=field(i*gx/W, j*gy/H); } }

    const levels=[];
    for(let L=-2.1; L<=2.1; L+=0.3) levels.push(+L.toFixed(2));

    let svg='';
    levels.forEach((lev,li)=>{
      let d='';
      for(let j=0;j<rows-1;j++){
        for(let i=0;i<cols-1;i++){
          const tl=grid[j][i], tr=grid[j][i+1], br=grid[j+1][i+1], bl=grid[j+1][i];
          const x0=i*gx, y0=j*gy, x1=(i+1)*gx, y1=(j+1)*gy;
          const p=[];
          if((tl<lev)!==(tr<lev)){ const t=(lev-tl)/(tr-tl); p.push([x0+t*gx, y0]); }
          if((tr<lev)!==(br<lev)){ const t=(lev-tr)/(br-tr); p.push([x1, y0+t*gy]); }
          if((bl<lev)!==(br<lev)){ const t=(lev-bl)/(br-bl); p.push([x0+t*gx, y1]); }
          if((tl<lev)!==(bl<lev)){ const t=(lev-tl)/(bl-tl); p.push([x0, y0+t*gy]); }
          if(p.length>=2){
            d+=`M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}L${p[1][0].toFixed(1)} ${p[1][1].toFixed(1)}`;
            if(p.length===4) d+=`M${p[2][0].toFixed(1)} ${p[2][1].toFixed(1)}L${p[3][0].toFixed(1)} ${p[3][1].toFixed(1)}`;
          }
        }
      }
      const index = li%4===0;                 // emphasised "index" contour
      const col = index ? '#E3A857' : '#E6493D';
      const op  = index ? 0.10 : 0.055;
      svg+=`<path d="${d}" fill="none" stroke="${col}" stroke-width="${index?1.1:0.9}" opacity="${op}"/>`;
    });

    host.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
  }

  build();
  let t; addEventListener('resize',()=>{ clearTimeout(t); t=setTimeout(build,260); });
})();
