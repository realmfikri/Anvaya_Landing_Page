/* Anvaya — nav state, scroll reveals, floating insight cards, tweaks panel */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // nav scrolled state
  const nav=document.getElementById('nav');
  const onScroll=()=>{ nav.classList.toggle('scrolled', scrollY>40); };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // reveal on scroll
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:0.16, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // floating insight cards over the globe
  if(!reduce){
    const floats=[...document.querySelectorAll('[data-float]')].map(el=>({el,ph:Math.random()*7,a:7+Math.random()*6,s:0.4+Math.random()*0.3}));
    function f(t){
      requestAnimationFrame(f);
      const time=t*0.001;
      floats.forEach(o=>{ o.el.style.transform=`translateY(${(Math.sin(time*o.s+o.ph)*o.a).toFixed(1)}px)`; });
    }
    requestAnimationFrame(f);
  }

  // demo CTAs — gentle acknowledgement (no backend)
  document.querySelectorAll('[data-cta]').forEach(b=>{
    b.addEventListener('click', e=>{
      if(b.tagName==='A') e.preventDefault();
      window.location.href = 'demo.html';
    });
  });

  // ---------------- Tweaks panel ----------------
  const panel=document.getElementById('tweaks');
  const root=document.documentElement;
  // host protocol: toolbar toggles tweaks
  function setOpen(v){ panel.classList.toggle('show', v); }
  addEventListener('message', e=>{
    const d=e.data||{};
    if(d.type==='tweaks:toggle') setOpen(!panel.classList.contains('show'));
    if(d.type==='tweaks:open') setOpen(true);
    if(d.type==='tweaks:close') setOpen(false);
    if(d.type==='tweaks:visible') setOpen(!!d.visible);
  });
  // persistence
  const KEY='anvaya_tweaks_v1';
  const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
  function save(){ localStorage.setItem(KEY, JSON.stringify(saved)); }

  function applyAccent(c){
    root.style.setProperty('--red', c);
    saved.accent=c; save();
    document.querySelectorAll('#tw-accent .sw').forEach(s=>s.classList.toggle('active', s.dataset.c===c));
  }
  function applyBg(b){
    root.style.setProperty('--bg', b);
    document.body.style.background=b;
    saved.bg=b; save();
    document.querySelectorAll('#tw-bg button').forEach(x=>x.classList.toggle('active', x.dataset.b===b));
  }
  function applyGrid(v){
    document.querySelector('.grid-lines').style.opacity=(v/100);
    document.getElementById('tw-gridv').textContent=v+'%';
    saved.grid=v; save();
  }
  function applyWord(c){
    root.style.setProperty('--word', c);
    saved.word=c; save();
    document.querySelectorAll('#tw-word button').forEach(x=>x.classList.toggle('active', x.dataset.w===c));
  }
  function applyLogo(v){
    root.style.setProperty('--logo-h', v+'px');
    document.getElementById('tw-logov').textContent=v+'px';
    saved.logo=v; save();
  }

  document.querySelectorAll('#tw-accent .sw').forEach(s=>s.addEventListener('click',()=>applyAccent(s.dataset.c)));
  document.querySelectorAll('#tw-word button').forEach(x=>x.addEventListener('click',()=>applyWord(x.dataset.w)));
  const logo=document.getElementById('tw-logo');
  logo.addEventListener('input',()=>applyLogo(+logo.value));
  document.querySelectorAll('#tw-bg button').forEach(x=>x.addEventListener('click',()=>applyBg(x.dataset.b)));
  const grid=document.getElementById('tw-grid');
  grid.addEventListener('input',()=>applyGrid(+grid.value));
  document.querySelectorAll('#tw-motion button').forEach(x=>x.addEventListener('click',()=>{
    document.querySelectorAll('#tw-motion button').forEach(b=>b.classList.toggle('active',b===x));
    document.body.dataset.motion=x.dataset.m;
    saved.motion=x.dataset.m; save();
  }));
  document.getElementById('tw-close').addEventListener('click',()=>setOpen(false));

  // ---- Flow section: data-flow highlight + gentle scroll parallax ----
  const flowEl=document.querySelector('.flow');
  if(flowEl && !reduce){
    const seq=[...document.querySelectorAll('.flow-col.inputs .chip'),
               document.querySelector('.flow-core'),
               ...document.querySelectorAll('.flow-out .chip')].filter(Boolean);
    let fi=0, vis=false;
    new IntersectionObserver(es=>{vis=es[0].isIntersecting;},{threshold:0.2}).observe(flowEl);
    setInterval(()=>{
      if(!vis||!seq.length) return;
      const el=seq[fi%seq.length];
      el.classList.add('flowing');
      setTimeout(()=>el.classList.remove('flowing'),780);
      fi++;
    },430);
    const inp=document.querySelector('.flow-col.inputs'), out=document.querySelector('.flow-out');
    const par=()=>{
      const r=flowEl.getBoundingClientRect();
      const p=Math.max(-1,Math.min(1,((innerHeight-r.top)/(innerHeight+r.height)-0.5)*2));
      if(inp) inp.style.transform=`translateY(${(-p*14).toFixed(1)}px)`;
      if(out) out.style.transform=`translateY(${(p*14).toFixed(1)}px)`;
    };
    addEventListener('scroll',par,{passive:true}); par();
  }

  // restore
  if(saved.accent) applyAccent(saved.accent);
  if(saved.word) applyWord(saved.word);
  if(typeof saved.logo==='number'){ logo.value=saved.logo; applyLogo(saved.logo); }
  if(saved.bg) applyBg(saved.bg);
  if(typeof saved.grid==='number'){ grid.value=saved.grid; applyGrid(saved.grid); }
})();
