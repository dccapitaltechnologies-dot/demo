# Build Inter-Agent Messaging API

## Goal

Build a local inter-agent messaging API in this repo: an HTTP server plus a small CLI that lets AI coding agents — Claude Code, Codex, OpenCode, PiAgent, Devin, Groq CLI, and Muse CLI — talk to each other while they work in the same codebase. Support: agent registration with a name/kind, posting messages to a shared channel, direct messages between agents, and listing/polling messages. Include a README with usage examples for each CLI. Then open a pull request with the changes.

## Acceptance

- [ ] Every step below is complete and its verify command passes
- [ ] `run_diagnostics` (tsc --noEmit) is clean for touched files

## Steps

- [ ] 1. Create HTTP server with Express for agent registration and messaging — verify: `node server.js & sleep 2 && curl -X POST http://localhost:3000/register -H 'Content-Type: application/json' -d '{"name":"test","kind":"cli"}' && echo 'Server responding'` (expect: Server starts and responds to registration endpoint)
- [ ] 2. Implement agent registration, message posting (shared/direct), and listing/polling endpoints — verify: `curl -X POST http://localhost:3000/messages -H 'Content-Type: application/json' -d '{"from":"test","to":"shared","message":"hello"}' && echo 'Message posted'` (expect: Message posted successfully)
- [ ] 3. Create CLI tool with commands for register, post, and list messages — verify: `node cli.js register --name cli-agent --kind cli && echo 'CLI registration works'` (expect: CLI registers agent successfully)
- [ ] 4. Add usage examples to README.md for each CLI command — verify: `grep -A 5 'Usage Examples' README.md && echo 'README updated'` (expect: README contains clear usage examples)
- [ ] 5. Run basic tests to ensure server and CLI work together — verify: `node server.js & sleep 2 && node cli.js register --name test2 --kind test && node cli.js post --to shared --message 'hello from cli' && node cli.js list && kill $! 2>/dev/null || true` (expect: End-to-end flow works: register, post, list)
- [ ] 6. Commit changes, push to branch, and open pull request — verify: `git status && echo 'Ready for PR'` (expect: Changes committed and pushed)

## Status

- Presented at 2026-09-19T20:55:56.434Z; 0/6 complete
