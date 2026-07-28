---
layout: article.njk
title: "Braiding SLMs into event-driven architectures"
date: 2026-07-28
category: AI, programming
description: "How small a model an event router actually needs. Routing messy events by what they mean, then shrinking the model from a 500M Qwen down to a 26M Cactus Needle."
tags: []
draft: false
---

## Messy (in)take

Earlier this year I spent a couple of days at the [Data Innovation Summit](https://datainnovationsummit.com) in Stockholm, drifting between talks, and one theme kept surfacing. Company after company with the same problem: amorphous data pouring into their pipelines (half-structured events, logs, messages, documents, whatever an upstream system felt like emitting that day), almost none of it fitting the neat tables their warehouses expected. What caught my ear was the opposite of the usual "we pointed a giant cloud LLM at it." Team after team had quietly wired small, on-premise language models into the intake, little models that would look at an incoming stream and guess a schema for it, or read a messy payload and decide where it should go next, or do some off-hand scrap of analysis that used to need a person or a brittle regex. Not the star of the pipeline, more like a cheap local worker sitting by the door, sorting the mail.

That stuck with me, because the clever bit was all about placement: drop a small model exactly where the data is messiest and the decision is fuzziest, and keep it cheap enough to run on your own boxes. I still don't have one specific problem crying out for this yet, but I do have a homelab that already emits a wide range of event sources, each with its own shape: Grafana alerts, GitHub webhooks, n8n run summaries, Discord messages, Kubernetes events, ntfy pushes, and cron digests. So I wanted to try the idea on that pile, and to chase the question those talks left hanging: how little model do you really need for this?

The obvious first thing to try was routing. All that traffic arrives faster than any rulebook could keep up, in a dozen different shapes, and something has to sort it by what it *means*, not by whichever fields it happens to carry. The reflex is to throw a language model at the pile, but the real question is whether a small one pulls its weight there or just piles on latency and wrong answers.

So I built Braid around one rule: the model proposes, deterministic code decides. A cheap fast-path handles what it can, the model sees only the ambiguous tail, and a gate lets it suggest but never commit. It's an event-driven, multi-label router aimed at a job where mistakes are cheap: a misroute is a replay, not corrupted data. And because the deterministic parts do the heavy lifting, I kept shrinking the model, from a 500M Qwen down to a 26-million-parameter model built for phones. This is the build-log of what runs.

One honest note before any of the numbers. I vibecoded most of this, partly to see how small an SLM I could get away with and partly to teach myself fine-tuning by actually doing it. I'm a layman when it comes to training models, so read the tuning choices as a curious amateur's rather than an expert's, and weigh the results with that in mind.

## Weaving in the meaning

A semantic multi-label router. Heterogeneous events (a Discord message, a Grafana alert, an email, a Kubernetes event, a GitHub webhook) fan out to *several* destinations based on what each implies. The payload is never touched, only the routing decision is made, and a wrong route costs a replay and nothing worse, which is why a small model is allowed near it.

The destinations vary by profile, and I prototyped two. A maintainer bus takes GitHub webhooks (issues, PRs, CI, releases) and sorts them into advisory lanes like `security-review`, `regression`, and `docs`. An agent mesh takes events and routes them to the specialist agents they imply: `agent:devops`, `agent:debug`, `agent:data`, `agent:research`. In the agent mesh the destinations *act*, which tightens the governance (more on that below).

<figure class="figure">
<img src="/assets/images/braid-demo-dashboard.png" alt="The Braid demo dashboard: live stats (total routed, average fan-out, review rate), per-tier latency, a tier legend, the measured keyword-versus-retrieval-versus-SLM bar chart, and the pinned hero event routed to four lanes." style="max-width:min(100%,700px)">
<figcaption>The live demo dashboard: running stats, the measured tier comparison, and the pinned hero event fanned out to four lanes.</figcaption>
</figure>

## Making the semantic jump

Braid routes by the capability an event implies, and for the interesting events that capability is implied, never stated.

> "prod pod keeps dying after the b36 rollout and now the dashboard is stuck on old data, can someone sort it before the morning?"

Nothing there names an agent, a bug, or a pipeline. But it holds two problems at once, a crashing pod and a stale dashboard, so the right answer is a team: `devops` and `debug` for the crash, `data` for the pipeline, `review` because those agents act. A keyword rule sees a Discord message and nothing else; going from a symptom to the capabilities it implies, and splitting two problems into one route-set, is a judgement about meaning, and that judgement is the semantic jump, part of why a small model can earn a place in a router.

The same shape shows up on the maintainer bus, where an issue that says *"logout succeeds but the captured token still works after refresh, and the docs promise revocation"* implies `security-review`, `regression`, `docs`, and `auth-area`, and no field states any of the four.

## Complicated nature of intelligent strand

The temptation is to run every event through the model. Don't: most events don't need the jump, so Braid resolves a route in three tiers, cheapest and most certain first.

1. Predicate, plain rules. An explicit signal routes with no model: a `/deploy` command goes to `agent:devops`, a webhook `type=ci_failure` goes to `agent:debug`. Costs about a regex, deterministic and auditable for known cases.
2. Certified replay, a versioned route certificate. A repeat of an already-decided event replays that decision. The certificate is scoped to the source and pinned to a policy epoch, so a repeat skips straight to its known route-set. (The prototype fakes this with embedding-kNN: a close-enough neighbour replays its routes. Fine for measuring, but a cosine neighbour isn't proof of the same call. The real tier certifies, it doesn't guess.) Costs a lookup.
3. SLM, the fine-tuned small model. Only for the new or mixed cases, where no rule and no certificate fits. The semantic jump happens here, and it's the only place the expensive model runs, a few seconds of CPU inference that only ever proposes.

<figure class="figure">
<img src="/assets/images/braid-routing-pipeline.png" alt="Braid's routing pipeline: an event is normalised by ingest, then falls through three tiers cheapest first (predicate, certified replay, and the fine-tuned SLM) into a gate that proposes acting routes for review, then fans out without touching the payload." style="max-width:min(100%,540px)">
<figcaption>An event falls through three tiers cheapest-first, then a gate that flags acting routes for review.</figcaption>
</figure>

The tiers exist to save cost: rules are free but dumb, retrieval is cheap and handles most events because most events look like ones we've already seen, and the model is slow and can be wrong, so it only gets the leftovers. The latencies say why: the predicate-plus-retrieval fast-path answers in about 70 ms (p50), while an SLM call takes ~4.6 s p50 and ~6.6 s p95 on CPU, roughly 66× slower. Run the model on everything and you've built a queue; run it only on the tail and the router feels instant, while the model barely costs a thing.

## Confidence compounded

Claiming "you need a model" is cheap. So I routed a held-out split of the agent-mesh test set three ways: a keyword-rule baseline (what you'd write without ML), embedding-kNN (semantic similarity, no generation), and the fine-tuned model. I scored exact-set match, meaning the whole route-set had to come out right. Exact-set is a blunt metric, it counts a missed critical route the same as one extra advisory one, so read it as a rough comparison rather than a safety claim.

| method | exact-set · all | exact-set · implied cases |
|---|---|---|
| keyword rules (baseline) | 0.49 | 0.36 |
| embedding-kNN (baseline) | 0.81 | 0.72 |
| fine-tuned SLM | 1.00 | 1.00 |

Keyword rules fall apart on the implied cases: 0.36, missing two-thirds. No rule reaches "yesterday's values means data plus debug", and that gap is the plainest case for semantics.

Embedding-kNN is a strong, cheap baseline, scoring 0.72 to 0.81. Matching an event against past decisions recovers most of what keywords miss, with no generation at all. That argues for a cheap replay tier below the model (a baseline here, not Braid's certified Tier 2).

The model pulls ahead on the intertwined-problem case: splitting two problems in one message into the right team, in-distribution. Whether it also wins on genuinely new, no-neighbour events isn't shown by this test, since that regime is what a same-distribution corpus can't probe, and off-distribution the model over-fans, which review absorbs.

The caveat I won't hide: that 1.00 is in-distribution, and so is most of kNN's 0.81. My corpus is synthetic, and the right routes are basically a function of each event's "family", so both the model (which memorised) and kNN (which found a near-copy) look better than they would in the wild. What's real here is the ranking and the keyword gap. The actual numbers are a ceiling, not a promise. A number you can trust needs a whole-family holdout and real events. A good score on data you trained on proves you can memorise, not that you can generalise. That's the whole game.

One line: the value is the ladder, not the model. Plain rules for the mechanical stuff, certified replay for the repeats, the model only for the uncertain tail, and even there review has the last word.

## Needle thin as a hair

The deterministic tiers carry most of the load, so the model can keep getting smaller. I started with a [Qwen2.5-0.5B](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct), [LoRA](https://arxiv.org/abs/2106.09685)-fine-tuned on a rented T4 ([Modal](https://modal.com)) for a few minutes, on a corpus of `event → route-set` examples written so the route is implied, never keyword-derivable. It nailed the task in-distribution (the ~1.0 above) and still serves the demo today, but if the scaffolding does the heavy lifting, the model can afford to be much dumber.

A bake-off showed [Granite 4.0 350M](https://huggingface.co/ibm-granite) learns it just as cleanly. Then I tried [Cactus Needle](https://github.com/cactus-compute/needle), a 26-million-parameter function-caller built for phones, roughly a twentieth the size of the Qwen. Cold, it was useless: right function, wrong arguments (0% exact-set). Fine-tuned on the same corpus (on Modal, not the homelab), that 26M model reached 0.875 exact-set on held-out events. A little below the 0.5B and twenty times smaller, it still splits the two-problem message into the right four-lane team, and it quantizes to a 38 MB bundle small enough for a phone.

| model | params | artifact | held-out | runtime tested | RAM\* | CPU p50\* |
|---|---|---|---|---|---|---|
| Qwen2.5-0.5B | 500M | 954 MB | 1.00 | Transformers | 3.7 GB | ~5.0 s |
| Granite 4.0 350M | 350M | 222 MB | ≈1.0 | ollama Q4 | ~230 MB | 0.43 s |
| Cactus Needle | 26M | 38 MB | 0.875 | JAX (x86) | 3.4 GB | ~8.6 s |

\* *RAM and latency are the observed prototype footprint, not a clean model-only comparison. The three ran on different runtimes (Transformers, ollama, JAX), so quantization, allocator, and process overhead all differ. Params, artifact size, and accuracy are the honest cross-model columns.*

Two things fall out of that table. The size story holds up: Needle is 19× fewer parameters and 25× smaller on disk than the Qwen, and fine-tuning still pulled it from 0% cold up to 0.875, a 12.5-point drop for a twentieth of the model. The less flattering half: smaller didn't seem to mean cheaper. Needle's JAX runtime on my x86 box was actually slower and used nearly as much RAM as the Qwen. So a tiny model doesn't automatically make a tiny system, and at least here the runtime seems to count about as much as the parameter count.

To make that concrete: run Qwen0.5B and Granite350M through the *same* runtime ([ollama](https://ollama.com), Q4) on the same CPU, and Qwen answers in 1.55 s on 484 MB, Granite in 0.43 s on ~230 MB. Most of the Qwen's 5 s in the table is the heavy Transformers path, not the model. Needle's real phone-grade speed lives on Cactus's ARM engine, which won't build on x86, so its honest cost number is still open.

For a plain CPU server, Granite 4.0 350M is the pick I'd make. It was the fastest (0.43 s), the lightest (~230 MB), and looked to match Qwen on accuracy in the bake-off, so Qwen's extra 150M parameters buy little here. Needle probably only pays off on the hardware it's built for, an ARM phone or watch running Cactus, where its 38 MB and tiny footprint should win. On a server it looks like the wrong choice, while Qwen0.5B stays the safe top-accuracy pick if you can afford the cost. (One caveat: Granite's accuracy is bake-off-level, not an independent held-out number like Qwen's 1.0 and Needle's 0.875, so treat that column cautiously until I re-run it cleanly.)

The model tier is just a contract, `event in, route-set out`, so swapping Qwen for Needle took zero engine changes and Braid never learns which model it holds. That seems to be the takeaway: the stronger the deterministic tiers, the smaller the model that fits in the middle, as long as its runtime is small too.

### Teaching by example

Fine-tuning teaches the model by example instead of by hand-written rules. Show it an event, let it guess the route-set, compare against the right answer, adjust the weights a little toward the right one, and repeat a few thousand times (each full pass is an "epoch"). The behaviour is learned from corrected examples, nothing is hand-coded, and the same recipe teaches any task you can show enough examples of. Few-shot (pasting examples into the prompt) is the cheaper, temporary cousin. Here it wasn't enough, so the lessons had to go into the weights. The discipline that keeps it honest: hold a chunk of examples back and grade only on those. It's the only way to tell learning from memorising the answer key, which is why the numbers above carry a caveat.

<figure class="figure">
<img src="/assets/images/braid-finetune-loop.png" alt="The fine-tune loop: labelled events become a family-partitioned corpus, a LoRA adapter trains on a Modal T4, it merges into the base and serves in a CPU sidecar, gets evaluated on a held-out split, and deploys behind the gate, while human corrections feed back into the labels." style="max-width:min(100%,540px)">
<figcaption>Labelled events become a corpus, a LoRA adapter trains on a Modal T4, then merges and serves in a CPU sidecar.</figcaption>
</figure>

Serving is deliberately boring, and that's the point: the merged model runs directly under [Transformers](https://huggingface.co/docs/transformers/index) in a small CPU sidecar, fed the exact prompt it trained on. The router calls it over HTTP (`/infer` for a route-set, `/embed` for the retrieval tier's vectors), gets back JSON, and the decision engine unions that with the predicate and replay tiers. No GPU at inference, no special runtime, and the model sits on a small persistent volume so a pod restart never loses it.

## Combing unkempt data

Real event buses aren't uniform: a Grafana alert is `{alertname, severity, summary, labels}`, an email is `{from, subject, body}`, and a Kubernetes event is `{reason, involvedObject, message}`. Braid's ingest layer pulls the text that actually means something out of *any* shape (it grabs the strings and skips the boring metadata), then routes on that. So a Grafana `PodOOMKilled` alert and a Discord "the pod keeps dying" message land on the same route-set, `{debug, devops}`, though they share no field name.

It also keeps the model on familiar ground: whatever comes in, the model sees a tidy `{source, text}`, which is what it trained on, so the mess stays in the ingest layer and the model never has to deal with it.

<figure class="figure">
<img src="/assets/images/braid-demo-feed.png" alt="The demo live feed: Discord, email, monitor, Kubernetes, and GitHub events, each with a different field shape, routed multi-label to tier-colored lanes with review flags." style="max-width:min(100%,700px)">
<figcaption>The live feed: Discord, email, monitor, k8s, and GitHub events, each a different shape, routed multi-label.</figcaption>
</figure>

## Advantages of agnostic loom

The Braid core knows nothing about GitHub, or Grafana, or your agents. All the domain knowledge lives in configuration, not code. Three small things:

- the route catalog (`BRAID_ROUTES`): the lane names the model may emit, a JSON list;
- a one-line system prompt telling the model what those lanes mean;
- a handful of optional predicate rules for the mechanical cases.

Swap those and the same binary routes a different world; the maintainer bus and the agent mesh here are the same service with different env vars. But that makes the engine reusable, not the deployment: a model trained on agent lanes won't be safe or accurate on factory telemetry without its own catalog, prompt, predicates, and evaluation. What's genuinely free is the plumbing: ingest walks any JSON shape, keeps the strings, and hands the model a tidy `{source, text}`, so there was never a schema to be tied to.

## Roping into the Braid

Any service talks to Braid over one small contract, which today is HTTP; the planned durable path rides an event bus ([Redpanda](https://www.redpanda.com)), where you publish to an ingest topic and subscribe to the lane topics. Either way there are four moves.

Produce. Hand it any JSON object, no registration and no schema:

```
POST /route
{ "source": "discord", "channel": "#ops",
  "text": "prod pod keeps dying after the b36 rollout and the dashboard is stale" }
```

Get the decision back: the lanes, which tier decided each, whether it needs review, and your original payload untouched:

```
{ "decision_id": "dec_9f2a…",
  "routes": [ {"name":"agent:debug","tier":"slm","score":0.7},
              {"name":"agent:data", "tier":"slm","score":0.7},
              {"name":"review",     "tier":"review","score":1.0} ],
  "review": true, "source": "discord",
  "shape": ["channel","source","text"], "latency_ms": 5140 }
```

Consume the stream. A subscriber tails every decision live and acts on the lanes it cares about (server-sent events in the demo, a topic subscription on the planned bus):

```
GET /events        # one routed decision per message, streamed
```

Correct it. Reviewers close the loop, and corrections are kept as candidate training data that don't touch the live model:

```
POST /feedback
{ "decision_id": "dec_9f2a…", "add": ["agent:devops"], "remove": [] }
```

That's the whole surface: a producer needs one endpoint and knows nothing about the tiers, and a consumer needs only the lane names it subscribes to. The routing is Braid's problem, the payload stays the producer's.

## Governance and responsibility

On the maintainer bus, routes are advisory, and a wrong one costs a maintainer thirty seconds. The agent mesh is sharper, because the destinations act: `agent:devops` can deploy, `agent:coding` can open a PR, so the tolerance no longer holds by default and the rule tightens.

The model suggests routes, but Braid only delivers to an allowlisted set of destinations, and a separate policy, not the router, approves anything that can't be undone. Read-only agents (research, docs, memory) can act on a route directly, while acting agents (devops, coding, data) get a proposed dispatch that a human or a policy has to confirm first. Same rule as the top of the post: the model proposes, deterministic code decides, a human approves. If the action is just delivering a message, the gate can be loose; if it's letting an agent change something real, the gate is the whole point.

## Rules set in keratin

The shape is the same as [Tauto](/content/articles/rules-set-in-silica/), pushed a notch further. Tauto strips a language model to one deterministic-checkable job (turn prose into a formal contract) and lets a proof engine do the trusting. Braid does the same to routing: the model only proposes, and everything that actually matters around it is deterministic and gated.

Braid leans on the model even less. Tauto points at a hosted OpenAI-compatible model for its one translation step, while Braid's proposer is a fine-tuned sub-1B, at the extreme the 26M Needle, on plain CPU with no GPU. The trend is the point: the more deterministic scaffolding, the smaller the model in the middle.

The two are wired together. Braid's governance invariants (the payload is never mutated, an SLM proposal flags `review`, an empty route-set escalates, acting agents wait for a human) are authored as Tauto contracts in the repo, and CI fails the build if any two contradict. The router's rulebook is machine-checked, like a business-rule set. Rules set in silica, one layer down.

## Tying it off

The tidy story would be "small models are great at routing." The duller, truer version: a small model seems to be one tier of a router, and not the tier doing the real work. Predicates and a certified-replay cache handle most of it, cheaply and auditably; the embedding search is a fast pre-filter, not a decision-maker. The model gets one small job, the uncertain tail nothing cheaper can handle, and even there it only proposes while review decides. Whether it wins on brand-new stuff it's never seen is still unproven, which is why those calls go through review. The gate around the model and the tiers under it seemed to matter more than the model itself.

Or in one line: a language model seems to earn its place in a router mainly where meaning is required, the uncertain tail, behind plain rules and certified replay that do the rest for free.

Every number here is real and from this build: the bake-off ran on a Modal T4, the keyword/kNN/SLM comparison against the live model over a held-out split, the latencies measured off the running service. The in-distribution caveat matters, and I've flagged it wherever it bites. If you're routing events with small models, or you reckon I'm overselling the retrieval tier, tell me.
