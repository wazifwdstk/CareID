/* CareID features */
const $=s=>document.querySelector(s);
const store={get(k,d){try{const v=localStorage.getItem('careid2:'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('careid2:'+k,JSON.stringify(v));return true}catch(e){return false}}};
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,3000)}
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const list=s=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean);
const todayStr=()=>new Date().toISOString().slice(0,10);
const fmtD=d=>{if(!d)return '—';const x=new Date(d);return isNaN(x)?d:x.toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'})};
const fmtM=m=>{if(!m)return '—';const x=new Date(m+'-01');return isNaN(x)?m:x.toLocaleDateString('en-MY',{month:'short',year:'numeric'})};
const uid=()=>Math.random().toString(36).slice(2,9);

/* ================= DATA ================= */
let profile=store.get('profile',{name:'Aiman Hakimi bin Rosli',dob:'2004-03-12',weight:68,blood:'O+',thal:'Not a carrier',hiv:'Negative',hivDate:'2025-06',hivShare:false,
  allergy:'Penicillin, Peanuts',cond:'Asthma (mild)',organ:'Pledged',bloodDonor:'Regular donor',lastDon:'2026-07-18',donCount:6});
const now=Date.now(),H=3600000,D=24*H;
let meds=store.get('meds',[
 {id:'m1',name:'Cetirizine 10 mg',dose:'1 tablet',freq:1,by:'Klinik Kesihatan Bangi',start:'2026-10-10',status:'active',taken:[now-D-2*H]},
 {id:'m2',name:'Salbutamol inhaler 100 mcg',dose:'2 puffs',freq:0,by:'Klinik Kesihatan Bangi',start:'2026-03-02',status:'active',taken:[now-3*D]},
 {id:'m3',name:'Vitamin D3 1000 IU',dose:'1 capsule',freq:1,by:'Self (over the counter)',start:'2026-09-01',status:'active',taken:[]},
 {id:'m4',name:'Paracetamol 500 mg',dose:'2 tablets',freq:4,by:'Hospital Kajang',start:'2026-08-14',status:'completed',taken:[]},
 {id:'m5',name:'Erythromycin 250 mg',dose:'1 tablet',freq:4,by:'Klinik Kesihatan Bangi',start:'2025-06-12',status:'completed',taken:[]}]);
let vaccines=store.get('vaccines',[
 {id:'v1',name:'Influenza (quadrivalent)',dose:'Annual',date:'2025-11-20',next:'2026-11',place:'Klinik Kesihatan Bangi'},
 {id:'v2',name:'Tetanus booster (Tdap)',dose:'Booster',date:'2024-09-30',next:'2034-09',place:'Klinik Kesihatan Bangi'},
 {id:'v3',name:'COVID-19 (Comirnaty)',dose:'Booster',date:'2022-01-15',next:'',place:'PPV UKM Bangi'},
 {id:'v4',name:'COVID-19 (Comirnaty)',dose:'Dose 2',date:'2021-08-28',next:'',place:'PPV UKM Bangi'},
 {id:'v5',name:'MMR',dose:'Dose 2',date:'2011-04-05',next:'',place:'School immunisation'},
 {id:'v6',name:'Hepatitis B',dose:'Dose 3',date:'2004-09-12',next:'',place:'Klinik Kesihatan Bangi'},
 {id:'v7',name:'BCG',dose:'Single',date:'2004-03-13',next:'',place:'Hospital Serdang'}]);
const records=[
 {d:'2026-10-10',t:'Allergic rhinitis',s:'Klinik Kesihatan Bangi. Cetirizine 10 mg once daily for 1 month.'},
 {d:'2026-08-14',t:'Emergency visit: sprained ankle',s:'Hospital Kajang, green zone. X-ray clear. Paracetamol for 5 days.'},
 {d:'2026-07-18',t:'Blood donation',s:'Pusat Darah Negara. 450 ml. Haemoglobin 14.6 g/dL.'},
 {d:'2026-03-02',t:'Asthma review',s:'Inhaler technique checked. Salbutamol repeated.'},
 {d:'2025-06-09',t:'Allergy and blood tests',s:'Penicillin allergy confirmed. HIV screening negative.'},
 {d:'2020-07-21',t:'Thalassaemia screening (Form 4)',s:'School programme. Not a carrier.'}];
let contacts=store.get('contacts',[{name:'Rosli bin Ahmad',rel:'Father',phone:'+60 12-480 2231'},{name:'Norhayati binti Ismail',rel:'Mother',phone:'+60 13-722 9104'},{name:'Nur Aina Rosli',rel:'Sister',phone:'+60 11-3301 5567'}]);
let receipts=store.get('receipts',null);
let ticket=store.get('ticket',null);

/* ================= SAMPLE RECEIPT IMAGE ================= */
function sampleReceipt(clinic,lines,total,date){
  const c=document.createElement('canvas');c.width=360;c.height=480;const x=c.getContext('2d');
  x.fillStyle='#fbfaf6';x.fillRect(0,0,360,480);x.fillStyle='#222';x.textAlign='center';
  x.font='bold 17px sans-serif';x.fillText(clinic,180,44);x.font='12px sans-serif';x.fillText('Resit Rasmi / Official Receipt',180,66);x.fillText(date,180,84);
  x.strokeStyle='#999';x.setLineDash([4,4]);x.beginPath();x.moveTo(24,100);x.lineTo(336,100);x.stroke();
  x.textAlign='left';x.font='14px monospace';let y=130;
  lines.forEach(([a,b])=>{x.fillText(a,28,y);x.textAlign='right';x.fillText(b,332,y);x.textAlign='left';y+=28});
  x.beginPath();x.moveTo(24,y);x.lineTo(336,y);x.stroke();y+=30;x.font='bold 16px monospace';x.fillText('JUMLAH',28,y);x.textAlign='right';x.fillText(total,332,y);
  x.textAlign='center';x.font='11px sans-serif';x.fillStyle='#666';x.fillText('Sample receipt for demonstration',180,450);
  return c.toDataURL('image/jpeg',.8);
}
if(!receipts){receipts=[
  {id:'r1',clinic:'Klinik Kesihatan Bangi',date:'2026-10-10',amt:1,img:sampleReceipt('Klinik Kesihatan Bangi',[['Pendaftaran','RM 1.00'],['Cetirizine 10mg x30','RM 0.00']],'RM 1.00','10/10/2026'),sample:true},
  {id:'r2',clinic:'Hospital Kajang',date:'2026-08-14',amt:15,img:sampleReceipt('Hospital Kajang',[['Jabatan Kecemasan','RM 5.00'],['X-ray ankle','RM 10.00'],['Paracetamol','RM 0.00']],'RM 15.00','14/08/2026'),sample:true}];}

/* ================= HOSPITALS ================= */
const hospitals=[
 {id:'hkl',name:'Hospital Kuala Lumpur',short:'HKL',addr:'Jalan Pahang, Kuala Lumpur',lat:3.1716,lng:101.7016,cap:120,z:{red:9,yellow:34,green:58}},
 {id:'hctm',name:'Hospital Canselor Tuanku Muhriz (HCTM UKM)',short:'HCTM UKM',addr:'Bandar Tun Razak, Cheras, Kuala Lumpur',lat:3.0976,lng:101.7258,cap:80,z:{red:5,yellow:21,green:30}},
 {id:'hsb',name:'Hospital Sungai Buloh',short:'Sg Buloh',addr:'Jalan Hospital, Sungai Buloh, Selangor',lat:3.2187,lng:101.5838,cap:90,z:{red:4,yellow:15,green:24}},
 {id:'hkj',name:'Hospital Kajang',short:'Kajang',addr:'Jalan Semenyih, Kajang, Selangor',lat:2.9938,lng:101.7887,cap:60,z:{red:3,yellow:14,green:31}},
 {id:'hsel',name:'Hospital Selayang',short:'Selayang',addr:'Lebuhraya Selayang–Kepong, Batu Caves, Selangor',lat:3.2432,lng:101.6457,cap:70,z:{red:2,yellow:9,green:16}}];
const complaints={red:['Head injury, unconscious','Chest pain, suspected heart attack','Severe breathing difficulty','Major trauma, road accident','Stroke symptoms','Severe bleeding'],
 yellow:['Suspected forearm fracture','Abdominal pain, moderate','High fever, dehydrated','Deep laceration','Asthma attack, stable','Motorcycle fall, leg injury'],
 green:['Sprained ankle','Minor cut','Sore throat','Mild fever','Rash','Back pain','Small burn','Ear pain']};
const rnd=a=>a[Math.floor(Math.random()*a.length)];
let caseN=4100;
function mkPatient(zone,mins){caseN+=Math.floor(Math.random()*7)+1;return{id:'ED-'+caseN,zone,c:rnd(complaints[zone]),since:Date.now()-mins*60000}}
hospitals.forEach(h=>{h.pts=[];['red','yellow','green'].forEach(z=>{for(let i=0;i<h.z[z];i++)h.pts.push(mkPatient(z,Math.floor(Math.random()*(z==='green'?150:z==='yellow'?80:40))))});
 h.hist=Array.from({length:24},(_,i)=>Math.max(5,h.pts.length+Math.round(Math.sin(i/3)*8+(i-24)*.4+Math.random()*6)));h.arr=Math.round(h.pts.length*.25);h.amb=Math.floor(Math.random()*4);
 h.serving=1000+Math.floor(Math.random()*400)});
if(ticket){const th=hospitals.find(h=>h.id===ticket.hosp);if(th)th.serving=ticket.serving;else ticket=null}
let selHosp=store.get('selHosp',null);if(selHosp&&!hospitals.find(h=>h.id===selHosp))selHosp=null;

/* ================= MAPS ================= */
const YOU={lat:3.2516,lng:101.7346};
let pin={lat:3.1600,lng:101.7190};
const AREAS=[['Kuala Lumpur',3.147,101.672],['Petaling Jaya',3.107,101.607],['Shah Alam',3.073,101.518],['Gombak',3.29,101.715],['Selayang',3.275,101.66],['Sungai Buloh',3.195,101.548],['Ampang',3.15,101.775],['Cheras',3.065,101.76],['Puchong',3.025,101.62],['Kajang',2.975,101.815],['Bangi',2.925,101.765],['Putrajaya',2.926,101.69],['Semenyih',2.952,101.855],['Kepong',3.212,101.625],['Subang',3.06,101.575]];
function km(a,b){const t=Math.PI/180,dLa=(b.lat-a.lat)*t,dLo=(b.lng-a.lng)*t,x=Math.sin(dLa/2)**2+Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.sin(dLo/2)**2;return 2*6371*Math.asin(Math.sqrt(x))}
const driveMin=d=>Math.round(d*1.3/40*60+4);
const nearestArea=p=>AREAS.map(a=>({n:a[0],d:km(p,{lat:a[1],lng:a[2]})})).sort((a,b)=>a.d-b.d)[0].n;
const mapLinks=h=>`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name)}" target="_blank" rel="noopener">Google Maps</a><a href="https://waze.com/ul?ll=${h.lat},${h.lng}&navigate=yes" target="_blank" rel="noopener">Waze</a>`;
const BB={s:2.89,n:3.31,w:101.48,e:101.88},KLAT=Math.cos(3.1*Math.PI/180);
function proj(svg){const W=Math.max(280,Math.round(svg.clientWidth||600)),H=Math.round(Math.min(Math.max(W*.8,300),430)),pad=16,gw=(BB.e-BB.w)*KLAT,gh=BB.n-BB.s,sc=Math.min((W-2*pad)/gw,(H-2*pad)/gh),ox=(W-gw*sc)/2,oy=(H-gh*sc)/2;
  return{W,H,sc,x:lng=>ox+(lng-BB.w)*KLAT*sc,y:lat=>oy+(BB.n-lat)*sc,inv:(px,py)=>({lng:BB.w+(px-ox)/(KLAT*sc),lat:BB.n-(py-oy)/sc})}}
const lvlColor=h=>{const r=h.pts.length/h.cap;return r>=.9?'var(--red)':r>=.65?'var(--yellow)':'var(--green)'};
function drawMap(svg,o){
  const P=proj(svg),{W,H}=P,tl=P.inv(0,0),br=P.inv(W,H);let s='';
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('height',H);
  s+=`<rect width="${W}" height="${H}" fill="var(--sunk)"/>`;
  for(let g=Math.ceil(br.lat*20)/20;g<=tl.lat;g+=.05)s+=`<line x1="0" x2="${W}" y1="${P.y(g).toFixed(1)}" y2="${P.y(g).toFixed(1)}" stroke="var(--line)" stroke-width="1"/>`;
  for(let g=Math.ceil(tl.lng*20)/20;g<=br.lng;g+=.05)s+=`<line y1="0" y2="${H}" x1="${P.x(g).toFixed(1)}" x2="${P.x(g).toFixed(1)}" stroke="var(--line)" stroke-width="1"/>`;
  AREAS.forEach(([n,la,ln])=>{s+=`<text x="${P.x(ln).toFixed(1)}" y="${P.y(la).toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="1" fill="var(--muted)" opacity=".75" font-family="Figtree,system-ui,sans-serif">${n.toUpperCase()}</text>`});
  const sb=10/111*P.sc;s+=`<g font-family="Figtree,system-ui,sans-serif" font-size="11" fill="var(--muted)"><line x1="14" x2="${(14+sb).toFixed(1)}" y1="${H-14}" y2="${H-14}" stroke="var(--muted)" stroke-width="2"/><text x="14" y="${H-20}">10 km</text><text x="${W-16}" y="22" text-anchor="end" font-weight="700">N ↑</text></g>`;
  if(o.route){const a=o.route.from,b=o.route.to;s+=`<line x1="${P.x(a.lng)}" y1="${P.y(a.lat)}" x2="${P.x(b.lng)}" y2="${P.y(b.lat)}" stroke="var(--accent)" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>`}
  const font='font-family="Figtree,system-ui,sans-serif"';
  hospitals.forEach(h=>{const x=P.x(h.lng),y=P.y(h.lat),sel=o.sel===h.id,r=sel?12:9;
    s+=`<g data-h="${h.id}" role="button" aria-label="${esc(h.name)}">${sel?`<circle cx="${x}" cy="${y}" r="${r+5}" fill="none" stroke="var(--accent)" stroke-width="3"/>`:''}<circle cx="${x}" cy="${y}" r="${r+8}" fill="transparent"/><circle cx="${x}" cy="${y}" r="${r}" fill="${lvlColor(h)}" stroke="var(--surface)" stroke-width="2.5"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="${sel?12:10}" font-weight="800" fill="var(--surface)" ${font}>H</text><text class="lbl" x="${x+r+6}" y="${y+4}" font-size="12.5" font-weight="${sel?800:600}" fill="var(--ink)" ${font}>${esc(h.short)}${o.counts?` · ${h.pts.length}`:''}</text></g>`});
  if(o.you){const x=P.x(YOU.lng),y=P.y(YOU.lat);s+=`<circle cx="${x}" cy="${y}" r="13" fill="var(--accent)" opacity=".18"/><circle cx="${x}" cy="${y}" r="6.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2.5"/><text class="lbl" x="${x+12}" y="${y-8}" font-size="12" font-weight="700" fill="var(--accent)" ${font}>You</text>`}
  if(o.pin){const x=P.x(o.pin.lng),y=P.y(o.pin.lat);s+=`<path d="M${x} ${y} l-9 -16 a10 10 0 1 1 18 0 z" fill="var(--red)" stroke="var(--surface)" stroke-width="2"/><circle cx="${x}" cy="${y-21}" r="3.5" fill="var(--surface)"/><text class="lbl" x="${x+12}" y="${y-18}" font-size="12" font-weight="800" fill="var(--red)" ${font}>Emergency</text>`}
  if(o.amb){const x=P.x(o.amb.lng),y=P.y(o.amb.lat);s+=`<g><rect x="${x-11}" y="${y-8}" width="22" height="16" rx="4" fill="var(--surface)" stroke="var(--red)" stroke-width="2"/><path d="M${x} ${y-5}v10M${x-5} ${y}h10" stroke="var(--red)" stroke-width="2.5"/></g><text class="lbl" x="${x+15}" y="${y+4}" font-size="11.5" font-weight="700" fill="var(--ink)" ${font}>Ambulance</text>`}
  svg.innerHTML=s;return P;
}
function drawTMap(){drawMap($('#tMap'),{sel:selHosp,you:true,counts:true})}
function drawAMap(){
  const hid=inc?inc.hosp:$('#aHosp').value,h=hospitals.find(x=>x.id===hid),from=inc?{lat:inc.lat,lng:inc.lng}:pin;
  let amb=null;if(inc&&inc.stage>=2){const p=inc.stage>=3?1:(inc.prog||0);amb={lat:from.lat+(h.lat-from.lat)*p,lng:from.lng+(h.lng-from.lng)*p}}
  drawMap($('#aMap'),{sel:hid,pin:from,route:{from,to:h},amb});
  const near=hospitals.map(x=>({h:x,d:km(from,x)})).sort((a,b)=>a.d-b.d);const d=km(from,h);
  $('#aNear').innerHTML=inc&&inc.stage===2?`Ambulance on the way to <b>${esc(h.short)}</b>, ${d.toFixed(1)} km, about ${driveMin(d)} min.`:inc&&inc.stage>=3?`Arrived at <b>${esc(h.name)}</b>.`:`Nearest: ${near.slice(0,3).map(n=>`${esc(n.h.short)} ${n.d.toFixed(1)} km`).join(' · ')}. Route to ${esc(h.short)}: ${d.toFixed(1)} km, about ${driveMin(d)} min.`;
}
let ambRaf=0;
function startAmb(){cancelAnimationFrame(ambRaf);const t0=performance.now(),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step=t=>{if(!inc||inc.stage!==2)return;inc.prog=reduce?.6:Math.min(.9,(t-t0)/15000);drawAMap();if(!reduce&&inc.prog<.9)ambRaf=requestAnimationFrame(step)};ambRaf=requestAnimationFrame(step)}
$('#tMap').addEventListener('click',e=>{const g=e.target.closest('[data-h]');if(!g)return;selHosp=g.dataset.h;store.set('selHosp',selHosp);renderTraffic()});
$('#aMap').addEventListener('click',e=>{if(inc){toast('Clear the current emergency to move the pin');return}
  const svg=$('#aMap'),r=svg.getBoundingClientRect(),P=proj(svg),f=P.W/r.width,pt=P.inv((e.clientX-r.left)*f,(e.clientY-r.top)*f);
  if(pt.lat<BB.s-.05||pt.lat>BB.n+.05||pt.lng<BB.w-.08||pt.lng>BB.e+.08)return;pin=pt;
  $('#aLoc').value=`Near ${nearestArea(pin)} (${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)})`;
  $('#aHosp').value=hospitals.map(x=>({h:x,d:km(pin,x)})).sort((a,b)=>a.d-b.d)[0].h.id;drawAMap();toast('Pin dropped. Nearest hospital selected.')});
let rsT;window.addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(()=>{drawTMap();drawAMap()},150)});

