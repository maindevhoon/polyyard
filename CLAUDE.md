# CLAUDE.md — PolyYard

You are implementing **PolyYard**. Read this file before writing code. **`AGENTS.md` is the canonical product definition.** If this file and `AGENTS.md` ever disagree about the product, follow `AGENTS.md`. This file restates the problem and the solution so you can work from it, and tells you how to behave while building.

Do not start by choosing a framework, a cloud, or a folder layout. Start by making sure you could explain the problem and the 90-second demo to a judge. Another agent owns architecture and stack. You still have to ship a product that matches this brief.

**Contest constraint (not a stack preference):** this is for the AssemblyAI Voice Agent Hackathon on lablab.ai (1–30 September 2026). The voice path must use **AssemblyAI**. Do not substitute another speech vendor for the demo.

---

## The problem (read this until it is obvious)

A warehouse does not fail because nobody built a chatbot. It fails because **speech never becomes a locked fact in the right application**.

Several jobs already talk. Several systems already store truth. They are not the same thing.

- **Drivers** sit in cabs and speak — often Spanish, Portuguese, or mixed with English. They do not fill portal fields. They say things like: Thursday afternoon, trailer 12, need a dock, Sysco PO, frozen. In Latin America and much of the world that utterance is a **WhatsApp voice note**. In the US it is still a phone call to the receiver thirty minutes out.
- **Dispatchers** are the human glue. They hear the driver and type into a dock calendar or a retail appointment portal. Fat-finger a door, and the truck is sent to a dock that does not exist or cannot take reefer.
- **Floor crews** confirm the physical world: trailer empty, eighteen pallets, aisle B, seal broken. That confirmation often dies on a radio and never reaches inventory.
- **The systems of record** — dock calendar, purchase orders, trailer list, inventory — are the only place a dock ID, a PO, or a slot is actually real.

When those worlds meet only in a headset, three things happen:

1. **Waiting.** ATRI (2024): about **39% of truck stops** sit more than two hours. **$15.1 billion** in 2023. **135 million hours.** Reefer is worse. Detention invoices are often unpaid; the time is still gone. A late dock also burns Hours of Service and the next load (deadhead still ~17% of miles).
2. **Fiction.** A fluent agent that books **Dock 9** in a three-door building has created a fake appointment and a real queue. Invented POs, invented ETAs, invented “we have that on the van” are the same class of error as a chatbot inventing a refund policy.
3. **Split brain.** If the driver-facing voice and the floor-facing voice do not share one yard, you have two demos, not an operations product. Ops still stares at a stale board.

Portals will not fix this. The people with the information are **talking**, often not in English, often with greasy hands or a wheel in the other hand. About **one in four US truck drivers is Hispanic**; code-switching at the gate is normal. Asking them to log into a YMS is how you get another unused app.

**The problem to solve is therefore:** multilingual, multi-role voice into **multiple applications that must stay consistent**, where the product is legally and operationally defined by **what it refuses to invent**.

This is not “AI for logistics.” It is the last fifty meters of the yard: gate, door, putaway.

---

## The proposed solution

**PolyYard** is a public voice operations layer over a small but real yard.

One shared truth. Three roles:

| Role | Who speaks / looks | What they are allowed to do |
|---|---|---|
| **Gate** | Driver (public, any language we support) | Book a dock, look up a PO, report late, ask where to go — **only** against real docks, POs, trailers, windows |
| **Floor** | Warehouse crew | Check in at a door, mark empty, count pallets, note damage, putaway aisle — writes the **same** yard |
| **Tower** | Ops (not a voice agent) | See docks, appointments, moves, and **refusals**. Proof that Gate and Floor are not two toys |

The intellectual core is a **constraint plane**, not a personality:

- The voice model **classifies intent** (book, late, unload, locate, escalate).
- **Tools / the yard** return identifiers and times. Those are the only numbers the agent may speak.
- **Silence in the system of record → refusal.** Dock 9 does not exist; say so. Do not offer a “nearby” door as if it were booked.
- **Read back** canonical IDs after a successful write, in the caller’s language.
- **Human / hard stop** for safety, money fights, hazmat, injury. Do not “handle” a chemical leak by creating a work order from vibes.

If you have seen a receptionist that transcribes a WhatsApp voice note, books a **real** calendar slot, and will not hallucinate Thursday 3pm: that is the pattern. Here the calendar is docks, the catalog is POs and trailers, and **two voices plus a board** must agree.

### Why it should look difficult (because it is)

Judges have already seen interview coaches and “talk to a business.” PolyYard is difficult when all of this is true together:

