---
layout: article.njk
title: "Small World of Wordcraft"
date: 2026-08-16
category: AI, programming
description: "Handing a WoW monster's brain to a small on-edge model — where it changes the fight, where it changes nothing, and why the engine, not the model, decides."
tags: []
draft: false
---

## Going down a familiar path

If anybody has been following my blog posts for some time, a certain subtheme is pretty much evident that constitutes a large portion of my affinity to tech in general. I was a pretty hardcore geek and a lot of time during my adolescent years were spent hacking/slashing/grinding a plethora of pixelated enemies, often together with my friends in a pretty robust collection of multiplayer games.

Our favourite ones were the Massively Multiplayer Online Roleplaying Games (MMORPGs), where we could fight together through spooky dungeons, epic underground dwarven complexes and other fantastical corners of Azeroth. A lot of core memories were created back then and they can be grouped into two categories: shenanigans during leveling of my various characters and those of raiding kind.

In this article, I will make a shout out to various snippets from the bestiary of foes encountered during these adventures in a pretty non-conventional manner. Reminiscing is an art of reconstructing treasured moments from the past, so my homage will be in the form of wacky simulations of these battles with use of my recently found comp-sci fixations.

Today, we will try to use small language models to function as more chaotic stand-ins for hardcoded AI scripts and bring back those battles to life. Why?

1. Because it sounds fun
2. I pay for my own electric bills, so I have no stakeholders to deem these ventures necessary or not
3. I genuinely want to explore miniature models aimed at tool calling (small spoiler)

## Choosing the right gear

Just as it is important to sort out Your equipment appropriately before new challenges, we need to gather what is available to us from the get go to know what are our strengths and limitations.

There are basically three aspects we need to delve into to see if reconstructing NPCs' and players' behaviors is feasible, because that would be the meat and bones of our simulated squabbles. In the next sections I will go over them one by one.

### Scriptures from the Core

Reverse engineering has a special place in the lore of World of Warcraft and we are not talking about the eternal rivalry between goblins and gnomes.

Blizzard never actually handed us the server. The game we poured all those years into was only ever half the software: our client was a facade that talked to an authoritative machine humming away in some data centre, and *that* machine is where the real rules lived.

So a stubborn slice of the private servers community set out to rebuild the missing half from the outside, largely by eavesdropping. Every action in the world crosses the wire as a packet, and by sniffing that traffic during ordinary play you can slowly triangulate the logic that must have produced it.

Glue enough of those observations together and you get an emulator: an open-source server that behaves *close enough* to the genuine article to fool the client application muscle memory. More on that process can be seen here: <https://www.youtube.com/watch?v=0sX-hH9NAeM>

The resulting implementation, MaNGOS, and a sprawling family tree of forks are still maintained to this day. For my experiment I have referred to the source code of the following projects:

- **cmangos** for the classic and Burning Crusade eras (its classic-db and mangos-tbc script sets),
- **TrinityCore** for the later, chunkier boss encounters,
- **MaNGOS Zero** database for the raw creature numbers.

In general, a mob's brain can be simplified to a simple table. The classic emulators drive their creatures with a system called EventAI (the community ships it as one enormous SQL file lnamed ACID), and every row is a simple mapping: **When** *X happens* => **maybe** (here the [RNG](https://en.wikipedia.org/wiki/Random_number_generation) part kicks in) You should **do** *that*.

An event is wired to action, which is almost always "cast skill/spell so-and-so at a given target". In short, if You read a creature's behavioral table rows top to bottom and you know its AI scripting.

Take the humble **Murloc Minor Oracle**, a level-13 nuisance from the Westfall coast.

Its whole script is four rules:

1. On engaging it flips into ranged mode and starts flinging **Lightning Bolt** every few seconds,
2. If a wounded friend is nearby and hurting, it interrupts itself to throw a **Healing Wave** their way,
3. When its own health dips to 15%, it flees from the player.

