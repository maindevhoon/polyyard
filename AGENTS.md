# PolyYard

**Canonical product definition for any agent implementing this project.** If another file disagrees with this one about *what we are building and why*, this file wins. How you build it is not specified here.

PolyYard is a **public, multilingual voice operations system for a warehouse yard**. People at the gate and on the floor already talk. The systems that run the yard — dock calendar, purchase orders, inventory, the ops board — do not listen. PolyYard is the clerk that hears speech in the language it arrived in, and will only write a fact that already exists in those systems.

This project is intended for the **AssemblyAI Voice Agent Hackathon** (lablab.ai, 1–30 September 2026). Every participant must build on AssemblyAI. That is a contest rule, not a stack recommendation.

---

## 1. The problem

A warehouse is not one application. It is several, and they do not share a conversation.

- A **driver** is in a cab, often speaking Spanish, Portuguese, or mixed English, calling thirty minutes out or sending a voice note: *“Jefe, llego jueves en la tarde, tráiler 12, necesito muelle, es el PO de Sysco, va congelado.”*
- A **dispatcher** lives in a carrier portal and a dock calendar. They retype what they heard.
- A **floor lead** is on a noisy dock with a radio or a phone, confirming that the trailer is empty, counting pallets, saying which aisle they went to.
- A **yard / WMS / inventory system** owns the only facts that matter: which dock doors exist, which POs are real, which trailer IDs are on the property, which slots are open, what is already in a bay.

Today the join between those worlds is a human with a headset. When that human is busy, the driver waits. When that human mishears “Dock 2” as “Dock 9,” you get a **fake appointment and a real detention bill**. When they invent an ETA or a part on a van, a truck rolls twice.

This is expensive and measurable:

- **39.3% of truck stops** are detained more than two hours. The American Transportation Research Institute estimated **$15.1 billion** in 2023 ($11.5B lost productivity + $3.6B direct). **135 million hours** sitting. Reefer freight is worse (about 56% of those stops).
- Ocean **detention and demurrage** collected by carriers ran on the order of **$15.4 billion** over five years. Missed terminal windows and last-free-day errors are clock problems, not chatbot problems.
- Empty miles stay high (ATRI deadhead ~16.7% of miles). A late dock does not only cost this stop; it burns Hours of Service and cancels the next load.
- Drivers and warehouse staff **do not live in the portal**. In the US, dispatch is phone + SMS + ELD macros; the driver still calls the receiver. In Latin America, India, and much of the EU, **WhatsApp / voice notes** are the default. Roughly **one in four US truck drivers is Hispanic**; Spanglish at the gate is normal, not an edge case.

The naive product is “an AI receptionist for the warehouse.” That is the wrong problem. Receptionists take messages. The yard does not need another place to talk. It needs speech to become a **locked fact** in the right system of record — or a **refusal** when that fact does not exist.

A language model that sounds fluent and books Dock 9 when the building only has Docks 1–3 has failed more dangerously than a human who said “I didn’t catch that.” Invented coverage, invented slots, invented SKUs, invented ETAs: those are how voice agents lose lawsuits and lose yards.

**The hard problem is not speech-to-text. It is multilingual, multi-role speech into several applications, with a clerk that is not allowed to hallucinate an identifier.**

---

## 2. Who is hurt

| Person | What they do today | What goes wrong |
|---|---|---|
| **Driver** | Calls or voice-notes from the cab, often code-switching, often without a PO number handy | Hold music, wrong door, two-hour wait, unpaid detention |
| **Dispatcher** | Human API between driver speech and shipper portals | Retypes, fat-fingers trailer IDs, books a window the dock cannot take |
| **Floor / forklift** | Confirms unload and putaway by radio while handling freight | Count never lands in WMS; trailer shows “on dock” after it left |
| **Yard / ops lead** | Stares at a board that is already twenty minutes stale | Cannot see that Gate and Floor are talking about the same trailer |
| **Shipper / 3PL** | Pays detention, OTIF penalties, extra lumper, missed retail windows | The leak is at the gate, not in the TMS strategy deck |

PolyYard is for the **last fifty meters of the physical network**: gate, dock, putaway. It is not a TMS, not a WMS replacement, not a chatbot bolted onto a help center.

---

