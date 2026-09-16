An agent that needs **57 post-install tweaks** is not configured. It is terminal archaeology waiting to happen. 🏺

Hello everybody in my merry network! 🫡

My smol AI playground keeps gaining tools, MCP servers and assorted doodads. Then I rebuild a machine and get the unfun questions:

Where does this instruction live today: `CLAUDE.md`, `AGENTS.md`, or a plugin manifest with a name that changes next Tuesday?

How does a new agent find the tool gateway? How do I stop a useful procedure, such as my Caddy plus Authelia publishing ritual, from evaporating after one successful afternoon?

My deliberately brain-dead answer:

• keep instructions, skills and tool wiring in one version-controlled source
• render rules into every agent’s native shape
• copy skills byte-for-byte
• generate MCP addresses, but resolve tokens at call time
• make a sync plus reachable Cellarette the bare-install contract

Git is where shared instructions and skills change. Search-oriented context storage helps at runtime, but does not become the source of truth. A hand edit in generated `AGENTS.md` is drift.

The fresh-machine ritual is then small: install the harness, run `npm run agents:sync`, restore plugins and check Cellarette. No static secrets next to MCP JSON. No shiny flamethrower applied to local state. 🤷

This does not make every agent equally capable. Hermes can reach my cluster; a laptop CLI normally should not. It makes operational nuggets inspectable, reproducible and removable.

The longer version, diagrams and all:
https://kamilrybacki.github.io/content/articles/centralized-muscle-memory/

How are You stopping instructions from mutating into incompatible species of `AGENTS.md` across your agent setups?

#AgenticWorkflows #DevOps #Homelab