That's it: throw a bolt, heal a buddy, and run when slime hits the fan. Every bit of it fell straight out of the database with zone's worth of creatures, meaning we have access to an easy to interpret bestiary that can actually be simulated.

### Foes by the numbers

The AI table tells you *what a mob does*, but not *what it is*. Fortunately, there are other parts of databases that lets us glue together the identity of a chosen enemy:

1. creature_template table - functions as a collection of rows holding info such as: creature type, level, health range, faction (i.e. who it wants dead), its melee numbers, etc.
2. Spell data table that turns the bare spell IDs from the first table's rows into effects such as: damage, cast time, duration, school of magic.
3. A set of text tables, which hold the yells and emotes, so that "*Fresh meat!*" You remember from the Elwynn Forest is in practice an ID from the creature_template table pointing at a string.

None of that is in the shape you would want to hand to a simulation, though plusI had zero interest in dragging half of someone else's database into my own project.

So each chosen mob data is distilled, by hand or via use of a coding agent, into one tidy record I will call a *manifest*: its identity and a handful of abilities it has. For each ability it fires, we also store an effect of that skill and the rolled min–max timer window that says when it is allowed to fire again. The manifest thus is a **reconstruction of public facts,** with attribution **and not a copy of anyone's SQL**. The actual numbers are theirs and credited – I just packaged it into the data structure that will allow me to operate on it easily in code.

### Tiny Inscriptions Generator

A mob's decision, when looked at from a programmatic perspective, is simple: *given the situation, which of my legal abilities do I use right now?* That is almost exactly the shape of a **tool call**, which happens to be a fundamental thing that even small language models have gotten genuinely good at.

So instead of the rigid when-then table, I can hand a little model the current state and the list of moves it is *allowed* to make this instant, and let it choose. I picked three contenders from the featherweight division, to see just how small I could go before the whole thing fell apart:

| Model | Number of parameters | Short notes |
| :-: | :-: | :-: |
| Granite 4.0 | 350M | IBM's small tool-caller |
| SmolLM2 | 135M | tiny, punches above its weight |
| Cactus Needle | 45M | a function-caller built for *phones* |

Having all of the three building blocks roughly defined, we can now proceed into coming up with a way to hack all of them together into a semi-controlled computational experiment that will bring back to life my pixelated afterimages of the past. However, instruments are one part of this weird tale - we need to choose our deadly foes.

## Skimming through the bestiary

The choice of the mobs to be simulated is pretty much limited by the complexity of their internal "business logic", because we cannot choose anything that shows the following types of behavior:

1. Has phase changes that require effects from objects that need a player to interact with. **Examples**: Magtheridon, Trial of the Champion jousting fights, Oculus dragon flying
2. Is heavily dependent on summons, meaning that core abilities in the enemy rotation require their presence (or at least their corpses). **Examples**: anything that uses Corpse Explosion
3. Requires a couple of players to [switch between themselves when tanking the enemy](https://wowpedia.fandom.com/wiki/Tank_swap) - we would like to simulate one-on-one fights (at least when making the proof of concept) to keep the logistics simple. **Examples**: Onyxia, Festergut or anything that puts a stacking debuffs on players

Additionally, bonus points are given to the choices that are (at least for me) **emotionally packed**, due to the aforementioned adventures I had during my MMO gaming years.

Taking all of these factors in mind, here is the chosen group of unfortunate baddies that will get their digital rear ends deallocated:

First, some low-level cannon fodder. They are not much individually and should be handled by a single, simulated player:

<table class="bestiary">
<thead>
<tr><th></th><th>Monster</th><th>Lvl</th><th>HP</th><th>Type</th><th>Kit</th></tr>
</thead>
<tbody>
<tr><td><img src="/assets/images/mobs/mob-hogger.png" alt="Hogger" width="64"></td><td>Hogger <em>— Elwynn's meme "first boss"</em></td><td>11</td><td>~731</td><td>melee</td><td>Rushing Charge (on aggro, once) · Head Butt (20–29s) · Pierce Armor (46–48s)</td></tr>
<tr><td><img src="/assets/images/mobs/mob-kobold-miner.png" alt="Kobold Miner" width="64"></td><td>Kobold Miner <em>— the control group</em></td><td>7</td><td>~130</td><td>melee</td><td>Pierce Armor (recurring armour shred)</td></tr>
<tr><td><img src="/assets/images/mobs/mob-kobold-geomancer.png" alt="Kobold Geomancer" width="64"></td><td>Kobold Geomancer <em>— the token caster</em></td><td>8</td><td>~134</td><td>caster</td><td>Frost Armor (self-buff) · Fireball (3s cast, ~4s)</td></tr>
<tr><td><img src="/assets/images/mobs/mob-riverpaw-brute.png" alt="Riverpaw Brute" width="64"></td><td>Riverpaw Brute <em>— the debuffer</em></td><td>16</td><td>~340</td><td>melee</td><td>Demoralizing Shout (attack-power debuff)</td></tr>
<tr><td><img src="/assets/images/mobs/mob-murloc-oracle.png" alt="Murloc Minor Oracle" width="64"></td><td>Murloc Minor Oracle <em>— the healer</em></td><td>13</td><td>~220</td><td>healer</td><td>Lightning Bolt (3s cast) · Healing Wave (heals an ally) · flee at low HP</td></tr>
<tr><td><img src="/assets/images/mobs/mob-defias-trapper.png" alt="Defias Trapper" width="64"></td><td>Defias Trapper <em>— fights dirty</em></td><td>13</td><td>~256</td><td>control</td><td>Net (5s root) · Backstab (only from behind)</td></tr>
<tr><td><img src="/assets/images/mobs/mob-tunnel-rat.png" alt="Tunnel Rat Forager" width="64"></td><td>Tunnel Rat Forager <em>— the DoT</em></td><td>12</td><td>~255</td><td>DoT</td><td>Bottle of Poison (lingering nature DoT)</td></tr>
<tr><td><img src="/assets/images/mobs/mob-rockjaw.png" alt="Rockjaw Backbreaker" width="64"></td><td>Rockjaw Backbreaker <em>— the one that enrages</em></td><td>12</td><td>~236</td><td>enrage</td><td>Enrage (fires once, below 20% HP)</td></tr>
</tbody>
</table>

<figure class="figure">
<img src="/assets/images/hogtus-bestiary.png" alt="The reconstructed low-level bestiary rendered as mob cards" style="width:90%">
<figcaption><em>The reconstructed low-level bestiary: one generic engine driving each mob's abilities over a fight.</em></figcaption>
</figure>

For contrast, I have also decided to include an example of an adversary with a slightly larger arsenal of abilities i.e. a raid boss and for this purpose I have chosen the one, which I remember to be one of my raiding challenges from my Burning Crusade phase, where weeks of gearing up and polishing up raid tactics with my guild finally paid off. Plus, the whole fight looked cool.

#### Kael'thas Sunstrider (the boss)

<figure class="figure">
<img src="/assets/images/mobs/mob-kaelthas-screenshot.jpg" alt="Kael'thas Sunstrider casting a Nether Beam in Tempest Keep" style="max-width:min(100%,560px)">
<figcaption><em>Kael'thas Sunstrider in Tempest Keep, Nether Beam, Phase 5. Screenshot by Michelle (Glowberry), <a href="https://glowberry.wordpress.com/2011/01/30/tempest-keep-kaelthas-3-man/">glowberry.wordpress.com</a>.</em></figcaption>
</figure>

The one and only blood-elf prince - Kael'thas. Back then, he was the reason I left a large chunk of my teenage brain's sanity at the top of the Tempest Keep. The full fight is composed of multiple phases, but I've decided to only focus on the part after the advisors and weapons have left the boss room, which means that Kael'thas has to rely on his own spellbook and our previous requirements for battles to be simulated are met.

**Stats**: level 70 · raid boss · caster.

**Kit (solo phase)**: Fireball (the 2.4s filler) · Mind Control · Arcane Disruption · Flame Strike · Summon Phoenix · Shock Barrier. Six abilities on their own overlapping cooldowns.

## Sketching out the battle map

With the foes chosen and the tools laid out, the simulator can be planned with clearly set goals and functionalities.

The design was chosen to be hexagonal, with a small combat engine in the middle that owns every rule, and everything else, such as an engine for making decisions from a range of possible outcomes, plugs into it through one narrow socket. So the responsibility of the engine is to basically keep track of the current battle state i.e health, cooldowns, the global cooldown, targeting, and all the internal dice-rolls.

After every tick it turns to that socket and asks one question: *given the current state, what does this monster do now?* Anything that can answer that counts as a valid "brain". In our current experiment, two types of these cerebral entities will be interacted with:

- a faithful port of the old EventAI table: it rolls the authentic timers and plays the creature exactly as the servers did, and it serves as my ground truth to measure everything else against.
- a SLM adapter that proxies the decision enveloped in a pre-defined prompt template to one of the little models instead

The rule that keeps the whole contraption honest is a strict division of labour: a brain may only ever *propose* an action, and only from the set the engine has already declared legal this very instant.

The casting, the targeting, the cooldown bookkeeping, the trace or, in short, the whole machinery of modifying the state is the engine's job, while keeping the universal rules in check e.g. never fire something when it is still on cooldown. That one boundary is what makes it safe to drop a chaotic little language model into the driver's seat of a monster and still trust the numbers that come out the other end.

The model can suggest (or hallucinate, ofc) and the worst it can do is leave the monster doing nothing at that tick's resolution.

## Trial by combat

With all of the samophlanges running, the actual experiment is actually pretty simple to carry out. Each monster is subjected to the same fight twice, once run by deterministic EventAI port and once by a SLM-based brain.

To measure the self-sufficiency of an SLM in these scenarios, two aspects were considered, with appropriate metrics set in place.

1. **Can a small model play a monster's rotation without being handed the rulebook?**

The deterministic brain knows every timer down to the millisecond; the model gets none of that. All it ever sees is a tidy snapshot of the current moment (who it is, how hurt it is, how far away you are, and the short list of abilities that are legal *right now*), and from that it has to pick one. So this is a test of whether "sensible play" can be *inferred* from the situation and a menu, rather than memorised from a schedule.

I scored the model against the deterministic oracle over a canonical fight: how often it produced a well-formed, legal choice at all, and how often that choice matched what the real script would have done.

2. **When the monster actually has options, does the model do anything a rigid priority list wouldn't?**

That one, it turns out, depends entirely on the monster. It is where the whole thing got humbling.

## Reading the combat log

On the reproduction test, the two grown-up featherweights sailed through. **Granite 4.0 (350M)** and **SmolLM2 (135M)** both emitted a valid, legal action **100%** of the time and agreed with the authentic script on about **83%** of their choices, better than four-in-five, with the cooldown schedule kept firmly hidden from them.

The misses weren't illegal moves or nonsense; they were the model reaching for the right ability a beat early or late. For a 135M-parameter model playing a creature it was never trained on, off nothing but a snapshot and a menu, that is genuinely more than I expected.

The **Cactus Needle (45M)**, the phone-sized one, is the cautionary tale. It produced a well-formed call barely a quarter of the time and fell back to "just stand there and swing" for the rest. But here is the quiet hero of the whole design: *it never once did anything illegal.* The safety rail I bolted on (the model may only propose, the engine decides) turned a model that mostly failed into a monster that was merely dull, never broken. A failing brain degrades to a boring one, not a cheating one.

However, the deterministic brain is basically free (a handful of arithmetic and a dice-roll) and it happily churns through the better part of **a million decisions a second** on a four-core box. The model brains crawl by comparison: a few decisions per *second*, and a single decision costs on the order of **a hundred thousand times** more compute. Nobody should ship a 350M transformer to make a gnoll headbutt you. That was never the point, but it does sharpen the question of where a model could *possibly* earn its keep.

<figure class="figure">
<img src="/assets/images/hogtus-decision-space.png" alt="Decision space per mob: Hogger 0%, Kael'thas about one tick in twenty" style="width:90%">
<figcaption><em>Decision space per mob: Hogger never offers a choice (0%), Kael'thas only about one tick in twenty.</em></figcaption>
</figure>

So maybe the cost of more computationally intensive AI is its ability to create dynamic fights with varying scenarios? Well, Hogger's model brain and his deterministic brain play *almost identically*, and not because the model is clever.

It is because **Hogger almost never presents a choice.** His three abilities are spaced so far apart that at nearly every tick exactly one thing is off cooldown, or nothing is, and the rest is auto-attack. When the menu has a single item on it, a language model and a dumb priority list return the same item. The model wasn't playing well; it simply never had a fork in the road to be clever about. Hogger is too simple to need a smart brain (appropriate for a gnoll tbh).

So what happens during encounters where an engine hands the brain **two or more legal moves at once,** similar to how it is done during more sophisticated scripts of WoW boss fights?

<figure class="figure">
<img src="/assets/images/hogtus-kaelthas-gantt.png" alt="Kael'thas ability usage: fixed priority uses four of six spells, the model spreads across all six" style="width:90%">
<figcaption><em>Same Kael'thas fight, same legal options: the fixed priority reaches for four of six spells; the model spreads across all six.</em></figcaption>
</figure>

Kael'thas, in his solo phase, finally has a kit worth arguing about: six abilities on overlapping cooldowns. Even here the honest number is modest. Because his Fireball is up almost constantly, only about **one decision in twenty** offers a genuine choice between two or more spells.

But that is enough to make the two brains part ways. Handed the identical set of legal options, the rigid priority list leans on its favourites and quietly leaves parts of the kit to rot; in one run it only ever reached for four of the six spells. The model, given the same options, spread itself across the whole toolbox and used all six, spending its spare moments on the abilities the priority order kept starving.

Neither one ever cheats, since the engine still owns every rule. They simply *disagree about which legal thing to do*, and only a boss gives them enough room to disagree.

So the tidy, marketable takeaway would be "small models make smarter monsters". The truer, duller one is the thing I actually walked away with: a little model only changes how a monster plays *where the fight leaves it a real decision*. Give it a boss with an overlapping kit and it earns a visible difference. That is a good result, since it is the honest one.

## Strength in numbers

Every fight so far has been a duel: one player, one monster, mano a mano. But that was never how the world actually worked. You rarely pulled *one* gnoll; you pulled the camp, and the camp fought back as a group.

So for the last experiment I wanted the second to most complex version of the simulated fight. **What happens when the monsters can** ***help each other***, when one of them is a medic keeping its friends on their feet?

That is where a single decision finally couples two brains together. I brought back the Murloc Minor Oracle from earlier and dropped it into a pack alongside a couple of other melee-based murlocs.

Its Healing Wave, pointless for a 1-on-1 duel, now does the thing it was actually written to do: patch up a wounded ally and keep the pack going. The rule stays the same as everywhere else in this project.

The engine still keeps an eye on the world's shared state (clock ticks, one snapshot everyone decides on, all the legality) and the healer's brain may only *propose* to heal a target the engine has already deemed valid: a friend, hurt enough, in range.

<figure class="figure">
<img src="/assets/images/hogtus-multimob.png" alt="Healing toggled off to on flips the player win-rate from 0.64 to about zero; the live SLM healer matches the deterministic rule with zero illegal heals" style="width:90%">
<figcaption><em>Same three mobs, healing toggled off→on: a cooperative healer flips the player's win-rate from 0.64 to ~0. The live SLM healer (right) plays it like the deterministic rule, and heals illegally zero times.</em></figcaption>
</figure>

Take the exact same three monsters and toggle the healing off and on. With the Oracle's Wave disabled, a player using area damage clears the pack about **64%** of the time.

Switch it on, with nothing else changed and the player's win-rate collapses to **basically zero**. That is a genuinely *cooperative* behaviour, and it is exactly the kind of thing a one-on-one sim can never show you: it lives entirely in the seam *between* two actors. One monster keeping another alive is enough to turn a winnable fight into an unwinnable one for the unfortunate adventurer.

I ran the healer as a live SLM, using the Granite model again. The method was to let it pick each time whether to heal and *which* wounded ally to save, head-to-head against the dumb deterministic rule of healing whoever is at the lowest HP.

Here the conclusion is pretty much 1:1 as with the other cases: **the SLM plays it exactly like the dumb rule.** Same number of heals with the same win-rate against one player. It faced a real "who do I save" choice nine times per fight and still landed in the same place as the deterministic scripting, because in this regime *any* heal already flips the outcome i.e. is a net positive.

The healer's just being in the group is what decides things, not the finesse of picking the perfect target (which may be an interesting insight into the overall role of a healing class in various encounters in RPGs).

There is one number in that comparison I do care about, though: the SLM healed illegally **zero** times, so the universe rules are still followed. It only ever picked from the list the engine pre-approved; it never once healed an enemy, a corpse, or someone out of range.

So, remember, **kill the healer first!** A player who focuses the Oracle before it can land a heal simply deletes the problem; the cooperative behaviour never gets to happen. Duh.

## Time for a proper party

Even the murlocs small pack with healer was, in the end, still a fight against one simulated player. So, to honor the memories of fighting alongside my online friends, the last thing I wanted to know was whether a classical party of a Tank, a Healer and a DPS could fare against a pack of murlocs with the SLM-enhanced Oracle among them on the other.

Making that work meant promoting the lone player into a real party and making both sides play by the same rule. Everyone is now a combatant in a faction, everyone proposes a legal intent through the same seam, and the engine owns the parts that actually decide a group fight. The most important of those is threat.

A tank is not a big health bar that happens to stand in front; a tank is a creature that actively holds the pack's attention. So the engine now must keep a **threat table** for our enemies. An ability commonly used during tanking in WoW, taunt, becomes a on-off state that forces one mob onto the tank for a few seconds rather than just a large number, and aggro is sticky so a mob does not flip target on every rounding error.

The first thing the simulation told me was pretty much a given: a geared squad of three players **REMOVED** a handful of low-level trash, before anyone takes any considerable beating. It only becomes a fight when you throw a proper swarm at the - so I've pumped up the murlocs numbers so they come six at a time.

<figure class="figure">
<img src="/assets/images/hogtus-groupfight-gantt.png" alt="The murloc pack over one fight, coloured by who each mob is hitting; the swarm slides from the tank onto the healer" style="width:90%">
<figcaption><em>The murloc pack over one fight, one row per mob, coloured by who it is hitting. The swarm opens on the tank and slides onto the healer as the healing piles up threat.</em></figcaption>
</figure>

And then the fight did something I did not design and should have seen coming. Watch where the swarm goes. It opens on the tank, because that is who is holding the threat, and then it slides one murloc at a time onto the healer. Every heal the healer casts **generates threat**, and with six murlocs and a taunt that can only peel one back at a time, the healer quietly becomes the thing tanking the swarm.

It spends most of the fight healing itself while the DPS burns the pack down behind it. Nobody wrote that behaviour. It falls straight out of threat, with a healer making large amounts of semi-passive threat. Exactly the sort of thing you only get to see once there is a group.

<figure class="figure">
<img src="/assets/images/hogtus-groupfight-targets.png" alt="One murloc's target through the fight: tank at the pull, healer under threat, DPS at the end" style="width:90%">
<figcaption><em>One murloc's target through the fight: held on the tank at the pull, dragged onto the healer under threat, pulled to the DPS right at the end.</em></figcaption>
</figure>

Here, at last, is the first place in the whole project where the healer's decision changes the outcome. Turn the healer off and the party bleeds a member. Keep the heal but aim it only ever at the tank, ignoring and the party loses fights that a healer willing to triage would have made winnable.

Healing whoever is lowest keeps everyone standing; tunnel-visioning the tank does not. After a whole project of fights where the choice was cosmetic, the pack finally makes "whom do I save" a real question.

<figure class="figure">
<img src="/assets/images/hogtus-groupfight.png" alt="Average party survivors by healer policy, and the deterministic triage rule against a live SLM on identical seeds" style="width:90%">
<figcaption><em>Left: average party survivors by healer policy against the same swarm. Right: the deterministic triage rule against a live SLM on identical seeds.</em></figcaption>
</figure>

So I handed that question to the model. As before, the SLM healer picks each tick whether to heal and which wounded ally to save, and the engine still checks the target before anything happens. Over forty fights of live triage inside a swarm, it healed illegally zero times!

The rest of the answer is the one this project keeps giving me. The **SLM does not beat the dumb rule**. Healing whoever is lowest saved a little more of the party than the model did, and left fewer deaths that a heal could have prevented. The model played a sensible fight and never a broken one, and a single line of priority logic still did the job at least as well.

The interesting play lives in the gap between two actors, the safety rail is the part worth keeping, and the model earns its keep only where the engine leaves a real choice. Even here, where it finally had one, the rule I wrote to keep the model honest was already good enough.

What if we give our players a more robust and interesting assortment of skills, like some AoE or casting interrupts, so they can be dynamically used to kill several foes at the same time and/or stop the Oracle from healing other murlocs?

## Kick the healer

The party's modus operandi up until this point was pretty naive i.e hit things, heal things. The real game hands players other useful options. Area damage to catch several foes at once, and an interrupt to stop an enemy's spell cast. So for this round the DPS gets both, and the murloc Oracle's its Healing Wave is now a cast with a windup, not an instant top-up you can only race. In other words, it has a tangible casting time.

That one change is the only new mechanic which is plugged into the engine. The heal is a little state machine now. It starts as a windup, and either the cast finishes and the heal lands, or a kick cancels it partway and locks the Oracle out of healing for a few seconds. This interruption and cancelling out a certain school of magic is how it works in "real-life" scenarios inside World of Warcraft. Also, the heal's cooldown starts the moment the cast begins, so any interrupt (like the murloc deciding to back down from casting it) doesn't revert back to and instant retry.

I kept three things from the way the real game works: a cast is a state rather than an instant effect, a kick only does anything against a target that is actually casting right now, and the lockout is the engine's thing to keep in mind and never something the DPS gets to decide.

The AoE had to be a real choice and not a free win, or the DPS would just press it forever. So it only helps at three or more targets, has its own cooldown, and it does less damage per target than a focused hit. Single-target still wins when there is one thing that has to die, and throwing an AoE spell to DPS down one enemy is pointless.

<figure class="figure">
<img src="/assets/images/hogtus-groupkits.png" alt="Party win-rate by what the DPS is allowed to do, and the deterministic priority against a live SLM on identical seeds" style="width:90%">
<figcaption><em>Party win-rate by what the DPS is allowed to do, against the same swarm and casting Oracle, and the deterministic priority against a live SLM on identical seeds.</em></figcaption>
</figure>

Grinding the murlocs down one at a time, with no AoE and no kick, wins four fights in a hundred. Add the AoE but never interrupt, and it climbs to about a third, because the Oracle simply heals the wounded murlocs back up faster than the area damage wears them down.

If we let the DPS throw some interrupts and it wins every time, denying all six of the Oracle's casts over a fight, keeping the "do not out-damage the enemy healer, interrupt it" rule from MMORPGs going strong.

<figure class="figure">
<img src="/assets/images/hogtus-groupkits-logic.png" alt="Same fight seed for seed: deterministic priority on top kicks every cast and AoEs, the live SLM below kicks some casts and never AoEs" style="width:90%">
<figcaption><em>The same fight, seed for seed: the deterministic priority on top, the live SLM below. Each engine's DPS actions on the upper row, the Oracle's heal casts on the lower one.</em></figcaption>
</figure>

Then I handed the DPS to the Granite model. The model does map the fact that the Oracle is casting the healing spell to the option to kick it, at least some of the time. Over a fight it interrupts a little under three of the six casts and lets the rest heal, and it never once reaches for the AoE.

The deterministic model, on the same fights, kicks all six and AoEs the swarm in between. Denying half the heals and skipping the area damage entirely is not enough. Speaking in raw data: **the model wins one fight in twenty where the priority wins every one.**

The number I care about most is the same as ever. Illegal actions: zero. Handed a live interrupt in a chaotic swarm fight, the model never once kicked a mob that was not casting, and never fired a button that was on cooldown.

This is the first time the model showed a real situational signal of its own: it kicked because a cast was up, not because a token happened to sit first on the menu. It just could not turn that signal into a win.

## Time to hearth out

So, we've pitched the digitalized inhabitants of Azeroth against each other and indulged in some programmatic warfare, but what is all of that fighting worth it?

First, we can see that a small model can play a monster off nothing but a snapshot of the battle's state and a clearly defined set of actions (a.k.a tools). So the intended design and purpose of these models is realized, meaning they do what they are advertised to do.

The two, higher param SLMs matched the authentic script four times in five without seeing a cooldown timer, and even the phone-sized Neelde never broke any general universe rules with its choices.

You can hand a creature's turn to a language model and still get a fight that runs.

The part I would actually keep is the safety rail, not the intelligence. Make SLM only propose, but **not enforce or execute the action**. You can see that in every setup, right up to a live model picking heal targets durign a group fight: zero illegal moves, across the board.

In the worst case scenario, a faulty decision after a fight's clock tick degrades into a boring monster, but never a one that just spams Lightning Bolts constantly at Your face.

The disappointment, and the honest headline, is that intelligence almost never gets to matter. It only shows up where the fight leaves a real choice. Let's take a look at all considered scenarios:

1. Hogger has one button at a time and the model plays him identically to a lookup table.
2. Kael'thas, finally forces a disagreement with six overlapping cooldowns, but even he only offers a genuine choice about one tick in twenty.
3. The multi-mob healer decides the fight by preserving itself, not by being clever about whom it saves. For all of that, the model costs on the order of a hundred thousand times more compute per decision than the arithmetic it replaces.

Which points at where a brain like this would earn its keep, if anywhere: not on a gnoll with three buttons, but on encounters with wide, overlapping kits where a fixed priority list visibly starves half the toolbox.

Coming to our real world and translating that into boring, everyday language of us common people: **SLMs (and any language models really)** **gain more value the more fuzzy is the decision space to be tackled**.

In WoW mob's scripts, this domain is arithmetic by design and to remain fair, cannot include abstract measures in its inner workings - it is a bounded problem. We cannot generate anything novel for the boss fight to be solveable for players.

Moreover, as also seen in my previous Braid and Tauto projects, it is best to **let the small models propose** and then an **external harness validate the output** to still be compliant with higher-order rules of the system. Remember the Stripe's article I referenced during the previous blog posts?

This is where **A-C** **loops** could be useful, since the deterministic, coded quality gates can serve as clearly shaped sieves and funnels for more "liquid" language model output. We can see that SLMs constantly produce something that is **roughly** the correct shape and quality, but if something is available with declarative rules and mappings that make the decision space very concise and well behaved (with strategically best options to choose defined in form of Given-When-Then scenarios) – it is always better and less computationally intensive.

Probably, this is why the deterministic priorities engine often is more efficient in winning encounters, because these risk/reward ratios are explored and well-known: WoW has been present for decades so there are "best practices" available for it to follow i.e. we kinda **know the rules**.

What's next for me? I will keep looking for that sweet SLMs spot, because I really dig this type of less capable intelligence, which could be federated into e.g. task-specific workers at different stages of some data analysis pipelines. Plus, I can easily play around with them on my crappy, second-hand TinyPC-based infra.

Sometimes the best inventions come to You when You are most limited by external factors. Until then - time to get some more experience!