## 3. The proposed solution

**PolyYard is one shared yard truth, spoken to from more than one role, in more than one language, in public.**

Three faces of the same system (these are *roles*, not a mandated UI framework):

1. **Gate** — the driver-facing voice. Books a dock, checks a PO, reports a late arrival, asks where to go. Answers only with identifiers the yard already has.
2. **Floor** — the crew-facing voice. Confirms arrival at a door, unload complete, pallet count, damage, putaway aisle. Writes those events into the same yard the driver just booked.
3. **Tower** — the ops-facing view. Live picture of docks, appointments, trailers, inventory movements, and refusals. Not a voice agent. The proof that Gate and Floor are not two disconnected demos.

Underneath all three is a **constraint plane**:

- The **model classifies intent** (book, check in, late, unload, locate, human).
- The **system owns facts** (dock IDs, PO numbers, trailer IDs, windows, commodity constraints, pallet counts once recorded).
- If the system of record is silent, **refuse**. Do not invent Dock 9. Do not invent PO 4500999. Do not invent “we have that compressor on the truck.”
- **Numbers and IDs leave the mouth of the agent only as values that came from a lookup or a write that succeeded.** Template the readback. Never paraphrase a dock, a time, or a PO into something “close enough.”
- **Money, safety, and disputes go to a human** (or a recorded statutory script). Gas, injury, hazmat, “that’s not my load” — do not book through them.

This is the same pattern as a WhatsApp voice-note receptionist that books a *real* salon slot and will not hallucinate Thursday at 3pm — applied to a yard where the slot is a dock, the catalog is POs and trailers, and two different jobs have to agree.

### Why this is interesting (and actually hard)

Anyone can wrap a voice model around “how can I help you.” PolyYard is hard because all of the following are true at once:

- **Several applications, one world.** A booking at Gate must appear on Tower and constrain Floor. An unload on Floor must change what Gate is allowed to say about that trailer. If the three surfaces can disagree, the product is a costume.
- **Multilingual and public.** Drivers and crews will not switch to textbook English for a demo. The product must take English, Spanish, Portuguese, and **mid-utterance mix** (Spanglish, Portuñol). The public must be able to open it and talk — no private yard login required for the hackathon demo — so judges and strangers can try to break it.
- **Identifiers are the product.** Trailer 12, PO 4500123, Dock 2, aisle B, 18 pallets. Speech is messy; those strings are not optional. The interesting failure is not WER on “hello.” It is booking the wrong door.
- **Refusal is a feature.** The demo that wins is the one that *rejects* Dock 9 on purpose, on stage, in the driver’s language, and shows Tower recording that refusal.
- **The channel is already voice.** We are not asking anyone to download a warehouse app. We meet them on a call or a talk button, the way they already reach the gate.

### What success sounds like (90-second story)

1. A driver speaks mixed Spanish/English: Thursday afternoon, trailer 12, frozen, Sysco PO. Gate offers **only** a real reefer window on Dock 2, reads back PO + trailer + dock + time, and stops.
2. Tower lights Dock 2 for that trailer. The appointment is not a chat log; it is a row on the board.
3. A floor worker, in English or Spanish, says trailer 12 is empty, 18 pallets, aisle B. Inventory on Tower moves. Gate, asked “is trailer 12 still on Dock 2?”, no longer pretends it is.
4. A second driver asks for Dock 9. The agent **refuses**. Tower shows a refused hallucinated ID. Scoreboard: **zero invented identifiers**.

If that story cannot be performed live, PolyYard is not done.

---

## 4. Rules the product must obey

These are product rules, not implementation notes.

1. **Intent vs facts.** Language models do not author dock IDs, PO numbers, trailer IDs, timestamps, or inventory quantities. They may collect speech and choose a tool. Tools return the only numbers the agent is allowed to say.
2. **No silent success.** A book, check-in, or unload either writes the shared yard or returns a structured failure the agent must speak honestly.
3. **Read back identifiers.** After a successful write, speak the canonical IDs and the window, in the language the user used.
4. **One yard.** Gate, Floor, and Tower are views of the same state. Do not give each role a private toy database.
5. **Public demo.** A stranger can use Gate and Floor without a warehouse account. Seed the yard with a small, understandable facility (a handful of docks, a handful of POs, mixed dry/reefer, at least one trap ID that does not exist).
6. **Multilingual by default.** English, Spanish, and Portuguese at minimum. Reply in the register they arrived in. Do not force a language menu if it can be avoided.
7. **AssemblyAI is in the critical path.** Transcription and the voice agent experience must use AssemblyAI, per hackathon rules. Do not treat it as a logo on a slide.
8. **Honesty in the write-up.** Do not claim HIPAA, a live TMS, or a 65% detention cut on synthetic data. Claim: the model never knew the schedule; the calendar did.

