const $ = (s) => document.querySelector(s);
const events = $('#events');
const truck = $('#truck');
const dock = document.querySelector('[data-dock="2"]');
let eventCount = 3;

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
    truck.classList.remove('departed'); dock.classList.add('active-dock');
    $('#yard-status-tag').textContent = 'VERIFIED'; $('#yard-status-title').textContent = 'Trailer 12 assigned to Dock 02';
    $('#yard-status-meta').textContent = 'PO 4500123 · 14:00–15:00'; $('#dock2-state').textContent = 'Assigned'; $('#dock2-meta').textContent = 'TR–12 · SYSCO';
    addEvent('ok', 'Appointment booked', 'Gate · PO 4500123 · Dock 02');
  }
  if (name === 'floor') {
    truck.classList.add('departed'); dock.classList.remove('active-dock');
    $('#yard-status-tag').textContent = 'PUT AWAY'; $('#yard-status-title').textContent = 'Trailer 12 cleared the yard';
    $('#yard-status-meta').textContent = '18 pallets · Aisle B'; $('#dock2-state').textContent = 'Available'; $('#dock2-meta').textContent = 'Reefer · Clear'; $('#appointment-status').textContent = 'Completed';
    addEvent('ok', 'Unload complete', 'Floor · 18 pallets · Aisle B');
  }
  if (name === 'refuse') {
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
