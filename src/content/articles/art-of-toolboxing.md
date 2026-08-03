---
layout: article.njk
title: "The Art of Toolboxing"
date: 2026-08-03
category: AI, programming
description: "How a centralized MCP gateway tames agentic tool use across a homelab: proxying MCPs, wrapping REST APIs and CLIs behind one entrypoint, with profiles and a policy engine keeping agents out of the danger zone."
tags: []
draft: false
---

## Of context kings and men

If You are either a proud member of agentic AI adoption accelerationists or just a curious observer of the dark magic of pre-trained transformers, the chances are that You've brushed against the two blockbusters of this field: the "context is king" paradigm and a legendary [article from Stripe about their Minions architecture](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) for managing LLM-fueled code factories.

When analyzing both of them and which areas of the AI domain they strike against, the same nuisance can be identified, which was present LONG before the advent of modern technology. However weird it may sound, You can trace it back even to the day when an experienced blacksmith had to lay down for the hundredth time to his eager apprentice the basics of forming his soon-to-be first, crafted piece. Repetitive explaining of previously passed down knowledge.

You know the drill if You've worked with any agentic harness for extended periods of time, **especially** if this activity involved an usage of external CLIs or following stuff like API data contracts. When (nowadays pretty generous) context window depletes and woeful compression happens, the coin of autonomous agency is flipped and all of Your previous instructions are left to the whims of fate.

Example. In my crazy homelab, Claude has pretty much free reign when it comes to hopping around various machines, spawning k8s resources and other kinds of Opsy things. This is due to the fact I don't care what happens there, because I keep all of my manifests nicely version controlled, important data backed up and secrets vaulted so I can recreate the state of the whole system at any point of time.

