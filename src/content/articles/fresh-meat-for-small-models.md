---
layout: article.njk
title: "Fresh meat for small models"
date: 2026-08-16
category: AI, programming
description: "Handing a WoW monster's brain to a small on-edge model — where it changes the fight, where it changes nothing, and why the engine, not the model, decides."
tags: []
draft: true
---

<!--
=========================================================================
WRITING SKELETON — not prose. Raw material to write the article from.
Everything below is factual, sourced, and lifted from the actual build.
Prose voice reference: braid.md + rules-set-in-silica.md (siblings).
Repo: https://github.com/kamilrybacki/hogtus
=========================================================================
-->

## 1. What the tool is (Hogtus)

- One-line: a small **hexagonal-architecture** simulation of a single WoW monster whose *brain is swappable* — a deterministic engine faithful to the server scripts, vs a lightweight on-edge SLM fed the same state.
- Core idea to hammer: **the engine owns the world, the brain only proposes an intent.** Same port, swap by one word.
- The port: `IntelligenceProvider.decide(context) -> events`. One question per tick: "given this state, what does the monster do now?"
- Two providers behind that port:
  - **DeterministicMobProvider** — EventAI-faithful; rolls the authentic `min–max` timers.
  - **SlmMobProvider** — dynamic action enum from the manifest; model returns a symbolic intent from the *legal* set only.
- **Legality gate** = the safety story. Model output is checked against the legal set; malformed/illegal → **passive fallback**, never illegal. (This is why even a mostly-failing model is safe to drop in.)
- Stdlib-only core; model runtimes are out-of-process infrastructure.
- Repo: `github.com/kamilrybacki/hogtus`. Test suite green (85 tests).

### Ownership split (the table worth keeping)

| layer | owns | may NOT do |
|---|---|---|
| manifest | declared abilities, conditions, targets, timer ranges | execute combat |
| engine (`HoggerSimulation`) | cooldowns, GCD, targeting, damage, RNG, the trace | infer a semantic preference |
| `IntelligenceProvider` | choose a symbolic action from legal candidates | change any mechanic |
| legality gate | accept / reject / safe fallback | invent a new action |

## 2. Centralized mob-AI system (data-driven)

- Not Hogger-specific. `MobManifest` + `MobAbility` (dataclasses) → **one generic provider** drives ANY monster.
- `MobAiSystem`: `spawn()`, `spawn_deterministic()`, `spawn_slm()`, `catalogue()`, `manifest()`, `config()`.
- Adding a monster = **writing one manifest**, no new code.
- 8 reconstructed low-level mobs (the bestiary figure): archetypes melee / caster / healer / control / DoT / enrage.
- Selectors for the SLM path: `GreedyMobSelector` (baseline, no network), `OpenAiMobSelector` (live llama.cpp, dynamic enum, temperature).

## 3. Where the data came from (provenance)

**Principle to state loudly:** manifests are **reconstructions of public facts with attribution**, NOT copied SQL. Facts (spell ids, timer patterns, HP, encounter structure) re-derived into an independent manifest + own tests.

### 3a. Hogger + the classic bestiary

- Behaviour records: **cmangos/classic-db ACID** (EventAI) @ `250a705` — GPL.
- Creature template stats (HP/melee/faction): **mangoszero/database** @ `bf6db4e` — CC BY-NC-SA 3.0 (non-commercial, share-alike).
- Timers converted ms→s. HP = midpoint of template range (`curhealth` is per-spawn runtime state, so manifest stores the *range*, engine supplies current HP).

| entry | mob | archetype | lvl | HP | ACID ref | abilities (spell id · timer) |
|---|---|---|---|---|---|---|
| 448 | Hogger | melee | 11 | 731 | acid_classic.sql L2600–2604 | Rushing Charge `6268` (on-aggro, once) · Head Butt `6730` (20–29s) · Pierce Armor `6016` (46–48s) |
| 40 | Kobold Miner | melee | 7 | 130 | L2510–2512 | Pierce Armor `6016` (init 4–14s, repeat 38–42s) |
| 476 | Kobold Geomancer | caster | 8 | 134 | L2623–2627 | Frost Armor `12544` (self, 5s) · Fireball `20793` (cast 3s, repeat 3.6–4.8s) |
| 124 | Riverpaw Brute | melee | 16 | 340 | L6667–6670 | Demoralizing Shout `13730` (init 3.8–16.8s, repeat 19.8–21.5s) |
| 456 | Murloc Minor Oracle | healer | 13 | 220 | L6720–6724 | Healing Wave `332` (friendly-HP, cast 2s) · Lightning Bolt `9532` (cast 3s, repeat 3.6–5.1s) |
| 504 | Defias Trapper | control | 13 | 256 | L6756–6760 | Net `12024` (root 5s) · Backstab `2589` (facing-only) |
| 1176 | Tunnel Rat Forager | dot | 12 | 255 | L3398–3401 | Bottle of Poison `7365` (DoT 1 nature/3s ×30s) |
| 1118 | Rockjaw Backbreaker | enrage | 12 | 236 | L1494–1495 | Enrage `3019` (EVENT_T_HP 20–0%, once) ← the only authentic HP-phase in the set |