1. **Multiple applications, one world.** A Gate booking appears on Tower and constrains Floor. A Floor unload changes what Gate may still say about that trailer.
2. **Public and multilingual.** Strangers can talk. English, Spanish, Portuguese, and mixed utterances. No “please select your language” as the product.
3. **Identifiers are the demo.** Trailer 12, PO 4500123, Dock 2, 18 pallets. Missing “hello” is not the failure mode. Booking a ghost door is.
4. **Refusal on stage.** Invented IDs fail in the user’s language; Tower logs the refusal. Zero hallucinated identifiers is the scoreboard.
5. **Voice is required.** Drivers and crews are already speaking. A form that does the same writes is a regression.

### The 90-second demo you are aiming at

1. Driver, mixed Spanish/English: Thursday afternoon, trailer 12, frozen, Sysco. Gate books **only** a real reefer window on Dock 2 and reads it back.
2. Tower shows that appointment as a row, not a transcript.
3. Floor: trailer 12 empty, 18 pallets, aisle B. Tower inventory moves. Gate no longer claims the trailer is on the door.
4. Another driver asks for Dock 9. **Refusal.** Tower records it.

If you cannot perform that live, you are not done. Do not add themes, extra verticals, or marketing pages first.

---

## Product rules (binding)

1. Models do not author dock IDs, POs, trailer IDs, timestamps, or quantities. They choose tools. Tools speak facts.
2. A book / check-in / unload either mutates the shared yard or returns a failure the agent must say aloud. No silent success.
3. Gate, Floor, and Tower are views of **one** yard. Separate databases per role are a product bug.
4. Public demo: no warehouse login required. Seed a tiny facility (few docks, few POs, dry + reefer, trap IDs that do not exist).
5. Reply in the language and mix the user used.
6. AssemblyAI is on the critical path for listening / the voice agent.
7. Do not claim live TMS integration, HIPAA, or detention savings you did not measure. Claim: *the model never knew the schedule.*

**Do not build:** generic receptionist, FAQ, warehouse ChatGPT, full WMS/TMS, ETAs from world knowledge, a clinic-booking clone with nouns swapped, a safety agent that pretends to dispatch a hazmat team.

---

## Yard, conceptually

A small grocery-style DC. Doors have types (dry, reefer, drop-only) and hours. Windows are real. POs have shipper, commodity, optional trailer. Unknown trailer → question, not a booking. Late → next legal slot, not a squeeze. Events: booked, checked in, unloading, empty, put away, refused. Include trap IDs so refusal can be shown on purpose.

You may choose how this is stored. You may not choose a world where Gate’s docks and Floor’s docks can diverge.

---

## Voice manner

Short turns. Answer first. No filler enthusiasm.

Never quote a dock, time, PO, trailer, count, or “you’re set on door X” unless that exact value came from a tool result **in this conversation**.

When in doubt, call the tool. If the tool misses, refuse or ask one clarifying question. Do not guess a close door.

Hear yard language: dock / muelle, trailer / tráiler, pallet / tarima, PO, reefer / congelado, aisle / pasillo, lumper.

---

## Hackathon (what “good” means to judges)

lablab scores **presentation, business value, application of technology, originality**.

- **User:** 3PL or grocery DC gate, not “everyone in logistics.”
- **Money:** detention, missed windows, OTIF — cite the ATRI-scale problem; do not invent a ROI from the demo.
- **Tech:** AssemblyAI must actually listen. Keyterms for shippers, doors, commodity words should matter. Tool calls should be obvious in the demo.
- **Originality:** shared multi-role state + identifier refusal, public, multilingual.
- **Packaging:** public GitHub, live demo URL, ≤5 min video (problem → live demo → why it matters), PDF slides, 16:9 cover, long description ≥100 words. Private repos score worse.

Work order if you are implementing: **shared yard → voice that can only write through it → Gate and Floor both real → Tower that cannot lie → multilingual pass → demo script and write-up.** Do not decorate before the five “done” checks in `AGENTS.md` §8.

---

## How you should work

- Treat this as a product with a refusal invariant, not a voice UI exercise.
- If a shortcut would make Gate and Floor diverge, reject the shortcut.
- Prefer a tiny honest yard over a fake “enterprise integration.”
- When you write copy (README, slides, lablab description), explain the **problem and the clerk**, not the framework you picked.
- Point coding tools at current AssemblyAI Voice Agent docs rather than memory; the API moves.

When in doubt, re-read the 90-second demo and the sentence: **the model never knew the schedule.**
