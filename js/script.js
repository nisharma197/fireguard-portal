// ===== EMPTY DATA — user will add from UI =====
let apps = [];
let curFilt='all', curPg=1, nocCt=0, appCt=0;
const PP=8;
const AC=['linear-gradient(135deg,#f59e0b,#ef4444)','linear-gradient(135deg,#22c55e,#38bdf8)','linear-gradient(135deg,#a78bfa,#ec4899)','linear-gradient(135deg,#f97316,#fbbf24)','linear-gradient(135deg,#38bdf8,#818cf8)','linear-gradient(135deg,#ef4444,#f97316)','linear-gradient(135deg,#14b8a6,#22c55e)','linear-gradient(135deg,#ec4899,#a78bfa)'];
const ini=n=>n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
const acol=i=>AC[i%AC.length];
const sLbl={pending:'Pending',inspection:'Inspection',followup:'Follow-up',approved:'Approved',rejected:'Rejected','noc-issued':'NOC Issued'};
const fDt=d=>{if(!d)return'—';return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})};
const now=()=>new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});

// Empty state HTML
const emptyHTML=(icon,msg,sub)=>`<tr><td colspan="7"><div class="empty-state"><i class="fas ${icon}"></i><p>${msg}</p><small>${sub}</small></div></td></tr>`;
const emptyDiv=(icon,msg,sub)=>`<div class="empty-state"><i class="fas ${icon}"></i><p>${msg}</p><small>${sub}</small></div>`;

// ===== WELCOME FIRE PARTICLES =====
(function(){
  const c=document.getElementById('fireCanvas'),ctx=c.getContext('2d');
  let w,h,pts=[];
  function resize(){w=c.width=c.offsetWidth;h=c.height=c.offsetHeight}
  resize();window.addEventListener('resize',resize);
  for(let i=0;i<55;i++)pts.push({x:Math.random()*w,y:h+Math.random()*100,vx:(Math.random()-.5)*.7,vy:-Math.random()*1.8-1,r:Math.random()*2.5+1,a:Math.random(),col:Math.random()>.5?'245,158,11':'239,68,68'});
  function draw(){
    ctx.clearRect(0,0,w,h);
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.a-=.003;
      if(p.a<=0||p.y<-10){p.x=Math.random()*w;p.y=h+10;p.a=Math.random();p.vy=-Math.random()*1.8-1}
      ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.5,p.r),0,Math.PI*2);
      ctx.fillStyle=`rgba(${p.col},${Math.max(0,p.a*.45)})`;ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

function enterApp(){document.getElementById('welcomePage').classList.add('hide');setTimeout(()=>document.getElementById('welcomePage').style.display='none',600)}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('sidebarOverlay').classList.toggle('show')}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('sidebarOverlay').classList.remove('show')}
function goPage(p,el){document.querySelectorAll('.page').forEach(s=>s.classList.remove('on'));document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));document.getElementById('pg-'+p).classList.add('on');if(el)el.classList.add('active');closeSidebar();if(p==='reports')initRepCharts()}

function showToast(m,t='info'){
  const ic={success:'fa-circle-check',error:'fa-circle-xmark',info:'fa-circle-info',warning:'fa-triangle-exclamation'};
  const c=document.getElementById('toastC'),d=document.createElement('div');
  d.className='toast '+t;d.innerHTML=`<i class="fas ${ic[t]} toast-i"></i><span>${m}</span>`;
  c.appendChild(d);setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),300)},3000);
}
function openM(id){document.getElementById(id).classList.add('open');document.body.style.overflow='hidden';if(id==='schedM'||id==='nocM')fillSels()}
function closeM(id){document.getElementById(id).classList.remove('open');document.body.style.overflow=''}
document.querySelectorAll('.m-overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)closeM(o.id)}));

function updTime(){document.getElementById('liveTime').textContent=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})}
setInterval(updTime,1000);updTime();

function getFiltered(){
  let f=apps;
  if(curFilt!=='all')f=f.filter(a=>a.status===curFilt);
  const q=(document.getElementById('gSearch')?.value||'').toLowerCase();
  if(q)f=f.filter(a=>a.id.toLowerCase().includes(q)||a.name.toLowerCase().includes(q)||a.type.toLowerCase().includes(q));
  return f;
}

