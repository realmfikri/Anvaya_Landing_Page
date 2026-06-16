/* Anvaya hero — layered live agent-card wall + orchestrating cursor */
(function(){
  const wall = document.getElementById('agent-wall');
  if(!wall) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ICON = {
    audit:'<path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    procure:'<path d="M3 6h18"/><path d="M6 6l1.5 12.5A2 2 0 0 0 9.5 20h5a2 2 0 0 0 2-1.5L18 6"/><path d="M9 6V4a3 3 0 0 1 6 0v2"/>',
    contract:'<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M9 13h6M9 17h4"/>',
    hire:'<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M17 11l2 2 4-4"/>',
    listen:'<path d="M3 12a9 9 0 0 1 18 0"/><path d="M21 16v1a3 3 0 0 1-3 3h-1"/><rect x="3" y="12" width="4" height="7" rx="1.5"/><rect x="17" y="12" width="4" height="7" rx="1.5"/>',
    comply:'<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
    brief:'<path d="M4 5h16v12H4z"/><path d="M4 17l4 3M20 17l-4 3"/><path d="M8 9h8M8 12h5"/>',
    attrition:'<path d="M3 17l5-5 4 3 6-7"/><path d="M14 8h4v4"/>'
  };
  const agents = [
    {n:'Audit Agent', d:'AIN Finance', i:'audit', t:'Validating <b>412 invoices</b>', done:'Flagged 9 mismatches · posted to ERP', x:8,  y:20, depth:2},
    {n:'Hiring Agent', d:'AIN People', i:'hire', t:'Screening <b>87 candidates</b>', done:'Top 12 shortlisted · scorecards sent', x:71, y:14, depth:2},
    {n:'Contract Agent', d:'AIN Legal', i:'contract', t:'Reviewing an <b>MSA</b>', done:'7 clauses redlined · risk: low', x:80, y:54, depth:2},
    {n:'Procurement Agent', d:'AIN Finance', i:'procure', t:'Matching <b>POs to contracts</b>', done:'58 POs reconciled · 3 exceptions', x:4, y:58, depth:2},
    {n:'Listening Agent', d:'AIN People', i:'listen', t:'<b>3 engagement signals</b> flagged', done:'CHRO brief drafted · 2 teams at risk', x:26, y:70, depth:1},
    {n:'Compliance Agent', d:'AIN Legal', i:'comply', t:'Checking <b>12 clauses</b>', done:'Policy aligned · 1 needs review', x:58, y:74, depth:1},
    {n:'CHRO Brief Agent', d:'AIN People', i:'brief', t:'Compiling <b>workforce snapshot</b>', done:'Brief delivered to leadership', x:18, y:38, depth:0},
    {n:'Attrition Agent', d:'AIN People', i:'attrition', t:'Modelling <b>retention risk</b>', done:'4 high-risk roles identified', x:64, y:36, depth:0},
    {n:'Finance Ops Agent', d:'AIN Finance', i:'audit', t:'Closing the <b>monthly books</b>', done:'Close cut by 2.5 days', x:43, y:18, depth:0},
    {n:'Doc Classifier', d:'AIN Legal', i:'contract', t:'Sorting <b>1,240 documents</b>', done:'Routed by matter & priority', x:88, y:30, depth:1},
    {n:'Talent Mobility', d:'AIN People', i:'hire', t:'Mapping <b>internal moves</b>', done:'31 fits surfaced across BUs', x:38, y:80, depth:1},
    {n:'PO Match Agent', d:'AIN Finance', i:'procure', t:'Reconciling <b>vendor spend</b>', done:'Savings opportunity: 4.1%', x:80, y:80, depth:0}
  ];

  const DEPTH = {
    0:{scale:0.80, blur:3, op:0.62, z:1},
    1:{scale:0.92, blur:1, op:0.9,  z:2},
    2:{scale:1.0,  blur:0, op:1,    z:3}
  };

  const cards=[];
  agents.forEach((a,idx)=>{
    const d=DEPTH[a.depth];
    const el=document.createElement('div');
    el.className='agent-card';
    el.style.left=a.x+'%'; el.style.top=a.y+'%';
    el.style.zIndex=d.z;
    el.style.filter=d.blur?`blur(${d.blur}px)`:'none';
    el.style.opacity=0;
    el.innerHTML=`
      <div class="ac-top">
        <div class="ac-ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON[a.i]}</svg></div>
        <div><div class="ac-name">${a.n}</div><div class="ac-domain">${a.d}</div></div>
      </div>
      <div class="ac-task">${a.t}</div>
      <div class="ac-foot">
        <div class="ac-status"><span class="ac-pulse"></span>Active</div>
        <div class="ac-prog">${String(idx*7%97+3).padStart(2,'0')}%</div>
      </div>`;
    wall.appendChild(el);
    cards.push({el, base:d, a, phase:Math.random()*Math.PI*2, amp:6+Math.random()*8, sp:0.4+Math.random()*0.4, busy:false});
    // visible immediately (paint-critical, no transition dependency)
    el.style.opacity=d.op;
  });

  // ---------- float + parallax ----------
  let mx=0,my=0,cmx=0,cmy=0;
  if(!reduce){
    addEventListener('pointermove',e=>{ mx=(e.clientX/innerWidth-0.5); my=(e.clientY/innerHeight-0.5); },{passive:true});
  }
  const hero=document.querySelector('.hero');
  function loop(t){
    requestAnimationFrame(loop);
    cmx+=(mx-cmx)*0.05; cmy+=(my-cmy)*0.05;
    const time=t*0.001;
    cards.forEach(c=>{
      const par=(c.a.depth+1)*7;           // deeper cards move less
      const fy=reduce?0:Math.sin(time*c.sp+c.phase)*c.amp;
      const fx=reduce?0:Math.cos(time*c.sp*0.8+c.phase)*c.amp*0.5;
      const tx=-cmx*par + fx;
      const ty=-cmy*par + fy;
      c.el.style.transform=`translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${c.base.scale})`;
    });
  }
  requestAnimationFrame(loop);

  // ---------- orchestrating cursor ----------
  if(!reduce){
    const cur=document.createElement('div');
    cur.id='orch-cursor';
    cur.innerHTML=`<svg viewBox="0 0 24 24" width="22" height="22" fill="#E6493D" stroke="#FBEDE9" stroke-width="1.2"><path d="M5 3l15 9-6 1.5L11 20z"/></svg><span class="label">Deploying</span>`;
    wall.appendChild(cur);
    const VERBS=['Deploying','Reviewing','Orchestrating','Dispatching','Auditing'];
    const front=cards.filter(c=>c.a.depth>=1);
    let i=0;
    function step(){
      const c=front[i%front.length]; i++;
      const r=c.el.getBoundingClientRect(), w=wall.getBoundingClientRect();
      const px=r.left-w.left+r.width*0.5, py=r.top-w.top+r.height*0.32;
      cur.style.transform=`translate(${px}px, ${py}px)`;
      cur.classList.add('acting');
      cur.querySelector('.label').textContent=VERBS[Math.floor(Math.random()*VERBS.length)];
      setTimeout(()=>{
        c.el.classList.add('highlight');
        const task=c.el.querySelector('.ac-task');
        const st=c.el.querySelector('.ac-status');
        const orig=c.a.t;
        task.innerHTML=`<b style="color:var(--gold-bright)">✓ ${c.a.done}</b>`;
        st.innerHTML='<span class="ac-pulse" style="background:var(--gold)"></span>Completed';
        setTimeout(()=>{
          c.el.classList.remove('highlight');
          task.innerHTML=orig;
          st.innerHTML='<span class="ac-pulse"></span>Active';
        },2100);
      },650);
      setTimeout(()=>cur.classList.remove('acting'),2600);
    }
    setTimeout(step,1400);
    setInterval(step,3400);
  }
})();
