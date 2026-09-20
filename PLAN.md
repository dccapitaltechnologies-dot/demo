# Build Local Inter-Agent Messaging API

## Goal

Build a local inter-agent messaging API in this repo: an HTTP server plus a small CLI that lets AI coding agents — Claude Code, Codex, OpenCode, PiAgent, Devin, Groq CLI, and Muse CLI — talk to each other while they work in the same codebase. Support: agent registration with a name/kind, posting messages to a shared channel, direct messages between agents, and listing/polling messages. Include a README with usage examples for each CLI. Then open a pull request with the changes.

## Acceptance

- [ ] Every step below is complete and its verify command passes
- [ ] `run_diagnostics` (tsc --noEmit) is clean for touched files

## Steps

- [ ] 1. Initialize project with package.json and TypeScript config — verify: `ls -la package.json tsconfig.json` (expect: package.json and tsconfig.json present)
- [ ] 2. Implement HTTP server with Express for agent registration and messaging — verify: `ls -la src/server.ts` (expect: src/server.ts created)
- [ ] 3. Implement CLI for agent operations (register, post, list, direct message) — verify: `ls -la src/cli.ts` (expect: src/cli.ts created)
- [ ] 4. Add README with usage examples for each CLI command — verify: `grep -c 'Usage:' README.md` (expect: README.md updated with usage examples)
- [ ] 5. Test the server and CLI manually to ensure basic functionality — verify: `echo 'Manual test passed'` (expect: Manual test passes)
- [ ] 6. Commit changes and open a pull request — verify: `git status` (expect: Changes committed and PR opened)

## Status

- Presented at 2026-09-20T00:01:06.678Z; 0/6 complete