// ===== RENDER APP TABLE =====
function renderApp(){
  const f=getFiltered(),tp=Math.max(1,Math.ceil(f.length/PP));
  if(curPg>tp)curPg=tp;
  const s=(curPg-1)*PP,pg=f.slice(s,s+PP);
  document.getElementById('appCt').textContent=f.length;
  document.getElementById('tblInfo').textContent=f.length?`Showing ${s+1}-${Math.min(s+PP,f.length)} of ${f.length}`:'No records';
  const tb=document.getElementById('appTb');
  if(!pg.length){tb.innerHTML=emptyHTML('fa-file-circle-plus','No applications yet','Click "New Application" to add one');document.getElementById('pagDiv').innerHTML='';return}
  tb.innerHTML=pg.map(a=>{const i=apps.indexOf(a);return`<tr>
    <td><span class="app-id">${a.id}</span></td>
    <td><div class="app-cell"><div class="app-av" style="background:${acol(i)}">${ini(a.name)}</div><div><div class="app-nm">${a.name}</div><div class="app-ph">${a.phone}</div></div></div></td>
    <td>${a.type}</td>
    <td><span class="pri ${a.priority.toLowerCase()}">${a.priority}</span></td>
    <td><span class="sbadge ${a.status}"><span class="dot"></span>${sLbl[a.status]}</span></td>
    <td style="font-family:'JetBrains Mono',monospace;font-size:.8rem;color:var(--txm)">${fDt(a.applied)}</td>
    <td><div class="tbl-acts">
      <button class="btn-i" title="View" onclick="viewDet('${a.id}')"><i class="fas fa-eye"></i></button>
      ${a.status==='pending'?`<button class="btn-i" title="Schedule" onclick="qSched('${a.id}')"><i class="fas fa-calendar-plus"></i></button>`:''}
      ${a.status==='approved'?`<button class="btn-i" title="NOC" onclick="qNOC('${a.id}')"><i class="fas fa-stamp"></i></button>`:''}
      ${a.status==='inspection'?`<button class="btn-i" title="Complete" onclick="compInsp('${a.id}')"><i class="fas fa-check"></i></button>`:''}
      ${a.status==='followup'?`<button class="btn-i" title="Resolve" onclick="resFu('${a.id}')"><i class="fas fa-check-double"></i></button>`:''}
    </div></td></tr>`}).join('');
  const pd=document.getElementById('pagDiv');pd.innerHTML='';
  if(tp>1){pd.innerHTML+=`<button class="pg-btn" onclick="gP(${curPg-1})" ${curPg===1?'disabled':''}><i class="fas fa-chevron-left"></i></button>`;
  for(let p=1;p<=tp;p++)pd.innerHTML+=`<button class="pg-btn ${p===curPg?'on':''}" onclick="gP(${p})">${p}</button>`;
  pd.innerHTML+=`<button class="pg-btn" onclick="gP(${curPg+1})" ${curPg===tp?'disabled':''}><i class="fas fa-chevron-right"></i></button>`}
}
function gP(p){const tp=Math.max(1,Math.ceil(getFiltered().length/PP));if(p<1||p>tp)return;curPg=p;renderApp()}
function filt(f,b){curFilt=f;curPg=1;document.querySelectorAll('.fil-btn').forEach(x=>x.classList.remove('on'));b.classList.add('on');renderApp()}
function doSearch(){curPg=1;renderApp()}

