const $ = (s) => document.querySelector(s);
const events = $('#events');
const truck = $('#truck');
const dock = document.querySelector('[data-dock="2"]');
const liveTruck = $('#live-truck');
const vehicleLabel = $('#vehicle-label');
let eventCount = 3;
let transitionTimer;

function setVehicleState(state) {
  clearTimeout(transitionTimer);
  liveTruck.className = `live-truck ${state}`;
  vehicleLabel.className = `vehicle-label ${state}`;
  $('#yard').dataset.vehicleState = state;
}

function addEvent(kind, title, meta) {
  const now = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false});
  const row = document.createElement('div');
  row.className = `event ${kind === 'no' ? 'refused' : ''}`;
  row.innerHTML = `<time>${now}</time><span class="event-icon ${kind}">${kind === 'no' ? '×' : '✓'}</span><p><strong>${title}</strong><small>${meta}</small></p>`;
  events.prepend(row); eventCount += 1; $('#event-count').textContent = `${eventCount} events`;
}

function scene(name) {
  if (name === 'reset') { location.reload(); return; }
  if (name === 'book') {
    setVehicleState('approaching');
    truck.classList.remove('departed'); dock.classList.add('active-dock');
    $('#yard-status-tag').textContent = 'IN MOTION'; $('#yard-status-title').textContent = 'Trailer 12 approaching Dock 02';
    $('#yard-status-meta').textContent = 'PO 4500123 · 14:00–15:00'; $('#dock2-state').textContent = 'Assigned'; $('#dock2-meta').textContent = 'TR–12 · SYSCO';
    addEvent('ok', 'Appointment booked', 'Gate · PO 4500123 · Dock 02');
    $('#dock-pin').classList.remove('cleared');
    transitionTimer = setTimeout(() => {
      setVehicleState('docked');
      $('#yard-status-tag').textContent = 'ON DOOR';
      $('#yard-status-title').textContent = 'Trailer 12 at Dock 02';
      $('#dock2-state').textContent = 'Unloading';
      addEvent('ok', 'Trailer reached door', 'Yard · Trailer 12 · Dock 02');
    }, 2600);
  }
  if (name === 'floor') {
    setVehicleState('departing');
    truck.classList.add('departed'); dock.classList.remove('active-dock');
    $('#yard-status-tag').textContent = 'PUT AWAY'; $('#yard-status-title').textContent = 'Trailer 12 cleared the yard';
    $('#yard-status-meta').textContent = '18 pallets · Aisle B'; $('#dock2-state').textContent = 'Available'; $('#dock2-meta').textContent = 'Reefer · Clear'; $('#appointment-status').textContent = 'Completed';
    addEvent('ok', 'Unload complete', 'Floor · 18 pallets · Aisle B');
    $('#dock-pin').classList.add('cleared');
    transitionTimer = setTimeout(() => setVehicleState('gone'), 2600);
  }
  if (name === 'refuse') {
    $('#yard').classList.remove('constraint-flash');
    void $('#yard').offsetWidth;
    $('#yard').classList.add('constraint-flash');
    addEvent('no', 'Unknown dock refused', 'Gate · Candidate “Dock 9” · No state changed');
    $('#safe-count').textContent = String(parseInt($('#safe-count').textContent) + 1).padStart(2,'0');
  }
}

document.querySelectorAll('[data-scene]').forEach(b => b.addEventListener('click', () => scene(b.dataset.scene)));
const voiceOrb = $('#voice-orb'), voicePanel = $('#voice-panel');
function toggleVoice(open) { voicePanel.classList.toggle('open', open); voicePanel.setAttribute('aria-hidden', String(!open)); voiceOrb.setAttribute('aria-expanded', String(open)); }
voiceOrb.addEventListener('click', () => toggleVoice(!voicePanel.classList.contains('open')));
$('#close-voice').addEventListener('click', () => toggleVoice(false));
document.querySelectorAll('.role-switch button').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.role-switch button').forEach(b => b.classList.remove('active')); button.classList.add('active'); voiceOrb.querySelector('b').textContent = button.textContent === 'Gate' ? 'Speak to Gate' : 'Report from Floor'; }));
function tick(){ $('#clock').textContent = new Date().toLocaleTimeString([], {hour12:false}); } tick(); setInterval(tick,1000);

if (document.modelContext?.registerTool) {
  document.modelContext.registerTool({
    name: 'run_demo_scene',
    title: 'Run PolyYard demo scene',
    description: 'Runs one visible rehearsal scene on the PolyYard Tower dashboard.',
    inputSchema: { type: 'object', properties: { scene: { type: 'string', enum: ['book', 'floor', 'refuse', 'reset'] } }, required: ['scene'], additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      if (!['book', 'floor', 'refuse', 'reset'].includes(input?.scene)) throw new Error('Unknown demo scene');
      scene(input.scene);
      return { scene: input.scene, visible_state_updated: true };
    }
  });
}
