---
layout: article.njk
title: "Centralized Muscle Memory"
date: 2026-08-24
category: AI, programming
description: "Config-as-code for agent instructions: one version-controlled source renders every agent's native rules, MCP config, and skills — so a bare agent install needs nothing but this sync plus a reachable Cellarette."
tags: []
draft: false
---

## The Genome of an Agentic Stack

My agentic infrastructure keeps evolving. New tools, MCP servers, model providers, memory layers, and homegrown doodads turn up, get wired in, and then have to prove that they deserve to stay. The trait I am trying to optimize is **Constant satisfaction** and a lack of **uncool** things like authentication errors. At least in AI fueled development 🤷

That means regularly looking at the whole setup as a living system rather than a pile of configs. Each new integration changes the organism a little. Some mutations make the work smoother. Others leave behind one off MCP entries, forgotten tokens, half used memory tools, and instructions pasted into files nobody remembers owning.

The question is whether a mutation makes the organism more capable, or merely harder to reproduce. A centralized, version controlled source gives the useful parts a genome: one place to inspect, prune, and replicate into the vendor shaped files each agent actually expects.

### Broadcasting capabilities

Moreover, especially if You’ve used a sneaky technique like a continuously or dynamically learning skill — e.g. `/learn-eval` or `/learn` from the [everything-claude-code repo](https://github.com/giovanisp/everything-claude-code) — You might have come across repeatable actions carried out in Your infrastructure that can be packaged neatly into, yet again, neat Markdown files with instructions. For me, one example would be exposing any new service I host via my custom domain and making it accessible from the Wide Web.

I have a Caddy reverse proxy, which needs new entries added to its config files every time I want to do so, and all of my sensitive, non-public applications are hidden behind an Authelia SSO. After the first couple of such “rituals”, I asked Claude to `/learn-eval` this procedure with some additional quirks of my homelab, with explicit instructions that say, for example: “if it is a database or other sensitive service, especially when explicitly noted as such by me during conversation, make sure it uses our local SSO as an authentication mechanism if possible — otherwise, [`/grill-me`](https://www.aihero.dev/skills-grill-me)” (shout out to Matt Pocock’s suite, it is **the bomb**).

Now, this learned capability is only available to this one agent, which sits on my edge a.k.a. master node with access to the whole infrastructure, but what if I want to make it available to static or even ephemeral subagents in some workflows so they can do similar devopsy gymnastics? Well, we kind of circle back to the previous knowledge-base conundrum, without any sentiment about us humans being able to read it or visualize it using floating dots and lines. These are the same centralization and access problems that we had with tools in the case of Cellarette.

So agentic workflows can use a little genome editing to make our interactions with the whole architecture more pleasant and smooth by keeping only those **capabilities** that are consistently a net positive for their wellbeing.

By **capability**, I mean an **ability to carry out predefined procedures using a curated set of tools within the context of accessible domain knowledge**. Example:

A DevOps agent can be said to have a **capability to carry out storage housekeeping jobs**. Why?

First of all, it has a **nicely crafted skill** that says which commands to run and in what order to get the current state of disk space on my nodes, with **clear instructions** on what to do if any of them reach predefined thresholds.

To do this, it has access to **pre-authenticated CLIs and MCPs** like Grafana and Vault (for `ssh` credentials), so it knows where and how to hop when the detection happens.

From past sessions, **it also has knowledge of which things to keep** that may seem useless (like seemingly unused Docker images) and, after the work is done, it can write a **postmortem** if any perturbations happen along the way.

Each agent has all of the important areas of its agentic workspace kept tidy and organized. And all of this organization brings everybody joy — especially You, when no integration errors pop up in the logs and “Jarvis” (ugh 🤮) has to clean up all of those dangling Docker images.

I do not want to remember whether the useful instruction belongs in `CLAUDE.md`, `AGENTS.md`, or a random plugin manifest. I want one place where I can read and change the rule, and a brain-dead mechanism that puts it where each tool expects it, **automagically** 🪄✨. In other words, something that functions as a small build and synchronization pipeline for agent instructions.

The source lives in [my dotfiles repo](https://github.com/kamilrybacki/dotfiles/tree/main/.rulesync). From there, [`rulesync`](https://github.com/thiswillbeyourgithub/rulesync) renders the same useful bits into the native shapes expected by the tools I use:

- Claude Code gets its `CLAUDE.md` and its `rules/` directory;
- Codex gets `AGENTS.md`;
- Hermes gets one self-contained `AGENTS.md`, delivered into the cluster with GitOps.

That last detail is important. A few tools can follow imports; a few cannot. Codex and Hermes need the whole instruction set in one file, so the build step expands it for them. Claude can keep its more pleasant directory structure. In short, we do not pretend those three products are the same thing or can be configured using a simple unified set of artifacts or an identical approach.

This is reflected in rules aggregated as plain Markdown. A piece that makes sense everywhere has `targets: ["*"]`, while something that only Claude understands stays Claude-only.

I can still open each file and change it without learning a new DSL. The only mildly clever part is deciding which files are included in which output.

![Figure 1 — One source, native configs where each agent expects them](https://raw.githubusercontent.com/kamilrybacki/kamilrybacki.github.io/assets/toolboxing2-figures/public/images/toolboxing2/fig1.png)

### Minimum Complexity Protocol

The tool connection **also** belongs in the same pipeline, so I do not have to manually — or even semi-automatically — configure it by copying and pasting a previously prepared JSON file.

My previous article was about Cellarette, i.e. the one gateway through which agents can reach the homelab tools they are allowed to use. But how does a fresh agent know how to reach it (host + auth info) when it has just been born (I literally just ran the harness install script on a machine)?

This next part makes sure every agent is actually pointed at that gateway after an install or rebuild. The generated MCP config contains an address, not a secret. On a desktop, it points at a local proxy; in the cluster, Hermes talks to the in-cluster Cellarette.

The token is injected where it should be injected — by the local proxy or the runtime environment — instead of being committed statically next to a JSON file, which is a **big no-no**, because it is technically a secret! 🙅‍♂️

The sync merges its own entries into existing agent state rather than replacing the whole file. Tools may locally keep unrelated things there that are not really fit for global sync across different agents: login state, project history, model settings, whatever else they decide to remember locally at a given point in time. So the goal is to add my plumbing and update only what needs to be changed, not to take a shiny, brand-new flamethrower to their internal paperwork.

![Figure 3 — Cellarette is the common door; each agent still uses its own handle](https://raw.githubusercontent.com/kamilrybacki/kamilrybacki.github.io/assets/toolboxing2-figures/public/images/toolboxing2/fig3.png)

### They all can “know Kung Fu” now

Skills are a slightly different breed of doodads. A skill can be one Markdown file, but it can also be a little directory with scripts, reference material, templates, and other files that a renderer has no business trying to understand. So skills are copied byte-for-byte. The sync check compares them as files. If the shared copy and the agent copy differ, that is drift, and it needs to be squashed.

Plugins get the same treatment, but with a different boundary. I version the list of marketplaces and plugins, then restore them from that list. I do **not** vendor other people's plugins into my dotfiles.

### Responsibility of knowledge

If You maintain a constantly growing collection of artifacts for agentic harnesses, like a categorized library of raw Markdown assets, You know that it is possible to point LLMs at such a central knowledge base — even a version-controlled one — by routing them through a global `CLAUDE.md` file or some other vendor-specific tricks.

LLM wikis, second brains, Obsidian-based vaults — it is cool to have mesmerizing, floating graphs that show “Your knowledge linking in ways You didn’t even know were possible”©️, but in the end, it is just a nicely organized tree of files. You can always sprinkle in some enhancements like [Johnny Decimal](https://johnnydecimal.com/), which helps humans and agents traverse the whole collection. But also, and this is a matter of honesty, a lot of automated knowledge-retrieval and synthesis stuff seen on TikTok or other short-form platforms shows people generating an **UNGODLY** amount of content that I am 100% sure they do not thoroughly read. It is just another flavor of data hoarding, I guess.

There is nothing wrong with ETL-ing new facts and storing them for later use — just keep in mind who will be the real recipient of this output. From my point of view, to get the most out of persistent knowledge storage for LLMs, it is nice to structure it in an actual database, notably a vector one, and just let agents figure out a way to categorize it **somehow**, in a standardized manner. Then, if I want to retrieve that information, I can just ask the agent about it. I do not need to see those mythical connections between topics such as `shopping_list` and `diet` manually, which makes the choice of backend pretty simple: **whatever is most token- and resource-efficient wins**.

[OpenViking](https://github.com/volcengine/OpenViking) sits beside this as the search-oriented mirror. Git remains the canonical place for instructions and skills.

OpenViking earns its place here because it treats context as something an agent can inspect, not merely retrieve from an abstract embedding soup. It exposes memories, imported resources, and skills under the `viking://` protocol, so an agent can browse a directory when the structure matters or use semantic search when it does not.

It also keeps shorter and longer views of the same material, letting an agent start with a small summary and pull in the full detail only when the task really needs it. TL;DR: it functions as both an index and a workable copy. However, edits to resources stored and exposed through a unified interface still **belong in git** — mainly because it gives me proper version control.

Using it, an agent can look for the relevant thing during its work without manually walking the whole file tree. That distinction keeps the setup understandable: one place is for changing the source; the other is for finding it quickly at runtime.

### The fresh-machine test

The only test that really counts here is a fresh installation.

If I install a CLI on another machine, I should not need to remember a secret checklist called “fifty-seven post-install tweaks” and copy janky Bash scripts alongside it. Instead, I can just run:

```bash
npm install
npm run agents:sync
```

and make sure the Cellarette endpoint is reachable. The result should be native rule files, MCP wiring, and the shared skills. The plugin restore script adds the external marketplaces again. Every sync goes from git **to** the agents, never the other way around.

A local edit to `AGENTS.md` is reported as drift; it is not quietly promoted into the shared rules on the next run. To change what every agent is told, somebody has to edit the source, run the checks, and commit that decision.

This check is not a grand theorem about correctness for correctness’s sake. It just stops a one-off fix made during a stressful afternoon from becoming undocumented configuration tribal knowledge that, in the future, You will not be able to explain.

![Figure 2 — A bare install has two real prerequisites: the sync and Cellarette](https://raw.githubusercontent.com/kamilrybacki/kamilrybacki.github.io/assets/toolboxing2-figures/public/images/toolboxing2/fig2.png)

### Not everything belongs everywhere

It does not make every agent equally capable. Hermes can reach the cluster; a laptop CLI usually cannot and should not. It does not magically make long-term memory correct. It definitely does not mean that an agent-generated skill deserves permanent citizenship just because it was written after one successful command.

What it does give me is a clear place to inspect those decisions.

When a repeated procedure proves genuinely useful, I can promote it into a skill, commit it, and let the sync distribute it to agents that should have it.

A good example would be the Caddy-plus-Authelia publishing ritual I need to do every time I want to expose a service from my homelab to the outside world.

On the other hand, when it turns out to be another shiny thing I used twice, I can remove one source file and stop carrying it around in six forgotten config directories.

That is the whole co-op idea. Not three consciousnesses merging into [a glowing ball of graph nodes](https://www.youtube.com/watch?v=6NukGtwJb7Y). Just agents sharing the small number of useful operational nuggets that have survived contact with real work.

![Figure 4 — A useful skill can travel; its source still has one home](https://raw.githubusercontent.com/kamilrybacki/kamilrybacki.github.io/assets/toolboxing2-figures/public/images/toolboxing2/fig4.png)

### Handing out the manuals

Cellarette centralises the question: **which tools may this agent use, and through which door?**

This second layer centralises a more mundane, operational question: **what is this agent capable of, in terms of knowledge and agency?**

Another way to look at it is this: Cellarette gives an agent a set of hands. The synced skills, knowledge, and configuration are the record of how those hands can — and, more importantly, *have* — been used by its ancestors. I guess 🤷

The answer is config-as-code, but in the least ceremonial sense of that phrase: keep the instructions in git, generate the vendor-shaped files, check for drift, and leave credentials out of the repository.

When a cold restart happens, I do not have to transcribe all of the Voynich-level scribbles from old terminal histories. I run the sync, inspect the source, and get back to work.

This is the useful sci fi part: after a factory reset, the agent does not wake up as an amnesiac clone with a mysterious pile of terminal archaeology to decode. I run the sync, inspect the source, and recover the working genome, without dragging every accidental mutation back into the new instance.

This is why every tool, piece of info, and gadget has its own place in my agentic wonderland. Everybody can find them quickly, without stressful trace stacks, and each of them is kept to bring me — and my soon-to-be-AGI crew — joy 😊