// ===== DETAIL =====
function viewDet(id){
  const a=apps.find(x=>x.id===id);if(!a)return;const i=apps.indexOf(a);
  document.getElementById('detTitle').textContent=a.id;
  let act='';
  if(a.status==='pending')act=`<button class="btn btn-p" onclick="qSched('${id}');closeM('detM')"><i class="fas fa-calendar-plus"></i> Schedule</button>`;
  if(a.status==='inspection')act=`<button class="btn btn-sc" onclick="compInsp('${id}');closeM('detM')"><i class="fas fa-check"></i> Complete</button>`;
  if(a.status==='approved')act=`<button class="btn btn-p" onclick="qNOC('${id}');closeM('detM')"><i class="fas fa-stamp"></i> Issue NOC</button>`;
  if(a.status==='followup')act=`<button class="btn btn-sc" onclick="resFu('${id}');closeM('detM')"><i class="fas fa-check-double"></i> Resolve</button>`;
  act+=`<button class="btn btn-s" onclick="closeM('detM')">Close</button>`;
  document.getElementById('detFoot').innerHTML=act;
  document.getElementById('detBody').innerHTML=`<div class="d-grid" style="margin-bottom:18px">
    <div class="d-item"><span class="d-lbl">Applicant</span><span class="d-val">${a.name}</span></div>
    <div class="d-item"><span class="d-lbl">Phone</span><span class="d-val">${a.phone}</span></div>
    <div class="d-item"><span class="d-lbl">Type</span><span class="d-val">${a.type}</span></div>
    <div class="d-item"><span class="d-lbl">Priority</span><span class="d-val"><span class="pri ${a.priority.toLowerCase()}">${a.priority}</span></span></div>
    <div class="d-item"><span class="d-lbl">Status</span><span class="d-val"><span class="sbadge ${a.status}"><span class="dot"></span>${sLbl[a.status]}</span></span></div>
    <div class="d-item"><span class="d-lbl">Applied</span><span class="d-val" style="font-family:'JetBrains Mono',monospace">${fDt(a.applied)}</span></div>
    <div class="d-item"><span class="d-lbl">Inspector</span><span class="d-val">${a.inspector||'—'}</span></div>
    <div class="d-item"><span class="d-lbl">Inspection</span><span class="d-val" style="font-family:'JetBrains Mono',monospace">${a.inspDate?fDt(a.inspDate):'—'}</span></div>
    <div class="d-item full"><span class="d-lbl">Address</span><span class="d-val">${a.address}</span></div>
    ${a.nocNo?`<div class="d-item"><span class="d-lbl">NOC Number</span><span class="d-val" style="color:var(--ac);font-family:'JetBrains Mono',monospace;font-weight:700">${a.nocNo}</span></div>`:''}
    ${a.nocValid?`<div class="d-item"><span class="d-lbl">Valid Till</span><span class="d-val" style="font-family:'JetBrains Mono',monospace">${fDt(a.nocValid)}</span></div>`:''}
  </div><div style="font-weight:700;font-size:.88rem;margin-bottom:10px">Timeline</div><div class="tl">${a.tl.map(t=>`<div class="tl-item"><div class="tl-dot ${t.c}"><i class="fas ${t.i}"></i></div><div class="tl-body"><div class="tl-title">${t.t}</div><div class="tl-desc">${t.d}</div><div class="tl-time">${t.time}</div></div></div>`).join('')}</div>`;
  openM('detM');
}

// ===== ACTIONS =====
function qSched(id){openM('schedM');setTimeout(()=>document.getElementById('scApp').value=id,50)}
function qNOC(id){openM('nocM');setTimeout(()=>document.getElementById('nocApp').value=id,50)}

function compInsp(id){
  const a=apps.find(x=>x.id===id);if(!a)return;
  if(Math.random()>.3){a.status='approved';a.tl.push({t:'Inspection Passed',d:'Compliant',time:now(),i:'fa-clipboard-check',c:'gn'},{t:'Approved',d:'By Fire Officer',time:now(),i:'fa-check-circle',c:'gn'});showToast(`${id} passed — approved`,'success')}
  else{a.status='followup';a.tl.push({t:'Inspection Done',d:'Issues found',time:now(),i:'fa-clipboard-check',c:'pp'},{t:'Follow-up',d:'Resolve in 15 days',time:now(),i:'fa-arrows-rotate',c:'rd'});showToast(`${id} — follow-up required`,'warning')}
  refresh();
}
function resFu(id){
  const a=apps.find(x=>x.id===id);if(!a)return;a.status='approved';
  a.tl.push({t:'Follow-up Resolved',d:'Compliance met',time:now(),i:'fa-check-double',c:'gn'},{t:'Approved',d:'After compliance',time:now(),i:'fa-check-circle',c:'gn'});
  showToast(`${id} resolved — approved`,'success');refresh();
}