And of course, when a "certified silly AI moment happens" such as a mess up of networking settings (happened once at the homelab's inception tho, so it is not a recurring thing), I can just plug in my monitor and keyboard to do my own admin work. In the early days of this frivolous life, I had to explain to Claude approximately 10 times a day to use the gh CLI tool instead of rapid firing HTTP requests to GitHub API, while constantly trying to fish the access token from some place in my homelab (so ofc, the AI tried to also ssh around my Lenovos for them). Somebody may say to just use CLAUDE.md but still the same stuff occurred constantly even when I had the global one present.

Now, throw around the need to spawn agents inside **different** machines, for example when needing to do some work there on local filesystems, but still using the same types of resources such as globally used API keys and other secrets, stored nicely on self-hosted Hashicorp Vault. What about my Argo-managed application on the homelab Kubernetes cluster? How are those agents able to consistently know where to look up their current state instead of blindly wandering around other nodes? Moreover, often when I have mentioned to my agent that I want to perform some Kubernetes-related work and I unfortunately hit the context compression midway the task, my previous explainations to first SSH to the control plane node and then do some kubectl maneuvers went out of the (context) window, which resulted in Claude telling me that this tool is sadly unavailable on my current machine and he can install it if I want, no problemo.

As You can probably gather from these ramblings, the specific area of context engineering I will be focusing on today is connected with repeated usage of the same tools in a manner that is replicable across different devices, with some additional bells and whistles that keep some guardrails against FORBIDDEN TECHNIQUES, reserved only for true professionals, such as deleting PersistentVolumes from totally unrelated application to the work at hand.

## Normally I hate Minions, BUT…

people at Stripe are pretty smart in their use. Instead of „banana screaming" memes incarnate, they are a part of highly efficient gray factories, which do the planning, writing, testing and self review of new features, with humans being present at the edges of this software development loop. I highly recommend reading their article about this framework, since it also has some nice concepts explained like A-C validation and managed knowledge bases.

Another cool aspect they delve into is **toolshedding** of commonly used tools, that is done to be compatible with plethora of harnesses and allow for controlled tool calls within the agentic workflows. In their case it is literally called a toolshed.

Generally speaking, there are two approaches of integrating agents with any other services, with both of them having their own dedicated „cults" around the internet and reasonable group of mix-and-matchers. The first type of integration are [MCPs (Model Context Protocol)](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro) introduced by Anthropic, which is a fully standardized way of hooking up to other sophisticated services that use a middleware in the form of the servers that translates requests from an AI into that tool's native language.

An example would be would be an MCP which allows an agent to communicate with a relational database using natural language queries that are transformed under the hood into standardized SQL snippets. The key word here is **standardized**, since MCPs allow us to set up appropriate guardrails in a way that a LLM carries our operations against the target resources.

In the simplest words, if there is a "man-in-the-middle" between us and the final host, things like authorization and sanitization can be universally handled by this one single entrypoint. This mitigates risk of totally decimated databases or unsafely handled credentials, that got leaked into standard output by accident, because *\<insert Your favourite LLM here\>* decided to perform a super cool trick like echo .env call out of the blue. Each permitted/supported operation is exposed via an interface composed of tools, so if a MCP developer decided to completely disable "the D" from a CRUD - he is free to do so.

The other approach is to ["just use CLIs, bro"](https://medium.com/@danielbanales/you-probably-dont-need-an-mcp-0ba0f7bb6057), which, in some cases, is actually a pretty good idea, especially if there is no maintained MCP available for a chosen service OR we want to expose something we've created without the need to host a dedicated server for communicating with it.

Alternatively, You can also decide to use a CLI tool instead of and MCP integration if You find that the context window of the agent has depleted significantly during everyday's work. [MCPs can eat through it](https://www.apideck.com/blog/mcp-server-eating-context-window-cli-alternative) and sometimes just putting a remark into the initially loaded context of Your harness to use the gh command instead of its MCP can save You thousands of tokens.

Terminal interfaces are inherently compatible with AI use due to the fact that they operate solely on text input and output basis **plus** all of the possible subcommands, together with their options, are readily available via their help page content and/or via man utility.

### Tools within tools

Speaking from the practical point of view, setting up this combination of specifications, which operations are to be available via CLIs and when to use specialized MCPs (that also require their own configurations) can be tedious. When it is only You and Your Claude, clanking away at the next market disrupting project, the risk of mismanagement and the overall amount of work to be done for setting these things up is bearable.

But the more machines You start to manage, the tediousness increases significantly mainly due to two factors: setup drift between different hosts (both in terms of tools versioning and their configuration) and rotation of various API keys used by the underlying clients. If somebody is fine with using credentials without any expiry date, then the second thing diminishes to some extent, but there are services that **do not allow** such immortality to happen.

Each time You have to refresh or recreate a key, the amount of work scales, let's say, linearly with the size of Your active nodes (or at least the number of hosts where the AI agents are planned to be accessible) - these mcp.json / claude.json files won't update themselves. The aforementioned drift is also closely tied to the contents of these configuration files, which have to be kept **at least comparable** i.e. have the same "core" of settings present within all of them.

However, there is also one pitfall that can make this delicate dance even more tricky - networking. Say that I have a N8N instance running within my Kubernetes cluster, that both the in-cluster and external services should be able to reach in an unified manner. Moreover, I want to disable from these interactions sensitive actions like managing credentials defined there and deleting whole workflows. So something that allows me to do some RBAC shenanigans globally across all of my agentic AI harnesses with an unified entrypoint so they don't wander around the infrastructure.

This type of situation is often found in software engineering and typically falls back into the usage of the adapter pattern, which allows to bundle together normally incompatible interfaces by hiding them behind a strictly defined protocol of interaction between the client and underlying machinery. If we then allow to encapsulate these adapters in a nice black box that allows to: check which services we can communicate with, what are the permitted calls to be made to them and manage the configuration of these tools automatically - we arrive at the state of a "superservice" that resembles the solution used by Stripe in their agentic infrastructure.

And what better way to expose this magical thingamajig, than through **an MCP**!

## Like a fine wine

For some time, after one session of the Viticulture board game (highly recommended, chill title), I've created a couple of projects that had winery-inspired names, for use in my agentic AI homelab gadgets.

One of them is Cellarette, named after a liquor cabinet dedicated to keeping and organizing various types of wine in a neat collection. Just as there are different species of grape and ways to serve their delicious distillates, data sources can also vary in their strains. This was one of the core requirements in this project - **a gateway to abstract away differing entrypoint types**: REST APIs, command line interfaces and other MCPs. The agent connects once and gets everything it is supposed to get — and, crucially, nothing it isn't supposed to touch.

On startup it downloads and installs missing CLI binaries into $CELLARETTE_BIN, following install scripts from the config, so maintenance of the up to date tools uniformly across the homelab is also done here to CATCH THE (setup) DRIFT. To add a tool to this gateway, You simply define it in plain YAML. Cellaratte dynamically registers it and exposes it as a regular MCP tool. There are three available source types:

- **mcp_proxy** — a proxy to existing MCP servers (SSE or streamable HTTP upstreams). Cellarette forwards the calls and monitors reconnects/keepalives, so sessions don't die in the idle state. In my homelab, these are the most notable examples of services exposed this way:
  - Vault for secrets,
  - Grafana for Prometheus/Loki metrics, alerts and on-call,
  - ArgoCD for the state of deployments on the k3s cluster,
  - n8n for automations.

- **http_wrapper** — any REST API turned into an MCP tool, without writing a dedicated MCP server for every single service. These can be silly little tools, like supporting Open-Meteo (the free weather API) to grab the weather data for a given latlong value. This is also useful for hitting an API of some service directly instead of waiting for a new version of its MCP to catch up to the latest, breaking changes **OR** go around the limitations in terms of the passed payload. Another spicy use-case would be exposing guardrailed state of the kubectl CLI to carry out, for example, READ ONLY operations so inspecting and describing various resources in the target k8s cluster.

- **cli_passthrough** / **cli_wrapper** — simply put, terminal interfaces commands as tools. Every CLI gets exactly two calls: `<name>__help`, so the agent discovers the capabilities on its own (terminal interfaces being inherently self-documenting, as established), and `<name>__run`, which takes a **typed argv array with zero shell parsing involved**. Currently exposed this way are gh and codex (this second one is sometimes useful to get a quick insight from an independent model instance). Do I do the same with claude? No, because I fear the banhammer, which seems to fall unexpectedly on some people according to the their subs' mortuaries posted on X.

Every source type has a *driver* that takes one of the interfaces mentioned above and adapts it to one shared call contract:

```typescript
interface McpCallResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}
```

(as You can see it is Typescript based)

http-wrapper, cli-wrapper, cli-passthrough-wrapper and McpProxyDriver do wildly different things under the hood (an HTTP request, an execFile without a shell, a forward to a remote MCP server), yet from the client's perspective they are indistinguishable. So a classic adapter as I have mentioned.

What other pattern-ish sorcery is used in Celarette's code? Well, the usual suspect really, when You do the handling of differing logic paths: the **strategy pattern**, where at the single tool-call entrypoint, the execution strategy is picked at runtime based on the source type:

```typescript
if (entry.driver === 'mcp_proxy')       return await driver.callTool(...)
if (entry.driver === 'http')            return await callHttpTool(...)
if (entry.driver === 'cli')             return await callCliTool(...)
if (entry.driver === 'cli_passthrough') return await callCliPassthrough(...)
```

Something however must also keep attention not only **where** the requests flow, but **why** and **if they should at all**…

## Prohibition

First security-based functionality which emerges instantly is possibility to define **profiles** — named subsets of tools, for example, defined with glob patterns:

```yaml
profiles:
  default:
    tools: ["*"]
  homelab:
    tools: ["vault__*", "grafana__*", "argocd__*", "netbox__*", "n8n__*"]
```

Under the hood, every MCP connection gets **its own server instance**, so two agents connected at the same time can work with completely different toolsets without stepping on each other's state. That is also useful if we want to make Cellarette usable to some agents, but we don't necessarily want to give it all of the toys e.g. when the model used there is not that powerful, but we still want it to pull some metrics from Grafana etc.

What is main problem of this centralized gateway approach? Well, a single service holding the keys to Your secrets AND Your CLIs. Thus, **auth is resolved at call time and never cached**. Credentials pulled from Vault via a Kubernetes ServiceAccount are fetched exactly when they are needed and do not linger in memory between requests.

Another crucial aspect is what happens after an agent successfully authenticates, but there is still a vulnerability coming from its non-deterministic nature - its internal dice may roll in the favour of kubectl delete and we can for example say goodbye to one of our points of failures within the infrastructure. I have decided thus to introduce a **policy engine for CLIs**. Before any argv reaches execution, it walks through a deterministic chain of rules, in a fixed order, so the behaviour stays predictable even when the config grows into a small legal document:

1. `max_args` — defense against argv-explosion DoS,
2. `deny_subcommands` / `deny_subcommand_paths` — blocking specific subcommands,
3. `deny_args` / `deny_args_regex` / `deny_argv_regex` — argument filtering, substring and regex,
4. `allow_subcommands` / `allow_subcommand_paths` — whitelists,
5. `require_args` / `require_any_of` — enforcing the presence of arguments.

The first matching deny short-circuits with a structured violation. Execution goes through execFile with shell: false.

Additionally, I am testing now a possibility to have some policies require explicit **approvals**. A rule can be set to on_violation: approval, so instead of an instant block, Cellarette creates a pending approval. In case of my homelab, an agent can ping me on **Telegram**, and the approval is pinned to the exact shape of the argv (via argv_hash) with a TTL on top. But this part is WIP and aimed towards more automated workflows.

Speaking of metrics: everything is exposed in **Prometheus** format via prom-client, from per-tool call counts down to mount errors in the tunnel.

The last access-related thing to solve was the fact that some tools have to operate on the files of the specific machine (like codex or gh) the agent is running on. You cannot "proxy" somebody's local filesystem through a stateless gateway, both due to security concerns and also the sheer amount of data moving between the server and the client.

For those, there is a **session-broker**: a Go-base Celarette sidecar living in the pod, which maintains per-agent sessions mapped by **SPIFFE certificates**, pushes the traffic through a chisel tunnel and mounts the remote filesystem over davfs2. When no session exists, workspace-bound tools degrade gracefully with a 424. This one is pretty much 100% vibe-coded, I am not going to lie, but manages to get the job done and I haven't had any major crashes during the last couple of months of using this functionality.

If my data kept randomly being siphoned by some shady organization to be used against me in the future - I will give You (a rather sad) update. However, I also have PII and DLP measures in my homelab cluster Egresses set up, so any credentials leakage is luckily prevented.

## Bottom of the bottle

This may not be a perfect translation of Stripe's methodology, but we should keep in ming that it all happens in the wacky environment of my homelab, where I can **physically** pull the plug out of a pesky machine from which an unruly agent keeps messing up my stack.

What I've wanted to test out is the efficiency and ease-of-use of such centralized entrypoint and I must say that during the approximately half a year of Cellarette's usage, I have grown to appreciate being able to spawn up Claude/Codex/Hermes with an instant way to access my other resources, without worrying about auth and other setup intricacies.

I can even copy and paste my JSONs with the configs for these harnesses and be pretty much able to use them right away, which has also opened an easier automation of this process via Ansible playbooks. Kubernetes also nicely autoscales the Cellarette Deployments, so I didn't have any problems with the traffic coming into this gateway.

What is the main takeaway? Honestly, I think that it shows the [API gateway pattern](https://microservices.io/patterns/apigateway.html), normally used in classical microservice architectures, being applicable in terms of agent-tool interactions, which are just clients dynamically calling servers, but with much less agency on our side and in a non-deterministic manner. The gateway here solves disadvantages present due to this probabilistic manner i.e. it defines the plane of possible operations that an agent can perform, which has an easily traversable structure (the harness can check exposed tools, call for manuals for different CLI subcommands etc.), and keep it outside of the "danger zone" composed of rms and deletes.