### Things we are explicitly not building

- A generic voice receptionist, FAQ bot, or “warehouse ChatGPT.”
- A clone of a clinic/WhatsApp booking bot with the nouns swapped.
- A full WMS, TMS, or YMS.
- An agent that estimates fares, ETAs, or inventory from world knowledge.
- Safety theater: if someone reports a chemical leak or an injury, do not invent a work order that “handles it.” Escalate.

---

## 5. The yard (conceptual, not a schema)

Enough for a stranger to understand the demo. Another agent will decide storage.

**Facility.** A small grocery-style DC. A few dock doors with types (dry, reefer, drop-only) and hours. Slots are real windows, not “sometime Thursday.”

**Freight.** Purchase orders with shipper, commodity (dry vs frozen), optional trailer ID, lumper yes/no. Trailers either match a PO or they are unknown — unknown is a question, not a booking.

**Clock.** Free time (e.g. two hours from check-in). Late arrival offers the next *legal* slot, not a made-up squeeze-in.

**Events.** Booked, checked in, unloading, empty, put away, refused. Tower shows these. Floor creates some of them. Gate creates others.

**Traps.** At least one dock ID, PO, and trailer that people will try to invent. The correct behavior is refusal plus an audit line.

---

## 6. Voice behavior

Keep spoken turns short. Lead with the answer. No preamble, no exclamation marks as a style.

**Never say** a dock, time, PO, trailer, pallet count, or “you’re all set on door X” unless that exact value came from a tool result in *this* conversation.

**When in doubt, call the tool.** A wasted lookup is fine. Answering from memory is not.

**If lookup misses:** say you do not have that, ask one clarifying question or refuse. Do not offer a “close” door.

**Language:** follow the caller. If they mix languages in one breath, stay with them. Domain words to hear correctly include dock/muelle, trailer/tráiler, pallet/tarima, PO, reefer/congelado, aisle/pasillo, lumper.

---

## 7. Hackathon frame

**Event.** AssemblyAI Voice Agent Hackathon on lablab.ai. Online, 1–30 Sep 2026. Prize pool $10,000 ($5k cash + $5k AssemblyAI credits). Registration stays open through the build window.

**Judges score.** Presentation, business value, application of technology, originality.

**What they need to see.** A working voice agent, a public demo URL, a public GitHub repo, a short video (problem → live demo → why it matters), a slide PDF, a description that names a real user and a real cost (detention, not “AI for logistics”).

**Business value, said plainly.** Target user is a 3PL or grocery DC drowning in gate calls. The wedge is not “containment.” It is **wrong-door and missed-window cost**. Revenue model can be per-site SaaS on top of existing YMS/WMS; we are not selling a new ERP. Why it needs voice AI: the people with the facts are talking, not typing, and they are not in English-only offices.

**Originality.** Multi-role shared state + enforced refusal of identifiers, in public, multilingual. That is the idea. A pretty waveform is not.

**Application of technology.** AssemblyAI must do the listening (and the conversational agent, unless a later decision documents otherwise). Domain keyterms (dock names, shippers, commodity words) should actually improve what the agent hears. Tool use should be visible: the agent looks something up, then speaks.

Submission packaging (title, tags, cover image, video, slides, repo, live URL) is required by lablab. Another agent can own the format. Do not ship a private repo.

---

## 8. What “done” means for a first version

A first version is done when a person who has never seen the repo can:

1. Open the public demo.
2. Speak to **Gate** in Spanish or mixed English and get a **real** dock window or a **clear refusal**.
3. See that booking on **Tower** without refreshing a fantasy.
4. Speak to **Floor** about that same trailer and change the board.
5. Attempt an invented dock or PO and watch it fail, on purpose, with the refusal logged.