/* ================= ALLERGY CHECK ================= */
const families={penicillin:/penicillin|amoxi|ampicillin|cloxacillin|augmentin|piperacillin/i,peanut:/peanut|arachis/i,sulfa:/sulfa|sulpha|co-trimoxazole|bactrim/i,aspirin:/aspirin|acetylsalicylic/i};
function allergyConflict(name){for(const a of list(profile.allergy)){const k=Object.keys(families).find(f=>a.toLowerCase().includes(f));const re=k?families[k]:new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i');if(re.test(name))return a}return null}

/* ================= MY HEALTH RENDER ================= */
const isToday=t=>new Date(t).toDateString()===new Date().toDateString();
function age(dob){const d=new Date(dob);if(isNaN(d))return '';const n=new Date();let a=n.getFullYear()-d.getFullYear();if(n<new Date(n.getFullYear(),d.getMonth(),d.getDate()))a--;return a}
function kv(rows){return rows.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}
function renderProfile(){
  const p=profile,al=list(p.allergy),cd=list(p.cond);
  $('#hdrName').textContent=p.name;
  const hr=new Date().getHours();$('#greet').textContent=(hr<12?'Good morning, ':hr<19?'Good afternoon, ':'Good evening, ')+(p.name.split(' ')[0]||'there');
  $('#sBlood').textContent=p.blood;$('#sThal').textContent='Thalassaemia: '+p.thal.toLowerCase();
  $('#sAllergyN').textContent=al.length;$('#sAllergy').textContent=al.join(', ')||'None recorded';
  $('#vBasic').innerHTML=kv([['Full name',esc(p.name)],['Date of birth',fmtD(p.dob)+(age(p.dob)!==''?` <span class="small">(${age(p.dob)} years)</span>`:'')],['Weight',esc(p.weight)+' kg']]);
  const hivPill=p.hiv==='Negative'?'z-green':p.hiv==='HIV positive'||p.hiv==='AIDS'?'z-yellow':'z-mute';
  $('#vBlood').innerHTML=kv([['Blood type',`<span style="font-family:var(--f-display);font-size:20px">${esc(p.blood)}</span>`],['Thalassaemia',esc(p.thal)],
    ['HIV / AIDS',`<span class="pill ${hivPill}">${esc(p.hiv)}</span> <span class="small">${p.hivDate?'tested '+fmtM(p.hivDate):''}</span><br><span class="small">${p.hivShare?'Shared with responders':'Private: hidden from responders'}</span>`]]);
  $('#vCond').innerHTML=kv([['Allergies',al.length?`<div class="tags">${al.map(a=>`<span class="tag warn">${esc(a)}</span>`).join('')}</div>`:'None'],['Conditions',cd.length?`<div class="tags">${cd.map(a=>`<span class="tag">${esc(a)}</span>`).join('')}</div>`:'None']]);
  $('#vDonor').innerHTML=kv([['Organ donor',`<span class="pill ${p.organ==='Pledged'?'z-green':'z-mute'}">${esc(p.organ)}</span>`],['Blood donor',`${esc(p.bloodDonor)}${p.donCount?` <span class="small">· ${esc(p.donCount)} donations</span>`:''}`],['Last donation',fmtD(p.lastDon)+(p.lastDon?` <span class="small">· next eligible ${fmtD(new Date(new Date(p.lastDon).getTime()+90*D).toISOString().slice(0,10))}</span>`:'')]]);
  // responder view
  $('#rBlood').textContent=p.blood;$('#rOrgan').textContent=p.organ;
  $('#rAllergy').innerHTML=al.map(a=>`<span class="tag warn">${esc(a)}</span>`).join('')||'<span class="small">None recorded</span>';
  const cTags=[...cd.map(c=>`<span class="tag">${esc(c)}</span>`)];
  if(p.thal!=='Not a carrier'&&p.thal!=='Not screened')cTags.push(`<span class="tag warn">${esc(p.thal)}</span>`);else cTags.push(`<span class="tag">Thalassaemia: ${esc(p.thal.toLowerCase())}</span>`);
  cTags.push(p.hivShare?`<span class="tag ${p.hiv==='Negative'?'':'warn'}">HIV: ${esc(p.hiv)}</span>`:`<span class="tag" style="opacity:.75">HIV status: private</span>`);
  $('#rCond').innerHTML=cTags.join('');
  $('#rMeds').innerHTML=meds.filter(m=>m.status==='active').map(m=>`<span class="tag">${esc(m.name)}</span>`).join('')||'<span class="small">None</span>';
  $('#hivShare').checked=!!p.hivShare;
}
function fillForm(){const p=profile;$('#pName').value=p.name;$('#pDob').value=p.dob;$('#pWeight').value=p.weight;$('#pBlood').value=p.blood;$('#pThal').value=p.thal;$('#pHiv').value=p.hiv;$('#pHivDate').value=p.hivDate||'';$('#pAllergy').value=p.allergy;$('#pCond').value=p.cond;$('#pOrgan').value=p.organ;$('#pBloodDonor').value=p.bloodDonor;$('#pLastDon').value=p.lastDon||'';$('#pDonCount').value=p.donCount||0}
function setEdit(on){$('#profView').hidden=on;$('#profForm').hidden=!on;$('#editBtn').hidden=on;if(on)fillForm()}
$('#editBtn').addEventListener('click',()=>setEdit(true));
$('#cancelEdit').addEventListener('click',()=>setEdit(false));
$('#profForm').addEventListener('submit',e=>{e.preventDefault();
  profile={...profile,name:$('#pName').value.trim()||profile.name,dob:$('#pDob').value,weight:$('#pWeight').value,blood:$('#pBlood').value,thal:$('#pThal').value,hiv:$('#pHiv').value,hivDate:$('#pHivDate').value,allergy:$('#pAllergy').value,cond:$('#pCond').value,organ:$('#pOrgan').value,bloodDonor:$('#pBloodDonor').value,lastDon:$('#pLastDon').value,donCount:$('#pDonCount').value};
  store.set('profile',profile);setEdit(false);renderAllHealth();toast('Profile saved')});
$('#hivShare').addEventListener('change',e=>{profile.hivShare=e.target.checked;store.set('profile',profile);renderProfile();toast(e.target.checked?'HIV status will be shared with responders':'HIV status is now private')});

/* medicines */
function medRow(m,done){
  const today=m.taken.filter(isToday).length,last=m.taken.length?Math.max(...m.taken):null,conflict=allergyConflict(m.name);
  const freqTxt=m.freq==0?'As needed':m.freq==1?'Once a day':m.freq==2?'Twice a day':m.freq+' times a day';
  const dots=m.freq>0?`<span class="dots" aria-label="${today} of ${m.freq} doses taken today">${Array.from({length:m.freq},(_,i)=>`<i class="${i<today?'on':''}"></i>`).join('')}</span>`:'';
  const full=m.freq>0&&today>=m.freq;
  return `<div class="med"><div style="min-width:0"><div class="nm">${esc(m.name)}</div><div class="small">${esc(m.dose)} · ${freqTxt} · ${esc(m.by)}</div>
   ${conflict?`<div class="tags" style="margin-top:4px"><span class="tag warn">Conflicts with ${esc(conflict)} allergy. Check with your doctor.</span></div>`:''}
   ${done?`<div class="small">Started ${fmtD(m.start)} · completed</div>`:`<div class="small" style="margin-top:2px">${last?'Last taken '+(isToday(last)?'today ':new Date(last).toLocaleDateString('en-MY',{day:'numeric',month:'short'})+' ')+new Date(last).toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'}):'Not taken yet'}</div>`}</div>
   <div style="display:grid;gap:6px;justify-items:end;align-content:start">${done?`<span class="pill z-mute">Completed</span>`:`${dots}<button class="btn sm ${full?'ghost':''}" type="button" data-take="${m.id}" ${full?'disabled':''}>${full?'All doses taken':'Mark dose taken'}</button><button class="btn ghost sm" type="button" data-finish="${m.id}" style="border:0;padding:2px 0">Finish course</button>`}</div></div>`;
}
function renderMeds(){
  const act=meds.filter(m=>m.status==='active'),done=meds.filter(m=>m.status!=='active');
  $('#medList').innerHTML=act.map(m=>medRow(m,false)).join('')||'<p class="empty">No active prescriptions.</p>';
  $('#medDone').innerHTML=done.map(m=>medRow(m,true)).join('')||'<p class="empty">None yet.</p>';
  const sched=act.filter(m=>m.freq>0),need=sched.reduce((a,m)=>a+ +m.freq,0),got=sched.reduce((a,m)=>a+Math.min(m.freq,m.taken.filter(isToday).length),0);
  $('#sMeds').textContent=got+'/'+need;$('#sMedsS').textContent=need&&got>=need?'All doses taken today':'Scheduled doses taken today';
}
$('#medList').addEventListener('click',e=>{const t=e.target.closest('[data-take]'),f=e.target.closest('[data-finish]');
  if(t){const m=meds.find(x=>x.id===t.dataset.take);m.taken.push(Date.now());store.set('meds',meds);renderMeds();toast(m.name.split(' ')[0]+' dose recorded')}
  if(f){const m=meds.find(x=>x.id===f.dataset.finish);m.status='completed';store.set('meds',meds);renderMeds();renderProfile();toast(m.name.split(' ')[0]+' moved to completed')}});
$('#medForm').addEventListener('submit',e=>{e.preventDefault();const m={id:uid(),name:$('#mName').value.trim(),dose:$('#mDose').value.trim(),freq:+$('#mFreq').value,by:$('#mBy').value.trim()||'Not stated',start:todayStr(),status:'active',taken:[]};
  meds.unshift(m);store.set('meds',meds);e.target.reset();renderMeds();renderProfile();const c=allergyConflict(m.name);toast(c?`Warning: ${m.name} may conflict with your ${c} allergy`:'Prescription added')});

/* vaccines */
function renderVaccines(){
  const v=[...vaccines].sort((a,b)=>b.date.localeCompare(a.date)),nowM=new Date();
  $('#vacBody').innerHTML=v.map(x=>{let due='<span class="small">—</span>';if(x.next){const nd=new Date(x.next+'-01'),diff=(nd-nowM)/D;due=diff<0?`<span class="pill z-red">Overdue · ${fmtM(x.next)}</span>`:diff<60?`<span class="pill z-yellow">Due ${fmtM(x.next)}</span>`:`<span class="small">${fmtM(x.next)}</span>`}
   return `<tr><td><b>${esc(x.name)}</b><div class="small">${esc(x.place)}</div></td><td>${esc(x.dose)}</td><td class="num">${fmtD(x.date)}</td><td>${due}</td></tr>`}).join('');
  const soon=vaccines.filter(x=>x.next&&(new Date(x.next+'-01')-nowM)/D<60).length;
  $('#vacSum').textContent=`${vaccines.length} doses recorded`+(soon?` · ${soon} due soon`:' · nothing due soon');
}
$('#vacForm').addEventListener('submit',e=>{e.preventDefault();vaccines.push({id:uid(),name:$('#vName').value.trim(),dose:$('#vDose').value.trim(),date:$('#vDate').value,next:$('#vNext').value,place:$('#vPlace').value.trim()||'Not stated'});store.set('vaccines',vaccines);e.target.reset();renderVaccines();toast('Vaccination added')});

/* records */
$('#recList').innerHTML=records.map(r=>`<li><time>${r.d}</time><div><h3>${esc(r.t)}</h3><span class="small">${esc(r.s)}</span></div></li>`).join('');

/* receipts */
function saveReceipts(){if(!store.set('receipts',receipts))toast('Receipt kept for this visit only. Browser storage is full.')}
function renderReceipts(){
  const r=[...receipts].sort((a,b)=>b.date.localeCompare(a.date)),yr=new Date().getFullYear();
  $('#rcList').innerHTML=r.map(x=>`<button class="thumb" type="button" data-rc="${x.id}"><img src="${x.img}" alt="Receipt from ${esc(x.clinic)}"><span><b>${esc(x.clinic)}</b><span class="small">${fmtD(x.date)} · RM ${(+x.amt).toFixed(2)}${x.sample?' · sample':''}</span></span></button>`).join('')||'<p class="empty">No receipts yet. Upload a photo of your first one below.</p>';
  const tot=receipts.filter(x=>x.date.startsWith(String(yr))).reduce((a,x)=>a+ +x.amt,0);
  $('#rcSum').textContent=`${receipts.length} receipt${receipts.length===1?'':'s'} · RM ${tot.toFixed(2)} spent in ${yr}`;
}
function shrink(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=rej;fr.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{const s=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.72))};im.src=fr.result};fr.readAsDataURL(file)})}
$('#rcForm').addEventListener('submit',async e=>{e.preventDefault();const f=$('#rcFile').files[0];if(!f)return;
  try{const img=await shrink(f);receipts.push({id:uid(),clinic:$('#rcClinic').value.trim(),date:$('#rcDate').value,amt:+$('#rcAmt').value||0,img});saveReceipts();e.target.reset();renderReceipts();toast('Receipt uploaded')}
  catch(err){toast('That file could not be read as an image. Try a JPG or PNG photo.')}});
let lbId=null;
$('#rcList').addEventListener('click',e=>{const b=e.target.closest('[data-rc]');if(!b)return;const x=receipts.find(r=>r.id===b.dataset.rc);lbId=x.id;$('#lbImg').src=x.img;$('#lbTitle').textContent=x.clinic;$('#lbMeta').textContent=fmtD(x.date)+' · RM '+(+x.amt).toFixed(2);$('#lb').hidden=false;$('#lbClose').focus()});
const closeLb=()=>{$('#lb').hidden=true;lbId=null};
$('#lbClose').addEventListener('click',closeLb);$('#lb').addEventListener('click',e=>{if(e.target.id==='lb')closeLb()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#lb').hidden)closeLb()});
$('#lbDel').addEventListener('click',()=>{receipts=receipts.filter(r=>r.id!==lbId);saveReceipts();closeLb();renderReceipts();toast('Receipt deleted')});

function renderAllHealth(){renderProfile();renderMeds();renderVaccines();renderReceipts();renderQueueTile()}

/* ================= CONTACTS ================= */
function renderContacts(){
  $('#cList').innerHTML=contacts.map((c,i)=>`<div class="contact"><div class="av">${esc(c.name[0]||'?')}</div><div class="grow"><div style="font-weight:600">${esc(c.name)}</div><div class="small">${esc(c.rel)} · <span class="mono">${esc(c.phone)}</span></div><label class="lock" for="al${i}" style="margin-top:4px"><input type="checkbox" id="al${i}" data-al="${i}" ${c.alert!==false?'checked':''}> Receives emergency alerts</label></div><button class="btn ghost sm" type="button" data-rm="${i}" aria-label="Remove ${esc(c.name)}">Remove</button></div>`).join('')||'<p class="empty">No contacts yet. Add one so family can be alerted.</p>';
}
$('#cList').addEventListener('change',e=>{const i=e.target.dataset.al;if(i===undefined)return;contacts[i].alert=e.target.checked;store.set('contacts',contacts);renderIncident();toast(contacts[i].name.split(' ')[0]+(e.target.checked?' will receive alerts':' will not receive alerts'))});
$('#cList').addEventListener('click',e=>{const b=e.target.closest('[data-rm]');if(!b)return;const n=contacts[b.dataset.rm].name;contacts.splice(+b.dataset.rm,1);store.set('contacts',contacts);renderContacts();renderIncident();toast('Removed '+n)});
$('#cForm').addEventListener('submit',e=>{e.preventDefault();contacts.push({name:$('#cName').value.trim(),rel:$('#cRel').value.trim(),phone:$('#cPhone').value.trim()});store.set('contacts',contacts);e.target.reset();renderContacts();renderIncident();toast('Contact added')});

/* ================= TRAFFIC ================= */
const counts=h=>({red:h.pts.filter(p=>p.zone==='red').length,yellow:h.pts.filter(p=>p.zone==='yellow').length,green:h.pts.filter(p=>p.zone==='green').length});
function level(h){const r=h.pts.length/h.cap;return r>=.9?{t:'Very busy',c:'z-red'}:r>=.65?{t:'Busy',c:'z-yellow'}:{t:'Moderate',c:'z-green'}}
function waitGreen(h){const c=counts(h);return Math.round(20+c.green*1.1+c.yellow*.8+c.red*2)}
const ago=t=>{const m=Math.max(0,Math.round((Date.now()-t)/60000));return m<60?m+' min':Math.floor(m/60)+' h '+(m%60)+' min'};
function renderHospCards(){
  $('#tHosps').innerHTML=hospitals.map(h=>{const c=counts(h),lv=level(h),tot=h.pts.length,w=z=>(c[z]/h.cap*100).toFixed(1)+'%';
   return `<button type="button" class="hosp" data-h="${h.id}" aria-pressed="${h.id===selHosp}"><span class="nm">${esc(h.name)}</span><span class="pill ${lv.c}">${lv.t}</span><span class="small">${tot} patients · ${Math.round(tot/h.cap*100)}% full${ticket&&ticket.hosp===h.id?' · <b style="color:var(--accent)">your number '+ticket.num+'</b>':''}</span><span class="small mono">R${c.red} Y${c.yellow} G${c.green}</span><span class="load" aria-hidden="true"><span class="r" style="width:${w('red')}"></span><span class="y" style="width:${w('yellow')}"></span><span class="g" style="width:${w('green')}"></span></span></button>`}).join('');
}
function renderSpark(h){
  const W=600,Hh=110,pad=8,v=h.hist,max=Math.max(...v,h.cap*.6);
  const x=i=>pad+i*(W-2*pad)/(v.length-1),y=n=>Hh-pad-n/max*(Hh-2*pad);
  const pts=v.map((n,i)=>`${x(i).toFixed(1)},${y(n).toFixed(1)}`).join(' '),last=v.length-1;
  const grid=[.25,.5,.75].map(f=>`<line x1="0" x2="${W}" y1="${(pad+f*(Hh-2*pad)).toFixed(1)}" y2="${(pad+f*(Hh-2*pad)).toFixed(1)}" stroke="var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>`).join('');
  $('#tSpark').innerHTML=`${grid}<polygon points="${x(0)},${Hh-pad} ${pts} ${x(last)},${Hh-pad}" fill="var(--accent-soft)"/><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke"/><circle cx="${x(last)}" cy="${y(v[last])}" r="4" fill="var(--accent)"/>`;
}
function renderDetail(){
  $('#tEmpty').hidden=!!selHosp;$('#tDetail').hidden=!selHosp;if(!selHosp)return;
  const h=hospitals.find(x=>x.id===selHosp),c=counts(h),lv=level(h);
  $('#tName').textContent=h.name;$('#tAddr').textContent=h.addr+' · '+km(YOU,h).toFixed(1)+' km from you, about '+driveMin(km(YOU,h))+' min drive';$('#tLinks').innerHTML=mapLinks(h);const L=$('#tLevel');L.className='pill '+lv.c;L.textContent=lv.t;
  $('#tTotal').textContent=h.pts.length;$('#tCap').textContent='of '+h.cap+' spaces';$('#tWait').textContent=waitGreen(h);$('#tArr').textContent=h.arr;$('#tAmb').textContent=h.amb;
  renderSpark(h);
  const Z={red:{n:'Red zone',d:'Critical · seen immediately'},yellow:{n:'Yellow zone',d:'Semi-urgent · target 30 min'},green:{n:'Green zone',d:'Non-urgent · avg wait '+waitGreen(h)+' min'}};
  $('#tZones').innerHTML=['red','yellow','green'].map(z=>{const ps=h.pts.filter(p=>p.zone===z).sort((a,b)=>(b.mine?1:0)-(a.mine?1:0)||a.since-b.since);
   return `<div class="zone ${z}"><div class="zh"><h3>${Z[z].n}</h3><span class="n">${c[z]}</span></div><div class="meta">${Z[z].d}</div><ul>${ps.map(p=>`<li class="${p.mine?'mine':''}"><div class="top"><span class="mono">${p.id}</span><span class="small">${ago(p.since)}</span></div><span>${p.mine?'<b>'+esc(profile.name.split(' ')[0])+' (linked to your CareID)</b> · ':''}${esc(p.c)}</span></li>`).join('')||'<li class="empty">No patients</li>'}</ul></div>`}).join('');
  renderQueue();
}

/* ================= QUEUE ================= */
const MIN_PER=4;
function queueInfo(){if(!ticket)return null;const h=hospitals.find(x=>x.id===ticket.hosp);const ahead=Math.max(0,ticket.num-h.serving-1);return{h,ahead,wait:ahead*MIN_PER,turn:h.serving>=ticket.num-0&&h.serving>=ticket.num}}
function renderQueue(){
  if(!selHosp)return;const h=hospitals.find(x=>x.id===selHosp);
  $('#qTitle').textContent='Queue at '+h.name.replace(/ \(.*\)/,'');
  if(!ticket){
    const waiting=Math.max(3,Math.round(counts(h).green*.35+counts(h).yellow*.15));
    $('#qBox').innerHTML=`<div class="grid" style="grid-template-columns:1fr 1fr;gap:10px"><div class="stat"><div class="label">Now serving</div><div class="n mono" style="font-size:24px">${h.serving}</div></div><div class="stat"><div class="label">People waiting</div><div class="n" style="font-size:24px">${waiting}</div><div class="s">≈ ${waiting*MIN_PER} min</div></div></div>
     <form id="qForm" style="display:grid;gap:10px"><div class="field"><label for="qReason">Reason for visit</label><select id="qReason"><option value="green">Minor illness or injury (fever, sprain, small cut)</option><option value="yellow">Needs prompt care (suspected fracture, high fever, deep cut)</option></select></div>
     <div class="field"><label for="qNote">Main complaint (optional)</label><input id="qNote" placeholder="e.g. Twisted ankle playing futsal"></div>
     <button class="btn" type="submit">Get queue number</button></form>
     <p class="small" style="margin:0">Critical emergency such as chest pain, severe bleeding or unconsciousness? Do not queue. Call <b class="mono">999</b>. A nurse will confirm your zone at triage.</p>`;
    return}
  const q=queueInfo();
  if(ticket.hosp!==selHosp){$('#qBox').innerHTML=`<p style="margin:0">You already hold number <b class="mono">${ticket.num}</b> at <b>${esc(q.h.name)}</b>. You can hold one number at a time.</p><div class="row"><button class="btn ghost sm" type="button" data-goto="${q.h.id}">View that hospital</button><button class="btn danger sm" type="button" data-cancel>Cancel that number</button></div>`;return}
  $('#qBox').innerHTML=`<div class="slip"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><div class="label">Your number</div><div class="num">${ticket.num}</div></div><span class="pill ${ticket.zone==='yellow'?'z-yellow':'z-green'}">${ticket.zone==='yellow'?'Yellow':'Green'} (self-reported)</span></div>
    ${q.turn?`<div class="turn">It's your turn. Please go to the triage counter now.</div>`:''}
    <div class="grid"><div class="stat"><div class="label">Now serving</div><div class="n mono">${q.h.serving}</div></div><div class="stat"><div class="label">Ahead of you</div><div class="n">${q.ahead}</div></div><div class="stat"><div class="label">Est. wait</div><div class="n">${q.turn?'Now':q.wait+'<span style="font-size:14px"> min</span>'}</div></div></div>
    <div class="small">Issued ${new Date(ticket.at).toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'})}${ticket.note?' · '+esc(ticket.note):''}</div></div>
    <button class="btn danger sm" type="button" data-cancel style="justify-self:start">Cancel my number</button>`;
}
$('#qBox').addEventListener('submit',e=>{if(e.target.id!=='qForm')return;e.preventDefault();const h=hospitals.find(x=>x.id===selHosp);
  const waiting=Math.max(3,Math.round(counts(h).green*.35+counts(h).yellow*.15));const zone=$('#qReason').value;
  ticket={hosp:h.id,num:h.serving+waiting+(zone==='yellow'?-Math.floor(waiting/2):0)+1,zone,note:$('#qNote').value.trim(),at:Date.now(),serving:h.serving};
  store.set('ticket',ticket);renderTraffic();toast('Your queue number is '+ticket.num)});
$('#qBox').addEventListener('click',e=>{if(e.target.closest('[data-cancel]')){ticket=null;store.set('ticket',null);renderTraffic();toast('Queue number cancelled')}
  const g=e.target.closest('[data-goto]');if(g){selHosp=g.dataset.goto;store.set('selHosp',selHosp);renderTraffic()}});
function renderQueueTile(){
  if(!ticket){$('#sQueue').textContent='No number';$('#sQueueS').innerHTML='Choose a hospital in <a href="#traffic" data-tablink="traffic" style="color:var(--accent)">Hospital traffic</a>';return}
  const q=queueInfo();$('#sQueue').innerHTML=`<span class="mono" style="font-size:24px">${ticket.num}</span>`;
  $('#sQueueS').textContent=q.turn?'Your turn at '+q.h.name.replace(/ \(.*\)/,''):`${q.ahead} ahead · ≈${q.wait} min · ${q.h.name.replace(/ \(.*\)/,'')}`;
}
function renderRec(){const r=hospitals.map(h=>{const d=km(YOU,h);return{h,d,dr:driveMin(d),w:waitGreen(h)}}),best=[...r].sort((a,b)=>(a.dr+a.w)-(b.dr+b.w))[0],near=[...r].sort((a,b)=>a.d-b.d)[0];
  $('#tRec').innerHTML=`<b>Best for a non-urgent visit now:</b> ${esc(best.h.name)}, about ${best.dr} min drive + ${best.w} min wait. Nearest is ${esc(near.h.short)} (${near.d.toFixed(1)} km). For a critical emergency, call 999 or go to the nearest.`}
function renderTraffic(){drawTMap();renderRec();renderHospCards();renderDetail();renderQueueTile();$('#tUpdated').textContent='Updated '+new Date().toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
$('#tHosps').addEventListener('click',e=>{const b=e.target.closest('.hosp');if(!b)return;selHosp=b.dataset.h;store.set('selHosp',selHosp);renderTraffic()});

let paused=false;
function tick(){
  hospitals.forEach(h=>{
    const out=Math.floor(Math.random()*3);
    for(let i=0;i<out;i++){const cand=h.pts.filter(p=>!p.mine&&Date.now()-p.since>20*60000);if(cand.length)h.pts.splice(h.pts.indexOf(rnd(cand)),1)}
    if(Math.random()<.2){const r=h.pts.find(p=>p.zone==='red'&&!p.mine);if(r)r.zone='yellow'}
    const inn=Math.floor(Math.random()*3);
    for(let i=0;i<inn;i++){const r=Math.random();h.pts.push(mkPatient(r<.1?'red':r<.4?'yellow':'green',0));h.arr++}
    h.arr=Math.max(4,Math.round(h.arr*.97));h.amb=Math.max(0,Math.min(6,h.amb+Math.round(Math.random()*2-1)));
    h.hist.push(h.pts.length);h.hist.shift();
    if(Math.random()<.65)h.serving++;
  });
  if(ticket){const th=hospitals.find(h=>h.id===ticket.hosp);const was=ticket.serving<ticket.num;ticket.serving=th.serving;store.set('ticket',ticket);if(was&&th.serving>=ticket.num)toast('Number '+ticket.num+': it\'s your turn')}
  renderTraffic();
}
setInterval(()=>{if(!paused&&!document.hidden)tick()},5000);
$('#tPause').addEventListener('click',()=>{paused=!paused;$('#tPause').textContent=paused?'Resume updates':'Pause updates'});

/* ================= ACCIDENT ================= */
$('#aHosp').innerHTML=hospitals.map(h=>`<option value="${h.id}">${esc(h.name)}</option>`).join('');
let inc=null;
const stages=['Reported','Verified','Transported','Arrived and triaged'];
const zoneName={red:'Red zone (critical)',yellow:'Yellow zone (semi-urgent)',green:'Green zone (non-urgent)'};
let alertLog=store.get('alertLog',[]);
const recipients=()=>contacts.filter(c=>c.alert!==false);
const tm=t=>new Date(t).toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'});
const zoneAdvice={red:'Doctors are treating them now. Please go to the emergency counter and a staff member will update you.',yellow:'They are stable and will be seen by a doctor shortly.',green:'Their condition is not serious. They may be discharged after treatment.'};
function msgHtml(stage){
  const h=hospitals.find(x=>x.id===inc.hosp),addr=h.addr.split(' · ')[0],first=esc(profile.name.split(' ')[0]);
  const eta=driveMin(km(inc,h)),links=`<p class="maplinks">${mapLinks(h)}</p>`;
  if(stage===1)return `<p><b>${esc(profile.name)}</b> has a verified medical emergency: <b>${esc(inc.type)}</b>.</p><dl class="mk"><dt>Where</dt><dd>${esc(inc.loc)}</dd><dt>Time</dt><dd>${tm(inc.at)}</dd><dt>Hospital</dt><dd>${esc(h.name)}<br><span class="small">${esc(addr)}</span></dd><dt>Status</dt><dd>Verified by ${esc(inc.by)}. Ambulance being arranged.</dd><dt>Emergency ID</dt><dd class="mono">${inc.id}</dd></dl><p class="small">Go to the Emergency Department (Jabatan Kecemasan) and quote the emergency ID. More updates will follow.</p>${links}`;
  if(stage===2)return `<p>${first} is on the way to <b>${esc(h.name)}</b> by ambulance. Expected arrival in about ${eta} minutes.</p><p class="small">${esc(addr)} · Emergency ID <span class="mono">${inc.id}</span></p>${links}`;
  return `<p>${first} has arrived at <b>${esc(h.name)}</b> and is being treated in the <b>${zoneName[inc.zone]}</b>.</p><p>${zoneAdvice[inc.zone]}</p><p class="small">Show emergency ID <span class="mono">${inc.id}</span> at the emergency counter.</p>${links}`;
}
function idHtml(){const h=hospitals.find(x=>x.id===inc.hosp),addr=h.addr.split(' · ')[0];
  const st=inc.stage===1?'Verified. Ambulance being arranged.':inc.stage===2?'On the way to hospital by ambulance.':'At hospital, being treated in the '+zoneName[inc.zone]+'.';
  return `<p><b>${esc(profile.name)}</b> received emergency care without ID as an unidentified patient (<span class="mono">${inc.unk}</span>). They have now been identified by ${esc(inc.idMethod)}.</p><dl class="mk"><dt>Emergency</dt><dd>${esc(inc.type)}</dd><dt>Where found</dt><dd>${esc(inc.loc)} · ${tm(inc.at)}</dd><dt>Hospital</dt><dd>${esc(h.name)}<br><span class="small">${esc(addr)}</span></dd><dt>Status</dt><dd>${st}</dd><dt>Emergency ID</dt><dd class="mono">${inc.id}</dd></dl><p class="small">Go to the Emergency Department (Jabatan Kecemasan), quote the emergency ID and bring your MyKad.</p><p class="maplinks">${mapLinks(h)}</p>`}
function identify(method){if(!inc||inc.identified)return;inc.identified=true;inc.idMethod=method;if(inc.stage<1)inc.stage=1;
  const r=registry.find(x=>x.id===inc.unk);if(r)r.identified=true;
  if(inc.pid)hospitals.forEach(h=>h.pts.forEach(p=>{if(p.id===inc.pid){p.mine=true;p.c=inc.type+' (CareID '+inc.id+')'}}));
  const to=recipients().map(c=>c.name.split(' ')[0]),m={stage:inc.stage,first:true,at:Date.now(),html:idHtml(),to};inc.msgs.push(m);
  const h=hospitals.find(x=>x.id===inc.hosp);alertLog.unshift({at:m.at,title:'Emergency alert (unidentified patient now identified)',detail:`${inc.type} · ${h.name}`,id:inc.id,to});alertLog=alertLog.slice(0,30);store.set('alertLog',alertLog);
  renderAlertLog();renderIncident();renderTraffic();renderFind();
}
function sendAlert(){
  if(!inc||inc.stage<1||!inc.identified)return;const to=recipients().map(c=>c.name.split(' ')[0]);
  const m={stage:inc.stage,at:Date.now(),html:msgHtml(inc.stage),to};inc.msgs.push(m);
  const h=hospitals.find(x=>x.id===inc.hosp);
  alertLog.unshift({at:m.at,title:inc.stage===1?'Emergency alert':'Update: '+stages[inc.stage].toLowerCase(),detail:`${inc.type} · ${h.name}`,id:inc.id,to});alertLog=alertLog.slice(0,30);store.set('alertLog',alertLog);
  renderAlertLog();toast(to.length?`Alert sent to ${to.join(', ')}`:'No contacts are set to receive alerts');
}
function renderAlertLog(){
  $('#alertLog').innerHTML=alertLog.map(a=>`<li><span class="mono small">${new Date(a.at).toLocaleDateString('en-MY',{day:'numeric',month:'short'})} ${tm(a.at)}</span><div><b>${esc(a.title)}</b> <span class="small">· ${esc(a.detail)} · <span class="mono">${esc(a.id)}</span></span><div class="small">Sent to ${a.to.length?a.to.map(esc).join(', '):'nobody (no contacts set to receive alerts)'}</div></div></li>`).join('')||'<li class="empty" style="display:block">No alerts sent yet. They appear here when an emergency linked to you is verified.</li>';
}
function renderAlerts(){
  drawAMap();
  const ib=$('#aIdentBox');
  if(!inc||!inc.unknown)ib.innerHTML='';
  else if(!inc.identified){const h=hospitals.find(x=>x.id===inc.hosp);ib.innerHTML=`<div class="sms" style="margin-top:12px;border-color:var(--yellow)"><div class="hd"><b style="color:var(--yellow)">Unidentified patient · ${inc.unk}</b></div><p>No ID was found and the patient cannot speak, so CareID does not know who they are and cannot alert family yet. They are listed in the unidentified patient registry at ${esc(h.name)}.</p><div class="label" style="margin:10px 0 6px">Identify the patient</div><div class="row"><button class="btn sm" type="button" data-ident="fingerprint, matched to their MyKad record">Fingerprint check</button><button class="btn ghost sm" type="button" data-ident="scanning their CareID emergency card">Scan CareID card or QR</button><button class="btn ghost sm" type="button" data-tablink="find">Wait for family search</button></div></div>`}
  else ib.innerHTML=`<p class="small" style="margin:12px 0 0"><span class="pill z-info">Identified</span> Was ${inc.unk}. Identified by ${esc(inc.idMethod)}.</p>`;
  const box=$('#aNotif'),rc=recipients();
  const rcHtml=`<div class="row" style="margin-bottom:10px;gap:6px"><span class="small">Will be sent to:</span>${rc.length?rc.map(c=>`<span class="tag">${esc(c.name.split(' ')[0])} · ${esc(c.rel)}</span>`).join(''):'<span class="tag warn">No contacts set to receive alerts</span>'}</div>`;
  if(!inc){box.innerHTML=rcHtml+'<p class="empty">No emergency right now. Report a sample emergency to see what family receive.</p>';return}
  if(!inc.msgs.length&&!inc.identified){box.innerHTML=rcHtml+'<p class="empty">Not sent. The patient has not been identified, so CareID does not know whose family to alert. Use the identification options above, or a family search will find them.</p>';return}
  if(!inc.msgs.length){box.innerHTML=rcHtml+'<p class="empty">Waiting for verification. Family are not alerted about unconfirmed reports, so they never get false information.</p>';return}
  box.innerHTML=rcHtml+`<div class="phone">${inc.msgs.slice().reverse().map(m=>`<div class="sms ${m.stage===1||m.first?'first':''}"><div class="hd"><b>${m.stage===1||m.first?'CareID Emergency Alert':'CareID Update'}</b><span>${tm(m.at)}</span></div>${m.html}<div class="dl">${m.to.length?'Delivered to '+m.to.map(esc).join(', ')+' · SMS and app':'Not sent: no recipients'}</div></div>`).join('')}</div>${inc.stage===3?'<button class="btn ghost sm" type="button" data-tablink="traffic" style="margin-top:10px">See hospital traffic</button>':''}`;
}
function renderIncident(){
  [...$('#aSteps').children].forEach((li,i)=>{li.className=inc&&i<=inc.stage?'done':inc&&i===inc.stage+1?'now':''});
  $('#aNext').disabled=!inc||inc.stage>=3;$('#aReset').disabled=!inc;$('#aStart').disabled=!!inc;$('#aId').textContent=inc?inc.id:'No emergency';
  const ban=$('#incBanner');
  if(!inc){ban.hidden=true;renderAlerts();return}
  const h=hospitals.find(x=>x.id===inc.hosp);
  ban.hidden=false;ban.innerHTML=`<div class="card row" style="justify-content:space-between;border-color:var(--red)"><div><span class="pill z-red">Medical emergency</span> <b style="margin-left:6px">${esc(inc.type)}</b> <span class="small">· ${stages[inc.stage]} · ${esc(h.name)}</span></div><button class="btn ghost sm" type="button" data-tablink="accident">View emergency</button></div>`;
  renderAlerts();
}
$('#aForm').addEventListener('submit',e=>{e.preventDefault();inc={id:'CID-'+(2000+Math.floor(Math.random()*999))+'-'+String(Date.now()).slice(-4),type:$('#aType').value,hosp:$('#aHosp').value,zone:$('#aZone').value,loc:$('#aLoc').value.trim()||'Location not given',by:$('#aBy').value,at:Date.now(),msgs:[],stage:0};
  inc.lat=pin.lat;inc.lng=pin.lng;inc.prog=0;
  inc.unknown=$('#aIdent').value==='unknown';inc.identified=!inc.unknown;
  if(inc.unknown){inc.unk='UNK-0'+(200+Math.floor(Math.random()*99));registry.unshift({id:inc.unk,hosp:inc.hosp,sex:'Male',age:[20,30],found:inc.type+', '+inc.loc,at:inc.at,feat:$('#aDesc').value.trim()||'No description',zone:inc.zone});renderFind()}renderIncident();toast('Emergency reported')});
$('#aNext').addEventListener('click',()=>{if(!inc)return;inc.stage++;if(inc.stage===2)startAmb();
  if(inc.stage===3){const h=hospitals.find(x=>x.id===inc.hosp);const p=mkPatient(inc.zone,0);if(inc.identified){p.c=inc.type+' (CareID '+inc.id+')';p.mine=true}else p.c=inc.type+' · unidentified patient '+inc.unk;h.pts.push(p);inc.pid=p.id;selHosp=h.id;store.set('selHosp',selHosp);renderTraffic();toast('Placed in '+zoneName[inc.zone])}
  sendAlert();renderIncident()});
$('#aReset').addEventListener('click',()=>{if(inc&&inc.pid)hospitals.forEach(h=>h.pts=h.pts.filter(p=>p.id!==inc.pid));if(inc&&inc.unk)registry=registry.filter(r=>r.id!==inc.unk);inc=null;renderIncident();renderTraffic();renderFind()});
$('#aIdent').addEventListener('change',e=>{$('#aDescWrap').hidden=e.target.value!=='unknown'});
$('#aIdentBox').addEventListener('click',e=>{const b=e.target.closest('[data-ident]');if(b){identify(b.dataset.ident);toast('Patient identified. Family alerted.')}});

/* ================= FIND FAMILY (Jane / John Doe) ================= */
let registry=[
 {id:'UNK-0193',hosp:'hkl',sex:'Male',age:[25,35],found:'Road accident, Jalan Tun Razak, Kuala Lumpur',at:Date.now()-3*H,feat:'Blue denim jacket, black helmet, tattoo on left forearm',zone:'red'},
 {id:'UNK-0191',hosp:'hsel',sex:'Female',age:[18,25],found:'Fainted at LRT Gombak station',at:Date.now()-6*H,feat:'Black hoodie, white sneakers, university lanyard',zone:'green'},
 {id:'UNK-0188',hosp:'hsel',sex:'Female',age:[60,75],found:'Collapsed at Pasar Borong Selayang',at:Date.now()-15*H,feat:'Green baju kurung, grey tudung, spectacles',zone:'yellow'},
 {id:'UNK-0186',hosp:'hkj',sex:'Male',age:[40,55],found:'Fall at construction site, Semenyih',at:Date.now()-20*H,feat:'Orange safety vest, work boots',zone:'yellow'}];
let reqs={},lastQ=null;
const stop=['with','from','road','jalan','wearing','have','their','that'];
const words=s=>String(s).toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>3&&!stop.includes(w));
function match(q,r){let s=0;const why=[];
  if(q.sex!=='Not sure'){if(q.sex!==r.sex)return null;s+=3;why.push('sex')}
  if(q.age){if(q.age>=r.age[0]&&q.age<=r.age[1]){s+=3;why.push('age')}else if(q.age>=r.age[0]-5&&q.age<=r.age[1]+5){s+=1;why.push('age (close)')}else return null}
  if(q.when){if(r.at<q.when-2*H)return null;s+=1;why.push('time')}
  const lw=[...new Set(words(q.loc).filter(w=>words(r.found).includes(w)))];if(lw.length){s+=Math.min(4,lw.length*2);why.push('place ('+lw.join(', ')+')')}
  const fw=[...new Set(words(q.feat).filter(w=>words(r.feat).includes(w)))];if(fw.length){s+=Math.min(4,fw.length);why.push('description ('+fw.join(', ')+')')}
  return{s,why}}
const zp=z=>`<span class="pill ${z==='red'?'z-red':z==='yellow'?'z-yellow':'z-green'}">${z[0].toUpperCase()+z.slice(1)} zone</span>`;
function renderFind(){
  $('#unkList').innerHTML=registry.map(r=>{const h=hospitals.find(x=>x.id===r.hosp);return `<li><span class="mono small">${r.id}<br>in ${tm(r.at)}</span><div><b>${esc(h.name)}</b> ${zp(r.zone)} ${r.identified?'<span class="pill z-info">Identified</span>':reqs[r.id]?'<span class="pill z-mute">Family check requested</span>':''}<div class="small">${r.sex}, about ${r.age[0]}–${r.age[1]} · ${esc(r.found)}</div><div class="small">${esc(r.feat)}</div></div></li>`}).join('')||'<li class="empty" style="display:block">No unidentified patients right now.</li>';
  if(!lastQ){$('#fResults').innerHTML='<p class="empty">No search yet.</p>';return}
  const res=registry.map(r=>({r,m:match(lastQ,r)})).filter(x=>x.m&&x.m.s>=4).sort((a,b)=>b.m.s-a.m.s);
  $('#fSum').textContent=res.length?`${res.length} possible match${res.length>1?'es':''} for ${lastQ.name||'your family member'}`:'No matches yet';
  $('#fResults').innerHTML=res.map(({r,m})=>{const h=hospitals.find(x=>x.id===r.hosp),strong=m.s>=9;
    const act=r.identified?'<span class="pill z-info">Identified</span>':reqs[r.id]?'<span class="pill z-mute">Request sent</span>':`<button class="btn sm" type="button" data-req="${r.id}">Ask hospital to check</button>`;
    const note=reqs[r.id]&&!r.identified?`<p class="small" style="margin:6px 0 0">${esc(h.name)} emergency department will call you on <span class="mono">${esc(lastQ.phone)}</span> to arrange identification in person. Bring your MyKad and a recent photo of ${esc(lastQ.name.split(' ')[0]||'them')}.</p>`:'';
    return `<div class="med"><div style="min-width:0"><div class="nm">${esc(h.name)}</div><div class="row" style="gap:6px;margin:4px 0"><span class="pill ${strong?'z-green':'z-yellow'}">${strong?'Strong match':'Possible match'}</span>${zp(r.zone)}</div><div class="small">${r.sex}, about ${r.age[0]}–${r.age[1]} · brought in ${tm(r.at)} · ${esc(r.found)}</div><div class="small">${esc(r.feat)}</div><div class="small">Matched on ${m.why.join(', ')}</div><div class="maplinks">${mapLinks(h)}</div>${note}</div><div>${act}</div></div>`}).join('')
   ||`<p class="empty">No unidentified patient matches this description right now. CareID keeps checking new admissions and will contact you at ${esc(lastQ.phone)} if one matches. Please also make a missing person report at the nearest police station (PDRM).</p>`;
}
(function(){const d=new Date(Date.now()-5*H),p=n=>String(n).padStart(2,'0');$('#fWhen').value=`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`})();
$('#fForm').addEventListener('submit',e=>{e.preventDefault();const w=$('#fWhen').value;
  lastQ={name:$('#fName').value.trim(),sex:$('#fSex').value,age:+$('#fAge').value||0,loc:$('#fLoc').value,when:w?new Date(w).getTime():0,feat:$('#fFeat').value,phone:$('#fPhone').value.trim()||'your phone'};renderFind()});
$('#fResults').addEventListener('click',e=>{const b=e.target.closest('[data-req]');if(!b)return;const id=b.dataset.req;reqs[id]=true;
  if(inc&&inc.unk===id&&!inc.identified){identify('their family, who confirmed identity in person at the hospital');toast('Identity confirmed. Family alerts have started.')}
  else{renderFind();toast('Request sent to the hospital')}});

/* ================= TABS ================= */
const TABS=['health','contacts','accident','find','traffic'];
function show(id){document.querySelectorAll('nav.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===id));document.querySelectorAll('section.panel').forEach(s=>s.hidden=s.id!==id);window.scrollTo(0,0);if(id==='traffic')drawTMap();if(id==='accident')drawAMap()}
document.querySelector('nav.tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)show(b.dataset.tab)});
document.addEventListener('click',e=>{const a=e.target.closest('[data-tablink]');if(a){e.preventDefault();show(a.dataset.tablink)}});

renderAllHealth();renderContacts();renderIncident();renderTraffic();renderAlertLog();renderFind();
const h0=location.hash.slice(1);show(TABS.includes(h0)?h0:'health');