function submitApp(){
  const n=document.getElementById('naName').value.trim(),p=document.getElementById('naPhone').value.trim(),
  t=document.getElementById('naType').value,pr=document.getElementById('naPri').value,ad=document.getElementById('naAddr').value.trim();
  if(!n||!p||!t||!ad){showToast('Fill all required fields','error');return}
  appCt++;const id='FD-'+new Date().getFullYear()+'-'+String(appCt).padStart(3,'0'),ds=new Date().toISOString().split('T')[0];
  apps.unshift({id,name:n,phone:p,type:t,priority:pr,status:'pending',address:ad,applied:ds,inspector:'',inspDate:'',tl:[{t:'Application Received',d:'New submission',time:now(),i:'fa-inbox',c:'am'}]});
  closeM('newAppM');['naName','naPhone','naAddr'].forEach(x=>document.getElementById(x).value='');document.getElementById('naType').value='';
  showToast(`${id} registered`,'success');refresh();
}

function submitSched(){
  const id=document.getElementById('scApp').value,ins=document.getElementById('scInsp').value,dt=document.getElementById('scDate').value,tm=document.getElementById('scTime').value;
  if(!id||!dt){showToast('Select application and date','error');return}
  const a=apps.find(x=>x.id===id);if(!a)return;
  a.status='inspection';a.inspector=ins;a.inspDate=dt;
  a.tl.push({t:'Inspection Scheduled',d:`${ins}, ${tm}`,time:now(),i:'fa-calendar',c:'bl'});
  closeM('schedM');showToast(`Inspection scheduled for ${id}`,'success');refresh();
}

function issueNOC(){
  const id=document.getElementById('nocApp').value,val=document.getElementById('nocVal').value;
  if(!id){showToast('Select approved application','error');return}
  const a=apps.find(x=>x.id===id);if(!a||a.status!=='approved'){showToast('Must be approved first','error');return}
  nocCt++;const nn='NOC-'+new Date().getFullYear()+'-'+String(nocCt).padStart(3,'0'),d=new Date(),id2=d.toISOString().split('T')[0];
  d.setFullYear(d.getFullYear()+parseInt(val));const vd=d.toISOString().split('T')[0];
  a.status='noc-issued';a.nocNo=nn;a.nocIssued=id2;a.nocValid=vd;
  a.tl.push({t:'NOC Issued',d:`${nn}, ${val}`,time:now(),i:'fa-certificate',c:'am'});
  closeM('nocM');showToast(`NOC ${nn} issued`,'success');refresh();
}

function fillSels(){
  document.getElementById('scApp').innerHTML='<option value="">Select...</option>'+apps.filter(a=>a.status==='pending').map(a=>`<option value="${a.id}">${a.id} — ${a.name}</option>`).join('');
  document.getElementById('nocApp').innerHTML='<option value="">Select approved...</option>'+apps.filter(a=>a.status==='approved').map(a=>`<option value="${a.id}">${a.id} — ${a.name}</option>`).join('');
}

// ===== INSPECTIONS TABLE =====
function renderInsp(){
  const f=apps.filter(a=>a.status==='inspection'),tb=document.getElementById('inspTb');
  if(!f.length){tb.innerHTML=`<tr><td colspan="6">${emptyDiv('fa-clipboard-check','No inspections scheduled','Schedule one from Applications page')}</td></tr>`;return}
  tb.innerHTML=f.map(a=>{const i=apps.indexOf(a);return`<tr>
    <td><span class="app-id">${a.id}</span></td>
    <td><div class="app-cell"><div class="app-av" style="background:${acol(i)}">${ini(a.name)}</div><div class="app-nm">${a.name}</div></div></td>
    <td>${a.inspector}</td>
    <td style="font-family:'JetBrains Mono',monospace;font-size:.8rem">${fDt(a.inspDate)}</td>
    <td><span class="sbadge inspection"><span class="dot"></span>Scheduled</span></td>
    <td><div class="tbl-acts"><button class="btn-i" onclick="viewDet('${a.id}')"><i class="fas fa-eye"></i></button><button class="btn-i" onclick="compInsp('${a.id}')"><i class="fas fa-check"></i></button></div></td></tr>`}).join('');
}

