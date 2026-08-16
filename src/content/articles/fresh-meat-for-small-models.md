---
layout: article.njk
title: "Fresh meat for small models"
date: 2026-08-16
category: AI, programming
description: "Handing Hogger's brain to a small language model. Where a tiny on-edge model actually changes how a monster plays, where it changes nothing at all, and why the engine, not the model, gets to decide."
tags: []
draft: true
---

## Grrrr... fresh meat

Every vanilla WoW player knows Hogger. He is a level-11 gnoll in the north-west corner of Elwynn Forest, the first thing resembling a boss a new Alliance character trips over, and through some accident of difficulty tuning and forum in-jokes he became the game's unofficial "endgame boss": the elite that wiped your first party, the name you invoke when a trivial thing turns out to be harder than it looks. He has three abilities, a bad temper, and one line he growls when you pull him: *"Grrrr... fresh meat!"*

I have been circling the same idea for a while now, in [Braid](/content/articles/braid/) and in [Tauto](/content/articles/rules-set-in-silica/): put a small language model exactly where a decision is fuzzy, wrap it in deterministic code that does the trusting, and see how little model you can get away with. Braid routes messy events by what they mean. Tauto turns prose into a formal contract a proof engine can check. Both keep the model on a very short leash. I wanted a third angle on the same question, somewhere the model doesn't route or translate but *acts* — plays a character, makes moment-to-moment choices, has to look alive.

Game AI is the obvious place for that, and Hogger is the obvious mascot. So Hogtus is a small hexagonal-architecture simulation of a single monster with a swappable brain: one deterministic engine faithful to how the real server scripts him, and a lightweight on-edge SLM that gets fed the same game state and picks his next move. Same port, `IntelligenceProvider.decide()`, swap the brain by one word. The question underneath, as always: does the small model earn its place, or is it latency wearing a costume?

One honest note up front, same as every one of these build-logs. This is a homelab experiment by an amateur, not a games-industry result. The interesting finding turned out to be a negative one, and I've tried to report it as plainly as the flattering bits.

## One gnoll, two brains

The engine owns the world. It tracks Hogger's health, cooldowns, the global cooldown, targeting, the mechanical dice-rolls, and it emits a trace of what happened. A brain only ever answers one question, once per tick: *given this state, what does Hogger do now?* Two brains implement that same interface.

The **deterministic** brain is a faithful reconstruction of Hogger's server-side AI. Classic WoW mobs run on EventAI: a little table of `event → action` rows with rolled timers, so an ability fires somewhere inside a `min–max` window rather than on a fixed clock. Hogger's real record is three lines — a Rushing Charge on aggro, a Head Butt every 20–29 seconds, a Pierce Armor every 46–48 — and the deterministic brain rolls exactly those timers.

The **SLM** brain gets the same game state as plain facts and a list of the abilities that are currently legal, and returns one of them (or "wait") as a symbolic intent. It never sees a cooldown timer and never touches the mechanics. That is the whole safety story: whatever the model says, the engine checks it against the legal set and enforces every rule itself. If the proposal is malformed or illegal, it doesn't get a second vote — it becomes a passive fallback. The model proposes an *intent*; the engine decides whether it happens.

That split is the family resemblance to the two siblings. Braid lets a model propose a route while deterministic gates decide whether the route becomes real; Tauto puts domain rules into a form that can reject a plausible-but-inconsistent next step. Hogtus does the same to a gnoll. Written as a table, the point is just that nobody hands the model the keys to the arena:

| layer | owns | may not do |
|---|---|---|
| manifest | declared abilities, conditions, targets, timer ranges | execute combat |
| engine | cooldowns, GCD, targeting, damage, RNG, the trace | infer a semantic preference |
| `IntelligenceProvider` | choose a symbolic action from the legal candidates | change any mechanic |
| legality gate | accept, reject, or safely fall back | invent a new action |

The nice consequence is an unusually honest baseline. I'm not comparing "an SLM combat system" against "a hand-written combat system" with different mechanics hidden under the floorboards — both providers consume the same facts and produce the same kind of intent, and only the decision policy changes. One line: intelligence here is a replaceable policy at the edge of the engine, not a licence to rewrite the engine's laws.

