const $=s=>document.querySelector(s),yard=$('#yard'),canvas=document.createElement('canvas');
yard.replaceChildren(canvas);canvas.style.cssText='width:100%;height:510px;display:block;position:relative;z-index:2';canvas.setAttribute('role','img');
const ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let state,truck,motion,completion,playTimer,playing=false;
const play=document.createElement('button');play.textContent='▶ Play yard demo';play.style.cssText='position:absolute;right:20px;top:18px;z-index:5;background:#172329;color:white;border:0;border-radius:24px;padding:13px 20px;font:600 14px sans-serif;cursor:pointer';yard.append(play);
play.onclick=()=>{reset();playing=true;play.textContent='Demo running…';scene('book');playTimer=setTimeout(()=>scene('arrive'),900);};
const names={ready:'Awaiting booking',booked:'Reserved',docked:'On door',empty:'Empty · awaiting departure',departed:'Departed'};
$('.demo-actions').innerHTML=[['book','Book slot'],['arrive','Confirm arrival'],['floor','Unload + put away'],['depart','Confirm departure'],['refuse','Refuse Dock 9'],['reset','Reset']].map(([id,label])=>`<button data-scene="${id}">${label}</button>`).join('');
$('.demo-copy small').textContent='Shared demo state · simulated events · no live yard connection';
$('.facility strong').textContent='Demo yard';$('.voice-orb small').textContent='Voice preview · not connected';$('.voice-head strong').textContent='Voice preview';$('.voice-head small').textContent='AssemblyAI integration pending';$('.wave').hidden=true;$('.tool-call').textContent='Sample conversation — no microphone recording';
$('.score strong').innerHTML='<b id="safe-count">0</b>';$('.score > span').textContent='REFUSED REQUESTS';$('.score small').textContent='DEMO AUDIT';
$('.dock-strip > div:last-child p').innerHTML='<strong>Available</strong><small>Drop · Clear</small>';
function log(title,detail,refused=false){state.events.unshift({title,detail,refused,time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});}
function render(){
 yard.dataset.vehicleState=state.phase;canvas.setAttribute('aria-label',`Three warehouse docks. Trailer 12: ${names[state.phase]}. Aisle B: ${state.pallets} pallets.`);
 $('#appointment-status').textContent=names[state.phase];$('#dock2-state').textContent=['docked','empty'].includes(state.phase)?'Occupied':state.phase==='booked'?'Reserved':'Available';$('#dock2-meta').textContent=['ready','departed'].includes(state.phase)?'Reefer · Clear':'TR–12 · SYSCO';
 $('.status-pill').textContent=state.phase==='ready'?'SEEDED PO':'DEMO RECORD';$('.verified-line strong').textContent=`Aisle B · ${state.pallets} pallets recorded`;$('.verified-line small').textContent=state.events[0]?.title||'No appointment written yet';
 $('#events').innerHTML=state.events.map(e=>`<div class="event ${e.refused?'refused':''}"><time>${e.time}</time><span class="event-icon ${e.refused?'no':'ok'}">${e.refused?'×':'✓'}</span><p><strong>${e.title}</strong><small>${e.detail}</small></p></div>`).join('')||'<p>Book the seeded reefer slot to begin.</p>';
 $('#event-count').textContent=`${state.events.length} events`;$('#safe-count').textContent=state.events.filter(e=>e.refused).length;
 const allowed={book:state.phase==='ready',arrive:state.phase==='booked',floor:state.phase==='docked',depart:state.phase==='empty',refuse:true,reset:true};
 document.querySelectorAll('[data-scene]').forEach(b=>b.disabled=!['reset','refuse'].includes(b.dataset.scene)&&(state.busy||!allowed[b.dataset.scene]));
}
function reset(){clearTimeout(completion);clearTimeout(playTimer);playing=false;play.textContent='▶ Play yard demo';motion=null;state={phase:'ready',pallets:0,events:[],busy:false};truck={x:550,y:500};unloadStart=0;render();}
function animate(path,done){state.busy=true;const finish=()=>{clearTimeout(completion);truck={...path.at(-1)};motion=null;state.busy=false;done();render();if(playing&&state.phase==='docked')playTimer=setTimeout(()=>{scene('floor');playTimer=setTimeout(()=>scene('depart'),2500);},1600);else if(playing&&state.phase==='departed'){playing=false;play.textContent='↻ Replay yard demo';}};motion={path,start:performance.now(),duration:reduced?1:6500,done:finish};completion=setTimeout(finish,reduced?1:6500);}
function scene(action){
 if(action==='reset'){reset();return;}
 if(action==='refuse'){log('Unknown dock refused','Gate · Dock 9 does not exist · no movement',true);render();return;}
 if(state.busy)return;
 if(action==='book'&&state.phase==='ready'){state.phase='booked';log('Appointment booked','Gate · PO 4500123 · Trailer 12 · Dock 02 · 14:00–15:00');}
 else if(action==='arrive'&&state.phase==='booked'){log('Arrival confirmed','Gate · Trailer 12 checked in; moving to assigned door');animate([{x:550,y:500},{x:540,y:405},{x:635,y:315}],()=>{state.phase='docked';log('On-door placement confirmed','Demo arrival sequence · Trailer 12 · Dock 02');});}
 else if(action==='floor'&&state.phase==='docked'){state.phase='empty';state.pallets=18;unloadStart=performance.now();log('Unload and putaway recorded','Floor · 18 pallets · Aisle B · trailer remains on door');}
 else if(action==='depart'&&state.phase==='empty'){log('Departure confirmed','Gate · Trailer 12 leaving Dock 02');animate([{x:635,y:315},{x:540,y:405},{x:310,y:385},{x:95,y:410}],()=>{state.phase='departed';log('Trailer exited','Gate · Dock 02 released · inventory stays in aisle B');});}
 else return;render();
}
document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>scene(b.dataset.scene));window.yardDemo={getState:()=>JSON.parse(JSON.stringify(state)),scene};
const backdrop=new Image(),sprites=new Image();
backdrop.src='assets/yard-empty.png';sprites.src='assets/yard-sprites.png';
let unloadStart=0;
function sprite(kind,x,y,width){
 const crops={truck:[0,0,950,724],forklift:[1030,150,490,490],pallet:[1730,250,330,380]};
 const [sx,sy,sw,sh]=crops[kind];ctx.drawImage(sprites,sx,sy,sw,sh,x,y,width,width*sh/sw);
}
function draw(now){
 const r=devicePixelRatio||1,w=yard.clientWidth,h=Math.max(360,w*967/1627);
 canvas.style.height=h+'px';yard.style.minHeight='0';
 if(canvas.width!==Math.round(w*r)||canvas.height!==Math.round(h*r)){canvas.width=Math.round(w*r);canvas.height=Math.round(h*r);}
 ctx.setTransform(r,0,0,r,0,0);ctx.clearRect(0,0,w,h);
 const scale=Math.min(w/1627,h/967);ctx.translate((w-1627*scale)/2,(h-967*scale)/2);ctx.scale(scale,scale);
 if(!backdrop.complete||!backdrop.naturalWidth||!sprites.complete||!sprites.naturalWidth)return;
 ctx.drawImage(backdrop,0,0,1627,967);
 if(motion){
  const t=Math.min(1,(now-motion.start)/motion.duration),i=Math.min(motion.path.length-2,Math.floor(t*(motion.path.length-1))),u=t*(motion.path.length-1)-i,a=motion.path[i],b=motion.path[i+1];
  truck={x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u};
 }
 // Eighteen small individual pallet sprites appear only after the putaway write.
 for(let i=0;i<state.pallets;i++){
  const row=Math.floor(i/6),col=i%6;
  sprite('pallet',1200+col*23-row*25,398+col*9+row*20,32);
 }
 const progress=unloadStart?Math.min(1,(now-unloadStart)/2400):1;
 const fx=progress<1?850+430*progress:1280,fy=progress<1?460-15*progress:445;
 sprite('forklift',fx,fy,76);
 if(state.phase!=='departed')sprite('truck',truck.x,truck.y,210);
 // A small status marker carries the canonical door; the artwork stays unobstructed.
 if(['booked','docked','empty'].includes(state.phase)){
  ctx.fillStyle='#172329';ctx.beginPath();ctx.roundRect(728,285,102,31,8);ctx.fill();
  ctx.fillStyle='#fff';ctx.font='15px sans-serif';ctx.textAlign='center';ctx.fillText('DOCK 02',779,306);
 }
 ctx.textAlign='left';ctx.font='20px sans-serif';ctx.fillStyle='#243138';
 ctx.fillText(state.busy?'Confirmed trailer movement':names[state.phase],42,903);
 ctx.font='15px sans-serif';ctx.fillStyle='#657176';ctx.fillText('Live demo state · Trailer 12 · '+state.pallets+' pallets in aisle B',42,930);
}
const orb=$('#voice-orb'),panel=$('#voice-panel');function toggle(open){panel.classList.toggle('open',open);panel.setAttribute('aria-hidden',!open);orb.setAttribute('aria-expanded',open);}orb.onclick=()=>toggle(!panel.classList.contains('open'));$('#close-voice').onclick=()=>toggle(false);
document.querySelectorAll('.role-switch button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.role-switch button').forEach(x=>x.classList.toggle('active',x===b));orb.querySelector('b').textContent=b.textContent==='Gate'?'Speak to Gate':'Report from Floor';});
reset();setInterval(()=>draw(performance.now()),1000/30);
