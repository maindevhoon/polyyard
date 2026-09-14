const $=s=>document.querySelector(s),yard=$('#yard'),canvas=document.createElement('canvas');
yard.replaceChildren(canvas);canvas.style.cssText='width:100%;height:510px;display:block;position:relative;z-index:2';canvas.setAttribute('role','img');
const ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let state,truck,motion,completion;
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
function reset(){clearTimeout(completion);motion=null;state={phase:'ready',pallets:0,events:[],busy:false};truck={x:11,y:10};render();}
function animate(path,done){state.busy=true;const finish=()=>{clearTimeout(completion);truck={...path.at(-1)};motion=null;state.busy=false;done();render();};motion={path,start:performance.now(),duration:reduced?1:3200,done:finish};completion=setTimeout(finish,reduced?1:3200);}
function scene(action){
 if(action==='reset'){reset();return;}
 if(action==='refuse'){log('Unknown dock refused','Gate · Dock 9 does not exist · no movement',true);render();return;}
 if(state.busy)return;
 if(action==='book'&&state.phase==='ready'){state.phase='booked';log('Appointment booked','Gate · PO 4500123 · Trailer 12 · Dock 02 · 14:00–15:00');}
 else if(action==='arrive'&&state.phase==='booked'){log('Arrival confirmed','Gate · Trailer 12 checked in; moving to assigned door');animate([{x:11,y:10},{x:4,y:10},{x:4,y:5}],()=>{state.phase='docked';log('On-door placement confirmed','Demo arrival sequence · Trailer 12 · Dock 02');});}
 else if(action==='floor'&&state.phase==='docked'){state.phase='empty';state.pallets=18;log('Unload and putaway recorded','Floor · 18 pallets · Aisle B · trailer remains on door');}
 else if(action==='depart'&&state.phase==='empty'){log('Departure confirmed','Gate · Trailer 12 leaving Dock 02');animate([{x:4,y:5},{x:4,y:10},{x:16,y:10}],()=>{state.phase='departed';log('Trailer exited','Gate · Dock 02 released · inventory stays in aisle B');});}
 else return;render();
}
document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>scene(b.dataset.scene));window.yardDemo={getState:()=>JSON.parse(JSON.stringify(state)),scene};
function p(x,y,z=0){return [440+(x-y)*27,90+(x+y)*13-z*27];}
function poly(points,color){ctx.beginPath();points.forEach((a,i)=>ctx[i?'lineTo':'moveTo'](...p(...a)));ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#00000010';ctx.stroke();}
function box(x,y,z,w,d,h,top='#fafafa',front='#d5d9da',side='#e6e9ea'){
 poly([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],top);poly([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],front);poly([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],side);
}
function label(text,x,y,z=0){ctx.font='12px sans-serif';ctx.fillStyle='#30393b';ctx.textAlign='center';ctx.fillText(text,...p(x,y,z));}
function draw(now){
 const r=devicePixelRatio||1,w=yard.clientWidth,h=510;if(canvas.width!==w*r||canvas.height!==h*r){canvas.width=w*r;canvas.height=h*r;}ctx.setTransform(r,0,0,r,0,0);ctx.clearRect(0,0,w,h);const s=Math.min(w/880,h/510);ctx.translate((w-880*s)/2,(h-510*s)/2);ctx.scale(s,s);
 if(motion){const t=Math.min(1,(now-motion.start)/motion.duration),i=Math.min(motion.path.length-2,Math.floor(t*(motion.path.length-1))),u=t*(motion.path.length-1)-i,a=motion.path[i],b=motion.path[i+1];truck={x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u};if(t===1){const done=motion.done;motion=null;state.busy=false;done();render();}}
 box(-2,-2,-.5,15,15,.5,'#ecefef','#c9ced0','#d9dddf');for(let i=0;i<12;i++)box(i,10.7,.01,.45,.07,.015,'#fff');
 box(-1,-1,0,10,5,3.1,'#f9fafb','#dce1e4','#cbd2d5');for(let i=0;i<10;i++)box(-1+i,-1,3.12,.96,5,.07,'#fff','#eceff0','#dfe3e5');
 for(const x of [1,4,7]){box(x-.65,3.99,.1,1.3,.09,2,'#596269','#707a80','#56636a');for(let j=0;j<7;j++)box(x-.55,4.09,.22+j*.24,1.1,.02,.04,'#aeb8bd');box(x-.85,4.3,0,.12,.12,.6);box(x+.8,4.3,0,.12,.12,.6);label(`DOCK ${x===1?'01':x===4?'02':'03'}`,x,4.2,2.5);poly([[x-.8,4.5,.01],[x+.8,4.5,.01],[x+.8,8,.01],[x-.8,8,.01]],x===4&&!['ready','departed'].includes(state.phase)?'#bfd8d755':'#ffffff66');}
 for(const x of [1,5])box(x,.1,3.25,1,1,.45,'#e1e5e7','#b6bfc5','#c7cfd4');label('MERCADO NORTH',4,1,3.8);
 box(10,7,0,1.2,1.2,1.4);box(10,8.22,.6,.8,.03,.5,'#71858c','#71858c','#71858c');label('GATE',10.7,8.4,1.8);
 for(let i=0;i<state.pallets;i++){const x=10+(i%3)*.55,y=1+Math.floor(i/3)*.48;box(x,y,0,.45,.38,.12,'#ac9f8c');box(x,y,.12,.4,.34,.3,'#f0ece5','#bdb6aa','#d7d0c4');}label(`AISLE B · ${state.pallets} PALLETS`,10.5,2,1.5);
 if(state.phase!=='departed'){const {x,y}=truck;for(const dy of [.45,2.25])for(const dx of [-.55,.5])box(x+dx,y+dy,.05,.18,.4,.32,'#30383d','#20282d','#414a50');box(x-.55,y,.4,1.2,2.8,1.15,'#fff','#d9dfe2','#ecf0f2');for(let i=0;i<9;i++)box(x+.66,y+i*.3,.45,.025,.035,1,'#e2e7ea');box(x-.5,y+2.8,.3,1.1,.85,.9,'#f9fafb','#d4dce0','#e8edf0');box(x-.38,y+3.66,.77,.85,.025,.32,'#71858f','#71858f','#71858f');label('TRAILER 12',x,y+1.5,1.9);}
 ctx.textAlign='left';ctx.font='14px sans-serif';ctx.fillStyle='#293337';ctx.fillText(state.busy?'Confirmed movement in progress':names[state.phase],24,465);ctx.font='12px sans-serif';ctx.fillText('One shared demo state · 3 doors · 18 expected pallets',24,487);requestAnimationFrame(draw);
}
const orb=$('#voice-orb'),panel=$('#voice-panel');function toggle(open){panel.classList.toggle('open',open);panel.setAttribute('aria-hidden',!open);orb.setAttribute('aria-expanded',open);}orb.onclick=()=>toggle(!panel.classList.contains('open'));$('#close-voice').onclick=()=>toggle(false);
document.querySelectorAll('.role-switch button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.role-switch button').forEach(x=>x.classList.toggle('active',x===b));orb.querySelector('b').textContent=b.textContent==='Gate'?'Speak to Gate':'Report from Floor';});
reset();requestAnimationFrame(draw);