Until those five are true, do not decorate.

---

## 9. Pointers for the implementing agent

You will choose languages, hosting, data stores, and UI. This file does not.

Do choose in this order: **shared yard truth → voice that cannot write IDs except through that truth → Gate and Floor both hooked up → Tower that cannot lie → multilingual pass → demo script and write-up.**

If a shortcut makes Gate and Floor use different data, it is not a shortcut. It is a different product. Do not take it.

---

## 10. Current product and demo direction

This section turns the product definition above into binding implementation priorities for the hackathon demo. It may guide presentation and interface choices, but it does not weaken any constraint above.

### The central screen

Build **Tower as the primary surface**. Gate and Floor voice controls live inside or beside Tower as compact, persistent operational controls. Do not make a large chat transcript the product. Voice is how facts enter; Tower is where a judge sees that a validated write changed the shared yard.

The first viewport must make these visible without scrolling:

- the physical dock state;
- the active appointment and canonical PO, trailer, dock, and window;
- a short live event/audit stream including refusals;
- a clear Gate/Floor voice affordance;
- the identifier-safety score or equivalent proof that no unverified identifier was committed.

### Visual yard

An isometric or 3D-style yard view is encouraged as the memorable stage device. The current art direction is a **clean white editorial interface with a miniature voxel/isometric warehouse diorama**: white, pearl, and soft gray surfaces with only restrained operational accents. Avoid a dark control-room theme, saturated game colors, or ornamental scenery. The diorama is a **projection of shared state**, never a second state engine. A truck may arrive, move to a door, or leave only after the corresponding validated event succeeds. A refused or unknown dock must never be drawn as though it exists. Prefer a reliable 2D/isometric implementation over complex 3D if the latter risks the demo.

### Voice control

Preserve the approved generated warehouse artwork. Animate transparent vehicle and inventory layers over the cleaned facility plate. Do not replace this artwork with a simplified geometric warehouse. Validate rendered movement with frame comparisons, and verify that departure removes the only visible truck while recorded inventory persists. Canvas may composite the generated assets; it must not substitute a lower-detail geometric scene.

Use a labeled control such as **Speak to Gate** or **Report from Floor**, not an unexplained floating microphone. While active, show the detected language, partial transcript, and current system action (for example `Looking up PO` or `Booking verified slot`). Keep transcript history secondary and collapsible.

### Required demo states

The demo and its local mock must make these deterministic paths easy to run:

1. **Gate booking:** mixed Spanish/English request for seeded trailer 12 and a frozen Sysco PO; a real reefer slot at Dock 2 is returned and written.
2. **Floor completion:** trailer 12 is recorded empty with 18 pallets in aisle B; Tower updates and Dock 2 is released.
3. **Constraint test:** a request for Dock 9 is refused; no operational state changes and the attempted identifier is written to the audit log as a refusal.

Demo-only playback controls may trigger these paths for rehearsal and video capture, but must be visibly identified as demo controls. They must exercise the same state transitions shown by Tower and must never be presented as live AssemblyAI transcription.

### Presentation standard

Optimize the live demonstration around one legible 90-second arc: **speech → visible lookup → validated write or refusal → physical yard change → audit proof**. Use realistic seeded data, strong contrast, restrained motion, and readable type on a projected screen. Do not spend the opening seconds on navigation, setup, a marketing hero, or an architecture diagram.

The submission video should show the product before explaining the stack. The recommended order is: cost/problem in one sentence, live booking, shared Floor update, deliberate refusal, then a concise architecture proof that AssemblyAI listens while the constraint plane owns facts.

### Do not build yet

Until all three required demo states work from the same state model, do not add route planning, predictive ETAs, analytics forecasts, a full WMS/TMS, multiple facilities, avatars, decorative 3D scenes, lengthy transcripts, account administration, or a generic assistant chat. Presentation polish is required; speculative surface area is not.

### Definition of visual-demo ready

The dashboard is visually demo-ready when a first-time viewer can identify the occupied door, the assigned trailer and PO, the last successful mutation, and the latest refusal within five seconds; every animation is derived from the same event that updates the operational cards; the layout remains usable on a laptop and phone; and the complete 90-second story can be replayed without refreshing the page.