- Note: the classic six from Elwynn/Westfall/Loch Modan have **flee at 15% HP, NOT enrage** — Rockjaw (Dun Morogh) is the honest enrage fixture; don't add enrage to the others as a "Vanilla fact".
- Engine simplifications (marked in code): no positioning, no allies/friendly targeting, no range-mode, no flee. Healing Wave (friendly-HP) approximated as self-heal in 1v1; Backstab (facing) / Net (root) positional legality approximated.

### 3b. Kael'thas Sunstrider (boss, TBC)

- Entry `19622`, Tempest Keep: The Eye. We model the **solo phase (Phase 4)** only.
- **Source split (important for the "connection to original scripts" section):**
  - **Encounter structure + spell ids + the Phase-4 selector set** = **cmangos/mangos-tbc `boss_kaelthas.cpp` @ `33a18ff`** (GPL-2.0). Authoritative TBC encounter reference.
  - **Exact cooldowns** = **TrinityCore reference scheduler** (TrinityCore `boss_kaelthas.cpp`, GPL-2.0). Reason: CMaNGOS binds the solo/P5 spell timers to DB spell-lists `1962201–1962204` that are **NOT present in the checked-out trees**, so concrete CMaNGOS timers are unavailable → labelled "TrinityCore-derived reference", never passed off as canonical CMaNGOS.
- Phase structure (CMaNGOS-confirmed): P1 advisors (Thaladred→Sanguinar→Capernian→Telonicus) · P2 seven weapons (120s / 90s pre-2.1) · P3 revived advisors (180s / 120s) · **P4 solo** · HP<50% → interrupt + run to center, 30s → **P5** ground↔Gravity Lapse (35s cycles).
- **No Berserk/Enrage** in either core script — deliberately absent, not invented.

**Phase-4 solo kit modelled (6 free actions):**

| action | spell id | role | TrinityCore cadence | modelled as |
|---|---|---|---|---|
| Fireball | `36805` | single-target baseline (filler) | 2.4s | direct damage |
| Mind Control | `36797` | non-tank control (≤3) | 10–15s, then 30–45s | control abstraction |
| Arcane Disruption | `36834` | raid-wide dmg + control | 20–30s | simplified AoE-control |
| Flame Strike | `36735` | targeted ground hazard | 30–40s | simplified hazard |
| Summon Phoenix | `36723` | summoned add | 45–55s | add / dot abstraction |
| Shock Barrier | `36815` | self-shield → forced Pyroblast ×3 | 60s | self-buff + engine-owned combo |

- **Engine-only / not free actions:** Pyroblast `36819` (child of Shock Barrier); Gravity Lapse `35941`, Nether Vapor `35865`, Nether Beam `35869` (Phase-5 positioning/multi-target). Marked as simplifications; not selectable by the model.

## 4. Connection to the original scripts (EventAI mapping)

- WoW classic mob AI = **EventAI**: `event → condition → action`. A condition carries chance / timer / phase / range / target-rule; an executor performs the action. It's already shaped like a rules engine — that's why it fits.
- Map to Hogtus fields:
  - `EVENT_T_AGGRO` → `on_aggro` (+ aggro quotes, `aggro_quote_chance`)
  - `EVENT_T_TIMER` init/repeat (ms) → `first_range_s` / `repeat_range_s`
  - `EVENT_T_HP` threshold → `hp_below` (phase / enrage)
  - one-shot event → `once_per_combat`
  - target (self / victim / friendly) → `target`
  - spell effect (from public spell data) → `damage` / `heal` / `dot_total` + `dot_duration_s`
  - creature template → `max_health`, `melee_damage`, `faction`
- The **rolled timer** is the key fidelity point: EventAI `urand(min,max)` → the deterministic provider rolls the same window (mechanical RNG, engine-owned), so an ability fires inside a range, not on a fixed clock.
- What the model gets vs what EventAI has: model sees only the **legal candidate set** (abilities off-cooldown, phase-ok, not once-used) + plain facts. It never sees timers. The engine still runs the EventAI-shaped legality.
- Authentic vs reconstructed vs simplified — be explicit in the article:
  - **authentic**: spell ids, HP-phase thresholds, timer windows (classic), encounter structure (Kael)
  - **reference**: Kael Phase-4 cooldowns (TrinityCore, not CMaNGOS)
  - **simplified**: positioning, allies, multi-target, movement, range-mode, flee

