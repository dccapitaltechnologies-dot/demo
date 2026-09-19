# Build local inter-agent messaging API with HTTP server and CLI

## Goal

Build a local inter-agent messaging API in this repo: an HTTP server plus a small CLI that lets AI coding agents — Claude Code, Codex, OpenCode, PiAgent, Devin, Groq CLI, and Muse CLI — talk to each other while they work in the same codebase. Support: agent registration with a name/kind, posting messages to a shared channel, direct messages between agents, and listing/polling messages. Include a README with usage examples for each CLI. Then open a pull request with the changes.

## Acceptance

- [ ] Every step below is complete and its verify command passes
- [ ] `run_diagnostics` (tsc --noEmit) is clean for touched files

## Steps

- [ ] setup. Initialize Node.js project, install dependencies, create TypeScript configuration — verify: `ls -la && npm list` (expect: package.json, tsconfig.json, and node_modules created)
- [ ] server. Implement HTTP server with endpoints for agent registration, messaging, and polling — verify: `npx tsc --noEmit src/server.ts` (expect: TypeScript compilation succeeds without errors)
- [ ] cli. Implement CLI program for agent registration, sending messages, and reading messages — verify: `npx tsc --noEmit src/cli.ts` (expect: TypeScript compilation succeeds without errors)
- [ ] README. Create README.md with usage examples for server and CLI — verify: `cat README.md` (expect: README contains clear usage instructions)
- [ ] test. Manually test the system by starting server and using CLI to register agents and exchange messages — verify: `echo 'Manual test completed'` (expect: Agents can register, send channel/direct messages, and retrieve messages)
- [ ] git. Commit changes and create pull request — verify: `git status` (expect: Changes committed and PR ready)

## Status

- Presented at 2026-09-19T20:03:47.901Z; 0/6 complete