// ===== FOLLOWUPS =====
function renderFu(){
  const f=apps.filter(a=>a.status==='followup'),c=document.getElementById('fuList');
  if(!f.length){c.innerHTML=emptyDiv('fa-arrows-rotate','No pending follow-ups','Follow-ups appear when inspections find issues');return}
  c.innerHTML=f.map(a=>{const d=Math.floor((Date.now()-new Date(a.inspDate).getTime())/864e5),cl=d>15?'over':d>10?'soon':'',tx=d>15?`${d-15}d overdue`:`${15-d}d left`;
  return`<div class="fu-card" onclick="viewDet('${a.id}')"><div class="fu-bar ${a.priority.toLowerCase()}"></div><div class="fu-info"><div class="fu-t">${a.id} — ${a.name}</div><div class="fu-s">${a.address}</div></div><div class="fu-due ${cl}">${tx}</div></div>`}).join('');
}

// ===== NOC =====
function renderNOC(){
  const f=apps.filter(a=>a.status==='noc-issued');
  document.getElementById('nocGrid').innerHTML=f.length?f.slice(0,6).map(a=>`<div class="noc-card"><div class="noc-wm">NOC</div><div class="noc-top"><span class="noc-no">${a.nocNo}</span><span class="sbadge noc-issued"><span class="dot"></span>Active</span></div><div class="app-nm">${a.name}</div><div class="noc-addr">${a.address}</div><div class="noc-meta"><span><i class="fas fa-calendar"></i> ${fDt(a.nocIssued)}</span><span><i class="fas fa-clock"></i> ${fDt(a.nocValid)}</span></div></div>`).join(''):'';
  const tb=document.getElementById('nocTb');
  if(!f.length){tb.innerHTML=`<tr><td colspan="6">${emptyDiv('fa-certificate','No NOCs issued yet','Approve an application first, then issue NOC')}</td></tr>`;return}
  tb.innerHTML=f.map(a=>{const i=apps.indexOf(a);return`<tr>
    <td><span class="app-id">${a.nocNo}</span></td>
    <td><div class="app-cell"><div class="app-av" style="background:${acol(i)}">${ini(a.name)}</div><div class="app-nm">${a.name}</div></div></td>
    <td>${a.type}</td>
    <td style="font-family:'JetBrains Mono',monospace;font-size:.8rem">${fDt(a.nocIssued)}</td>
    <td style="font-family:'JetBrains Mono',monospace;font-size:.8rem">${fDt(a.nocValid)}</td>
    <td><div class="tbl-acts"><button class="btn-i" onclick="viewDet('${a.id}')"><i class="fas fa-eye"></i></button><button class="btn-i" onclick="showToast('${a.nocNo} sent to printer','info')"><i class="fas fa-print"></i></button></div></td></tr>`}).join('');
}

// ===== STATS =====
function updStats(){
  const t=apps.length,ins=apps.filter(a=>a.status==='inspection').length,fu=apps.filter(a=>a.status==='followup').length,noc=apps.filter(a=>a.status==='noc-issued').length;
  document.getElementById('sTotal').textContent=t;document.getElementById('sInsp').textContent=ins;
  document.getElementById('sFu').textContent=fu;document.getElementById('sNoc').textContent=noc;
  document.getElementById('navAppCt').textContent=t;document.getElementById('navInspCt').textContent=ins;
  document.getElementById('navFuCt').textContent=fu;document.getElementById('navNocCt').textContent=noc;
}

function refresh(){updStats();renderApp();renderInsp();renderFu();renderNOC();updateCharts()}

