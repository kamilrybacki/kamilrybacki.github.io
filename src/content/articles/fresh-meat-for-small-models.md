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

### 3c. What the source database actually is (decoded)

- **What MaNGOS / cmangos / TrinityCore are:** open-source reimplementations of the WoW *server*. Each ships a **world database** — a big SQL schema holding every static piece of content (creatures, spells, quests, loot, scripted AI). Hogtus reads *facts* out of that schema; it does not run the emulator.
- **The tables that matter here** (this is the structure to explain in the post):
  - **`creature_template`** — one row per creature *type*, keyed by `entry`. The stat block: `name`, `minlevel/maxlevel`, `MinLevelHealth/MaxLevelHealth` (HP *range*), `faction` (a faction-template id deciding who it fights), `mindmg/maxdmg` + `baseattacktime` (melee). Not a live creature — a definition.
  - **`creature`** (spawns) — actual placed instances of a template in the world. `curhealth` lives *here* and is per-spawn runtime state — that's why the manifest stores the template HP *range* and the engine supplies the current HP at sim time.
  - **EventAI / ACID** (`creature_ai_scripts`, shipped as the community "ACID" SQL) — the classic scripted brain. Each row is **one event** for a creature `entry`: an `event_type` + up to four `event_paramN` + a `chance`, wired to one–three `action`s. Literally the `event → condition → action` table.
  - **spell data** (`spell_template` / DBC) — `spell_id` → the spell's real effect: school, damage/heal, `cast_time`, duration, mechanic. Hogtus reuses the id + pulls effect numbers from *public* spell data.
  - **text tables** (`broadcast_text` / `creature_text`) — numeric text ids for yells/emotes; the aggro quotes are a text id + a chance.

**The IDs, decoded** (what each number in the tables above actually means, and where it lands):

| id in the data | example | what it is | where it goes in Hogtus |
|---|---|---|---|
| `entry` (creature id) | `448` = Hogger | unique id of a creature *type*; the join key across every table | `MobManifest.entry` (identity only) |
| `spell_id` | `6730` Head Butt · `36805` Fireball | unique id of a spell; the game's spell DB defines its effect / cast / school | `MobAbility.spell_id` + effect fields; used to execute + label the trace |
| `faction` (faction_template) | `20` | which factions the creature is hostile to | `MobManifest.faction` (context, **not** a model input) |
| `text id` | `1868` | a row in the text table for a yell/emote | source of `aggro_quotes` (we inline the English string) |
| `event_type` | `EVENT_T_TIMER_OOC` · `EVENT_T_HP` · `EVENT_T_AGGRO` | the "when" of an EventAI row | decides *which* manifest field the row becomes |
| `event_paramN` | `20000`–`29000` (ms) · `20`–`0` (%) | the rolled timer window / HP band / chance for that event | `first_range_s` / `repeat_range_s` (ms→s) · `hp_below` |

- Mental model to hammer: the database stores **numeric ids + rolled timer windows** — that's the *mechanism*. Hogtus keeps all of it **engine-side**. The model never sees a spell id or a millisecond timer.

## 4. From a database row to model input (the pipeline)

This is the section that answers "how does this data become input to the model?" — a projection, in five steps.

- **Step 1 — normalize a DB row into a manifest ability.** One EventAI row (Hogger's Head Butt: `event_type=EVENT_T_TIMER_OOC`, `param1/2=20000/29000` init ms, repeat ms, `action=ACTION_T_CAST spell 6730`) becomes one `MobAbility("head_butt", "Head Butt", spell_id=6730, damage=…, repeat_range_s=(20,29))`. ms→s; a short symbolic id (`head_butt`) is assigned; effect numbers come from public spell data. The event_type picks the target field: `EVENT_T_AGGRO`→`on_aggro`, `EVENT_T_TIMER`→`repeat_range_s`, `EVENT_T_HP`→`hp_below`, one-shot→`once_per_combat`.
- **Step 2 — the engine computes legality every tick.** Using the rolled timers (`urand(min,max)`, engine-owned RNG), the HP phase (`hp_below`), and once-per-combat flags, it builds the set of abilities that are *legal right now*.
- **Step 3 — facts to the model (the actual model input).** The model receives ONLY a small symbolic JSON — no ids, no timers, no faction:

```json
{
  "mob": "Hogger",
  "attacker_health_pct": 0.62,
  "distance_to_target": 3.0,
  "available_actions": ["head_butt", "pierce_armor", "wait"]
}
```

- **Step 4 — grammar-constrained choice.** The request pins the model's `action` field to a JSON-schema **enum of exactly the currently-legal ids**, so the model can only return a legal name, e.g. `{"action": "head_butt"}`. (Dynamic enum = the action space changes per tick, per mob.)
- **Step 5 — the engine decides & executes.** It re-checks legality, casts via the real `spell_id`, rolls the next timer, applies effects, writes the trace. The model's whole job was "which of these named options"; ids, timers, targeting and RNG never left the engine.

- So DB → model input is a **projection**: strip the numeric mechanism (spell ids, ms timers, faction), keep a human-readable *action vocabulary* + a few state facts. The DB timers still shape the model *indirectly* — they decide which action *names* appear in `available_actions` on a given tick — but the model reasons over symbols and semantics, not database ids.
- Authentic vs reconstructed vs simplified (state explicitly): **authentic** = spell ids, HP-phase thresholds, classic timer windows, Kael encounter structure; **reference** = Kael Phase-4 cooldowns (TrinityCore, not CMaNGOS); **simplified** = positioning, allies, multi-target, movement, range-mode, flee.
- One line: the database gives the *engine* the mechanism (ids + rolled timers); the model gets a projection of it — legal action **names** plus a little state — and never touches an id.

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
