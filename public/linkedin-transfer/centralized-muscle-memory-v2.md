An agent that needs **57 post-install tweaks** is not configured. It is terminal archaeology waiting to happen. 🏺

My agentic infrastructure keeps evolving: new tools, MCP servers, model providers, memory layers, and assorted doodads. The useful question is not whether another thing can be connected. It is whether the organism becomes more capable, or merely harder to reproduce.

My answer is deliberately unglamorous: give the useful parts a **version-controlled genome**.

For me, that means one source for instructions, skills and tool wiring, then render each piece into its native habitat:

• Claude Code gets `CLAUDE.md` and `rules/`
• Codex gets `AGENTS.md`
• Hermes gets one self-contained `AGENTS.md` through GitOps

The distinction matters. These harnesses are not identical, so I do not force them through one pretend-universal artifact.

A capability is more than a tool. It is a repeatable procedure plus a curated toolset plus the domain knowledge required to use both safely. Skills travel byte-for-byte; drift is detectable; Git stays the place where shared instructions change.

MCP wiring follows the same rule: configure an address, inject secrets at runtime, and merge only the managed entries. No static tokens in JSON. No shiny flamethrower applied to local state. 🤷

OpenViking is the search-oriented mirror for runtime context. Git remains the canonical source. One is for finding things quickly; the other is for changing them deliberately.

The fresh-machine test is then boring in the best way:

```bash
npm install
npm run agents:sync
```

…plus a reachable Cellarette. A reset should recover the working genome, not resurrect every accidental mutation from old terminal history.

The diagrams and full version:
https://kamilrybacki.github.io/content/articles/centralized-muscle-memory/

How do You decide which agent capabilities deserve permanent citizenship, and which should disappear after two successful runs?

#AgenticWorkflows #DevOps #Homelab
