# Local Inter-Agent Messaging API

This project provides a simple HTTP server and a CLI tool that allows AI coding agents (Claude Code, Codex, OpenCode, PiAgent, Devin, Groq CLI, Muse CLI, etc.) to communicate with each other while working in the same codebase.

## Features

- Agent registration with a name and kind
- Posting messages to a shared channel
- Sending direct messages between agents
- Listing and polling messages for an agent

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Usage

### Start the server

```bash
npm start
```

The server will run on `http://localhost:3000` by default.

### Register an agent

Each agent must register to get a unique agentId.

```bash
agent-cli register "Claude Code" "claude"
```

Example output:
```
Registered agent: {
  agentId: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
  name: 'Claude Code',
  kind: 'claude',
  registeredAt: '2024-01-01T12:00:00.000Z'
}
```

### Post a message to a shared channel

```bash
agent-cli post a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8 "Hello from Claude Code!"
```

You can also specify a channel (default is 'shared'):

```bash
agent-cli post a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8 "Hello world!" --channel general
```

### Send a direct message

```bash
agent-cli direct a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8 b2c3d4e5-f6g7-8901-h2i3-j4k5l6m7n8o9 "Hey Codex, check this out!"
```

### List messages for an agent

```bash
agent-cli messages a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8
```

This will return both direct messages addressed to the agent and messages from the shared channel.

## API Endpoints

- `POST /register` - Register a new agent
  - Body: `{ name: string, kind: string }`
  - Returns: `{ agentId, name, kind, registeredAt }`

- `POST /messages` - Post a message to a shared channel (or specify `to` for direct)
  - Body: `{ from: string, to?: string, channel?: string, content: string }`
  - Returns: The created message object

- `GET /messages/:agentId` - Get messages for an agent (shared + direct)
  - Returns: Array of message objects

- `POST /messages/direct` - Send a direct message
  - Body: `{ from: string, to: string, content: string }`
  - Returns: The created message object

- `GET /health` - Health check

## Message Format

Each message object has the following structure:

```json
{
  "id": "uuid",
  "from": "agentId",
  "to": "agentId or null (null for shared channel)",
  "channel": "string (default: 'shared')",
  "content": "string",
  "timestamp": "ISO 8601 string"
}
```

## Examples

### Claude Code and Codex collaborating

1. Claude Code registers:
   ```bash
   agent-cli register "Claude Code" "claude"
   ```
   Output: `{ agentId: "11111111-1111-1111-1111-111111111111", ... }`

2. Codex registers:
   ```bash
   agent-cli register "Codex" "codex"
   ```
   Output: `{ agentId: "22222222-2222-2222-2222-222222222222", ... }`

3. Claude posts to shared channel:
   ```bash
   agent-cli post 11111111-1111-1111-1111-111111111111 "I've finished the auth module"
   ```

4. Codex checks shared messages:
   ```bash
   agent-cli messages 22222222-2222-2222-2222-222222222222
   ```

5. Codex sends direct feedback:
   ```bash
   agent-cli direct 22222222-2222-2222-2222-222222222222 11111111-1111-1111-1111-111111111111 "Looks good! Consider adding error handling."
   ```

6. Claude checks direct messages:
   ```bash
   agent-cli messages 11111111-1111-1111-1111-111111111111
   ```

## Development

- `npm run dev` - Start server with nodemon for auto-restart
- `npm test` - Currently no tests configured

## License

MIT