## 5. Findings (all measured, this build)

- **SLM reproduces the rotation without the rulebook** (never given cooldown timers, scored vs deterministic oracle over a canonical 448 fight):

| model | params | format-valid + legal | matches oracle | latency |
|---|---|---:|---:|---:|
| deterministic oracle | — | 1.00 | 1.00 | baseline |
| Granite 4.0 350M | 352M | 1.00 | 0.833 | 255 ms |
| SmolLM2 135M | 135M | 1.00 | 0.833 | 141 ms |
| Cactus Needle | 45M | 0.262 | 0.50 | 2885 ms |

- Cactus 45M too small → malformed calls 74% → **passive fallback** (gate held). Slower than the bigger two.
- **Cost / scaling** (parallel sims): deterministic ~**940k decisions/s** @ 4 cores, near-linear; SLM ~**2–5 dec/s**, plateaus ~C=2, ~**10⁵×** costlier per decision. Ceiling = model server, not the sim.
- **Hogger = null result**: **0%** of decisions offer ≥2 legal abilities → `SLM ≡ greedy ≡ deterministic`. Model never actually chooses. (Player win-rate vs deterministic Hogger across class bots ≈ 0.286.)
- **Kael'thas Phase-4**: ~**5%** multi-option decisions (Fireball 2.4s dominates → not higher than a caster; honest).
- **Divergence** (the real payoff, same fight, same legal sets, live Granite 350M):

| policy | abilities used | action-distribution entropy |
|---|---:|---:|
| fixed EventAI priority | 4 / 6 | 0.95 |
| SLM under same gate | 6 / 6 | 1.24 |

  - "priority is starvation in disguise" — the fixed order leaves low-cadence spells technically-legal-but-unused; the SLM spreads across the kit. Divergence, not match-rate, is the interesting measure on a boss.
- **Hybrid engine** (making the dull Hogger less robotic): rolled cooldowns + declared temperature + explicit HP-phase. Cosmetic variety, not new capability — label it.
- **Reproducibility / two kinds of randomness**: separate the model's temperature sampling from the engine's combat RNG. Trace records both (event: tick/context/RNG-stream/range/value/outcome; decision: legal candidate set + returned action pre-gate). Same seed + same manifests + same legality → different *policy* trace only.

## 6. Hosting

- k3s pod, 4 containers: `web` (HUD + encounter, :8770), `granite` (llama.cpp, :8081), `smollm` (llama.cpp, :8082), `cactus` (needle wrapper, :8083).
- Traefik + Pi-hole split-DNS, LAN + WireGuard. URL: `hogtus.<domain>`.
- (Runtime note for me: granite/smollm are `llama-server` with `--jinja`; SLM evals can run *inside* the web container reaching granite at `localhost:8081` when a port-forward is flaky.)

## 7. Licenses (state clearly)

- cmangos/classic-db (ACID/EventAI): **GPL** — reference for facts, do not copy SQL into an incompatible project.
- cmangos/mangos-tbc, TrinityCore scripts: **GPL-2.0**.
- mangoszero/database (templates): **CC BY-NC-SA 3.0** — attribution, non-commercial, share-alike.
- Safest framing: reference sources to reconstruct an **independent, factual manifest with attribution + own tests**.

## 8. Framing / thesis to carry

- Same spine as [Braid](/content/articles/braid/) and [Tauto](/content/articles/rules-set-in-silica/): **model proposes, deterministic code decides.** Here on monster behaviour instead of routing / rules.
- The honest arc: Hogger shows a model can't manufacture value from an empty decision space; Kael shows a richer kit isn't automatically rich enough (Fireball dominates); the credible effect is *policy divergence*, not emergence. The architecture (manifest declares / engine owns / provider proposes / gate decides / trace replays) is the trustworthy part.
- Open questions to invite disagreement: is entropy the right lens? is a static priority what encounter design wants? should raids stay deterministic (choreography, not negotiation)?

## 9. Figures available (already in public/assets/images/)

- `hogtus-bestiary.png` — the 8 reconstructed NPC models (one generic provider, per-mob ability timelines).
- `hogtus-decision-space.png` — % multi-option decisions per mob (Hogger 0 vs Kael ~5%) + Kael Phase-4 kit timeline.
- `hogtus-kaelthas-gantt.png` — deterministic vs live SLM over the same Kael'thas fight (4/6 vs 6/6).
- Also in the Hogtus repo report (not yet copied): landscape heatmap (class × engine), resources chart, Hogger-by-engine gantt, per-engine match charts.