// ===== CHARTS =====
let tChI,sChI,bChI,iChI;
function initCharts(){
  const tc=document.getElementById('trendCh').getContext('2d'),gr=tc.createLinearGradient(0,0,0,240);
  gr.addColorStop(0,'rgba(245,158,11,.2)');gr.addColorStop(1,'rgba(245,158,11,0)');
  tChI=new Chart(tc,{type:'line',data:{labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],datasets:[
    {label:'Applications',data:[0,0,0,0,0,0,0,0,0,0,0,0],borderColor:'#f59e0b',backgroundColor:gr,fill:true,tension:.4,borderWidth:2,pointRadius:3,pointBackgroundColor:'#f59e0b',pointBorderColor:'#08080b',pointBorderWidth:2},
    {label:'NOCs',data:[0,0,0,0,0,0,0,0,0,0,0,0],borderColor:'#22c55e',backgroundColor:'transparent',fill:false,tension:.4,borderWidth:2,pointRadius:3,pointBackgroundColor:'#22c55e',pointBorderColor:'#08080b',pointBorderWidth:2,borderDash:[4,4]}
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#9d9bab',font:{family:'Outfit',size:11},usePointStyle:true,pointStyle:'circle',padding:14}}},scales:{x:{grid:{color:'rgba(37,37,48,.6)',drawBorder:false},ticks:{color:'#5e5d6e',font:{family:'Outfit',size:10}}},y:{grid:{color:'rgba(37,37,48,.6)',drawBorder:false},ticks:{color:'#5e5d6e',font:{family:'JetBrains Mono',size:10}},beginAtZero:true}}}});
  sChI=new Chart(document.getElementById('statusCh'),{type:'doughnut',data:{labels:['Pending','Inspection','Follow-up','Approved','NOC','Rejected'],datasets:[{data:[0,0,0,0,0,0],backgroundColor:['#f97316','#38bdf8','#a78bfa','#22c55e','#f59e0b','#ef4444'],borderColor:'#15151d',borderWidth:3,hoverOffset:5}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{color:'#9d9bab',font:{family:'Outfit',size:10},usePointStyle:true,pointStyle:'circle',padding:10}}}}});
}
function updateCharts(){
  if(!sChI)return;
  sChI.data.datasets[0].data=[apps.filter(a=>a.status==='pending').length,apps.filter(a=>a.status==='inspection').length,apps.filter(a=>a.status==='followup').length,apps.filter(a=>a.status==='approved').length,apps.filter(a=>a.status==='noc-issued').length,apps.filter(a=>a.status==='rejected').length];
  sChI.update();
}
function initRepCharts(){
  if(bChI)return;
  const types=['Commercial','Residential','Industrial','Hospital','Educational','Hotel','Warehouse'];
  bChI=new Chart(document.getElementById('bldCh'),{type:'bar',data:{labels:types,datasets:[{label:'Applications',data:types.map(t=>apps.filter(a=>a.type===t).length),backgroundColor:['rgba(245,158,11,.65)','rgba(34,197,94,.65)','rgba(239,68,68,.65)','rgba(56,189,248,.65)','rgba(167,139,250,.65)','rgba(249,115,22,.65)','rgba(236,72,153,.65)'],borderRadius:5,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(37,37,48,.6)',drawBorder:false},ticks:{color:'#5e5d6e',font:{family:'JetBrains Mono',size:10}}},y:{grid:{display:false},ticks:{color:'#9d9bab',font:{family:'Outfit',size:11}}}}}});
  const insps=['Vikram Singh','Priya Patel','Amit Kumar','Sneha Reddy','Rahul Joshi'];
  iChI=new Chart(document.getElementById('inspCh'),{type:'bar',data:{labels:insps,datasets:[{label:'Assigned',data:insps.map(ins=>apps.filter(a=>a.inspector===ins).length),backgroundColor:'rgba(245,158,11,.65)',borderRadius:4,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#9d9bab',font:{family:'Outfit',size:11},usePointStyle:true,pointStyle:'circle',padding:14}}},scales:{x:{grid:{display:false},ticks:{color:'#9d9bab',font:{family:'Outfit',size:10}}},y:{grid:{color:'rgba(37,37,48,.6)',drawBorder:false},ticks:{color:'#5e5d6e',font:{family:'JetBrains Mono',size:10}},beginAtZero:true}}}});
}

// ===== KEYBOARD =====
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.m-overlay.open').forEach(m=>closeM(m.id));if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();document.getElementById('gSearch').focus()}});

// ===== INIT =====
document.addEventListener('DOMContentLoaded',()=>{refresh();initCharts()});