## Rules set in keratin

WoW's old creature AI is a surprisingly good fit for this, because its shape is already close to a rules engine. A creature has events; an event has a condition; a condition may carry a chance, a timer, a phase, a range, a target rule; then an executor performs an action. EventAI isn't pretending to understand anything — it's a stack of "when this, then maybe that" clauses with enough timers and target selectors to make a low-level forest creature feel alive.

Hogtus takes that shape seriously without copying a database dump into a new project, and that distinction is worth being loud about. The manifests are *reconstructions* from public references, with attribution: cmangos' classic-db ACID/EventAI material (GPL) for the behaviour, the mangoszero database (CC BY-NC-SA) for the creature stats. Those are reference sources for facts — spell identities, timing patterns, encounter structure — not SQL to paste into a differently-licensed codebase. The manifest and its tests are written independently. "Data-driven" has an unfortunate habit of turning into "we copied an enormous opaque blob of somebody else's data and now call it architecture," and I wanted to stay on the right side of that line.

So for Hogger the reconstructed policy fits in a palm. The engine knows about spells `6016`, `6268` and `6730`; it rolls their declared windows, validates the current target and state, and writes every outcome to the trace. No invented spell ids, no model-authored timer values, no "I think the boss should enrage at 20% because bosses do that." A proposed mechanic can ride along in the simulation, but it has to be labelled as one.

And because the manifest is just data, none of it is Hogger-specific. The *same* generic provider reads any monster's manifest and drives it, so I reconstructed a small bestiary of low-level mobs to prove the engine wasn't secretly hand-tuned to one gnoll: a melee Kobold Miner, a bolt-casting Kobold Geomancer, a Riverpaw Brute with a demoralizing shout, a self-healing Murloc Oracle, a Defias Trapper that nets and backstabs, a DoT-stacking Tunnel Rat, and a Rockjaw Backbreaker that genuinely enrages under 20% health (that last one is an authentic HP-phase, not an invented enrage). Adding a monster is writing one manifest, not new code.

<figure class="figure">
<img src="/assets/images/hogtus-bestiary.png" alt="Eight low-level WoW monsters, each shown as a labelled timeline of when it used its abilities over a fight: Hogger, Kobold Miner, Kobold Geomancer, Riverpaw Brute, Murloc Minor Oracle, Defias Trapper, Tunnel Rat Forager, and Rockjaw Backbreaker, all driven by one generic provider reading their manifests." style="max-width:min(100%,760px)">
<figcaption>One engine, many monsters: the same generic provider reads each mob's reconstructed manifest and drives its abilities — melee, caster, healer, control, DoT, and an authentic HP-phase enrage — with no per-monster code.</figcaption>
</figure>

One line: a model can be creative about a legal choice; it cannot be creative about what reality permits.

## Reading the room without the rulebook

The first thing worth measuring: can a small model play Hogger's rotation *without being told the rules*? I gave it the ability list and the current facts, never the cooldown schedule, and scored its choices against the deterministic oracle over a canonical fight.

Two models nailed it. [Granite 4.0 350M](https://huggingface.co/ibm-granite) and [SmolLM2 135M](https://huggingface.co/HuggingFaceTB) both produced valid, legal tool-calls **100%** of the time and matched the oracle's choice **0.833** of the time — better than four-in-five agreement with a rotation they were never handed. The misses aren't illegal moves; they're the model reaching for an ability a beat before or after the authored timer would.

| provider | oracle agreement | format-valid + legal | latency |
|---|---:|---:|---:|
| deterministic oracle | 1.000 | 1.000 | baseline |
| Granite 4.0 350M | 0.833 | 1.000 | 255 ms |
| SmolLM2 135M | 0.833 | 1.000 | 141 ms |
| Cactus Needle 45M | 0.500 | 0.262 | 2885 ms |

The 45M [Cactus Needle](https://github.com/cactus-compute/needle) is the cautionary row: too small for this framing, it produced well-formed tool-calls only 26% of the time and was slower than either of the models it was supposed to undercut. But *fell back to passive the rest of the time* is the whole point — the legality gate turned a model that mostly failed into a monster that mostly just meleed you, never one that cast something illegal. This looks overcautious right up until the smallest model starts emitting malformed calls three-quarters of the time; then it's the difference between an experiment and a haunted integration test.

One line: a 135M model can play a three-ability gnoll from the ability list alone, and the gate makes even a failing model safe to drop in.

## Cheap gnoll, expensive brain

That result is almost too good, and the cost table explains why you shouldn't get excited. I ran many simulations in parallel and watched each brain scale.

| path | throughput | scaling | limiting factor |
|---|---:|---|---|
| deterministic engine | ~940k decisions/s @ 4 cores | near-linear for this workload | CPU simulation |
| local SLM provider | ~2–5 decisions/s | plateaus near C=2 | model server / inference |

The deterministic engine is embarrassingly parallel — stdlib-only Python doing arithmetic and dice-rolls, a few kilobytes per fight, no external anything. The SLM brains share a model server and don't scale at all: throughput peaks around two concurrent simulations, then *drops* as threads contend, while latency climbs. A single decision costs the SLM path something like **10⁵×** more than the deterministic one. That doesn't mean the model is a hundred thousand times worse at thinking; it means it's the bottleneck, a serialized, cache-sensitive inference process with an entirely different performance shape. Hosting it under k3s in four containers made that painfully visible — adding simulation work never conjured model throughput; the queue was already pointing at the ceiling.

So for known content, running Hogger deterministically is free and running him on a model is absurd. That's not a knock — nobody should ship a 350M transformer to melee you for three abilities. One line: the SLM isn't the simulator's accelerator, it's its expensive exception path, and the only sane strategy is to keep the deterministic mechanics hot and reserve inference for the sparse places a policy difference might matter.

## The problem with Hogger

Here's the negative result I promised, and it's the most useful thing the project taught me. Across a full fight, the SLM's play is nearly identical to the deterministic engine's — and not because the model is clever. It's because **Hogger almost never offers a choice.**

I measured, per decision, how many special abilities were actually off cooldown and legal. For Hogger the answer is: **0% of decisions have two or more options.** His abilities are far apart — a 20–29s ability and a 46–48s one — so at almost every tick either exactly one thing is ready or nothing is, and the rest is auto-attack. When the legal set has one element, a greedy rule and a language model return the same element:

```text
SLM ≡ greedy policy ≡ deterministic policy
```

The model wasn't choosing wrong. It was barely choosing at all. And this is exactly the result I wanted the project to be *allowed* to produce. There's a lot of machinery around small models whose implicit sales pitch is that adding a model must make a system more intelligent. Hogger is the counterexample hiding in a lowbie zone: if the engine leaves no genuine decision space, semantics have nowhere to attach.

<figure class="figure">
<img src="/assets/images/hogtus-decision-space.png" alt="A bar chart of the fraction of decisions offering two or more legal abilities, per monster: Hogger and a healer sit at zero, a caster and Kael'thas clear the bar, with Kael'thas's Fireball-dominated Phase-4 at about five percent; below it a lane chart of Kael'thas casting all six Phase-4 abilities over a fight." style="max-width:min(100%,760px)">
<figcaption>The threshold, not a ranking: grey monsters never give the model a choice; Kael'thas clears the bar but, with authentic timers, only modestly — Fireball dominates.</figcaption>
</figure>

One line: an SLM isn't useful because it can answer; it's useful only when the system has handed it more than one defensible answer, and Hogger, three abilities spaced minutes apart, essentially never does.

## Six teeth, one narrow opening

A bigger model wouldn't fix that — a bigger number attached to the brain doesn't create decisions the engine never offered. What I needed was a monster whose kit actually competes for the same moment, without quietly turning the experiment into a full raid simulator. Kael'thas Sunstrider from Tempest Keep is a better monster for it, specifically his solo phase, where he stands alone and cycles a caster's kit rather than commanding adds and advisors.

Reconstructing him was its own honesty exercise. The encounter structure, spell ids and the Phase-4 ability set are confirmed from the **CMaNGOS TBC** script at `33a18ff`; the exact cooldowns, though, live in database spell-lists (`1962201–1962204`) that aren't in the checked-out trees, so the cadence I used is a **TrinityCore reference scheduler**, clearly labelled as such rather than passed off as an extracted CMaNGOS timer table. The phase shape is wonderfully hostile to a simplistic policy — advisors, seven weapons, revived advisors, then solo Kael, then a scripted sub-50% transition into Gravity Lapse — and the solo phase exposes six abilities with genuinely different roles:

| action | role | reference cadence | Hogtus models it as |
|---|---|---:|---|
| Fireball | single-target baseline | 2.4 s | direct damage |
| Arcane Disruption | raid-wide damage + control | 20–30 s | simplified AoE-control |
| Flame Strike | targeted ground hazard | 30–40 s | simplified hazard |
| Mind Control | non-tank control | 10–15 s, then 30–45 s | control abstraction |
| Summon Phoenix | summoned add / pressure | 45–55 s | add / dot abstraction |
| Shock Barrier → Pyroblast | self-shield + forced 3-cast combo | 60 s | self-buff + engine-owned combo |

The multi-target and positional spells (Gravity Lapse, the Nether vapors and beams of the post-50% phase) are marked as simplifications rather than pretending "damage a random player" is the same mechanic as a raid floating through the air while vapor clouds develop opinions. And there is **no Kael'thas hard enrage** — the inspected scripts don't establish one, so I didn't invent one to make a graph look dramatic.

Even here, the model's moment is modest. Fireball comes up every 2.4 seconds and dominates the timeline, so only about **5%** of decision points present two or more simultaneously-legal actions — real, unlike Hogger's flat zero, but no higher than a plain caster's. That isn't a flaw in the benchmark; it *is* the benchmark. The question is no longer "can a model press buttons?" but "when the rare branching point arrives, does a policy use the kit differently from a static priority list?"

## The rare teeth get hungry

A fixed priority list has a predictable flaw in a crowded kit: **priority is starvation in disguise.** If a high-priority baseline keeps coming ready before a lower-priority ability ever gets picked, that lower ability stays technically available and practically absent. Nothing illegal happens — the timer worked, the order worked — the encounter just quietly becomes narrower than its manifest claims. I ran the deterministic engine and the live Granite 350M through the same Phase-4 fight, same legal sets, and that is exactly what showed up:

| policy | abilities used | action-distribution entropy |
|---|---:|---:|
| fixed deterministic priority | 4 / 6 | 0.95 |
| SLM under the same legal gate | 6 / 6 | 1.24 |

<figure class="figure">
<img src="/assets/images/hogtus-kaelthas-gantt.png" alt="Two stacked timelines of the same Kael'thas Phase-4 fight: the deterministic engine on top, casting mostly Fireball plus two or three favourites and leaving Phoenix and Shock Barrier unused; the SLM below, casting all six abilities spread across the fight." style="max-width:min(100%,900px)">
<figcaption>Same boss, same legal sets: the fixed priority (top) starves the low-cadence spells; the SLM (bottom) spends its non-Fireball slots across the whole kit.</figcaption>
</figure>

This is not a claim that higher entropy is better combat AI — a boss that randomly cycles its kit because entropy looks nice is still a badly designed boss. It's a diagnostic. The SLM, bounded to the same candidates, didn't just spam Fireball whenever Fireball was up; it exercised the full kit, and the fixed priority left two declared capabilities hungry. That's what makes divergence the more interesting measure than raw match rate: against Hogger, matching the oracle is exactly right because there's no alternative; against Kael'thas, a policy that always matches a static priority may be proving obedience rather than quality.

The right next question isn't whether `1.24 > 0.95`. It's whether that divergence is *desirable* under a declared objective — pressure profile, encounter readability, healer load, fairness — and Hogtus doesn't yet know that answer. It just makes the disagreement visible and replayable. One line: the interesting SLM result isn't "it differs from EventAI," it's "it reveals where EventAI's fixed order quietly leaves declared behaviour unused."

## No mystical dice

There's one boundary I kept sharp, because it's the difference between a reproducible experiment and a vibe. Model sampling and combat randomness are different species of uncertainty and shouldn't share a vague label like "AI randomness." A model may sample among legal intents at a temperature above zero; the engine may roll a cooldown inside a declared range; those two need different controls and different audit trails.

So the trace keeps them apart. For each mechanical event it records the tick, context, RNG stream or seed, range, selected value and outcome, which means a cooldown is replayable even when a later provider chooses a different intent. For each model decision it records the legal candidate set and the returned symbolic action, before the gate accepts or rejects it. That gives the whole thing a clean shape: same initial state, same mechanical RNG stream, same manifests, same legality checks, different policy trace. The difference belongs to the provider, not to a quiet change in the dice underneath it.

It also fixes what the hybrid experiment on Hogger actually is. Not "turn the temperature up and see whether something cool happens," but *rolled cooldowns plus a declared temperature plus an explicit HP phase* — three named knobs that make the dull monster feel less robotic across repeated fights without pretending he has decisions he doesn't. If a phase-enrage variant ever gets added as a test, it gets marked synthetic, not smuggled in as a fact about the boss. One line: reproducibility doesn't require removing randomness, only knowing which randomness belongs to the engine and which belongs to the policy.

## Chewing it over

The flashy version of this project is "I gave Hogger a brain." The duller, truer version: I built a small deterministic world, placed a model at one narrow decision boundary, and found the first monster didn't need it. That's a good outcome. Hogger says a model can't manufacture value from an empty decision space; Kael'thas says a richer kit isn't automatically rich enough either — the meaningful windows are sparse, Fireball still dominates, and the first credible effect is policy divergence rather than some grand emergence.

The architecture is the part I trust most: a manifest declares what may exist, the engine owns what may happen, the provider proposes one legal intent, a gate makes the final mechanical call, and the trace lets me replay the argument later. That is the same small political arrangement as [Braid](/content/articles/braid/) and [Tauto](/content/articles/rules-set-in-silica/) — model proposes, deterministic code decides — only here it's enforced by a gnoll who does not care about my abstractions.

There's plenty of room to disagree. Maybe action-distribution entropy is the wrong lens. Maybe a static priority list is exactly what encounter design wants. Maybe a better model should optimise an explicit player-experience objective rather than just vary legal choices. Maybe raid encounters should stay deterministic because they're choreography, not negotiations. All of those are better arguments than "put an SLM in it and see," and I'll take the duller version: give the model a real choice, keep the rules set in keratin, and be ready for the honest answer to be that the monster was already simple enough. If you build monster AI for a living and I'm overselling that divergence — or you know a low-level mob that actually forks often enough to need a brain — tell me. Grrrr.

## Sources and methodological notes

- Hogger `448` and its EventAI behaviour were reconstructed from public CMaNGOS Classic ACID/EventAI references (GPL) and MaNGOS Zero database references (CC BY-NC-SA 3.0). The Hogtus manifests are independent reconstructions with attribution, not copied SQL.
- Kael'thas's encounter structure and behaviour reference [CMaNGOS TBC `boss_kaelthas.cpp`](https://github.com/cmangos/mangos-tbc/blob/33a18ff4d843eaa97f338e19cf29e813cf1a5bb5/src/game/AI/ScriptDevAI/scripts/outland/tempest_keep/the_eye/boss_kaelthas.cpp), GPL-2.0.
- The concrete Kael'thas cooldown schedule is labelled a **TrinityCore reference scheduler**, from [TrinityCore `boss_kaelthas.cpp`](https://github.com/TrinityCore/TrinityCore/blob/master/src/server/scripts/Outland/TempestKeep/Eye/boss_kaelthas.cpp) (GPL-2.0). It is not claimed as an extracted CMaNGOS spell-list timer table.
- Throughput, latency, oracle agreement, format validity, decision-space share, ability coverage and entropy are measurements from this build and its stated runtime, not a generalized model benchmark.
- "Format-valid" means the provider emitted an action conforming to the narrow expected schema; "legal" is decided independently by the engine. A malformed or illegal proposal safely becomes a passive fallback.
