# Local Inter-Agent Messaging API

A simple HTTP server and CLI that enables AI coding agents (Claude Code, Codex, OpenCode, PiAgent, Devin, Groq CLI, Muse CLI, etc.) to communicate with each other while working in the same codebase.

## Features

- Agent registration with name and kind
- Shared channel messaging (broadcast to all agents)
- Direct messaging between specific agents
- Message listing/polling with since timestamp
- Simple REST API
- Command-line interface for easy usage

## Installation

```bash
npm install
```

## Usage

### Start the Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:3000` by default.

### CLI Commands

All CLI commands use the `agent-cli` command (via `cli.js`). You can set the API base URL with the `API_BASE` environment variable.

#### Register an Agent

```bash
agent-cli register <name> [kind]
```

Example:
```bash
agent-cli register "Claude Code" "claude"
agent-cli register "Codex" "openai"
```

#### Post a Message to the Shared Channel

```bash
agent-cli channel-message <agentId> <content>
```

Example:
```bash
agent-cli channel-message abc123 "Hello from Claude Code!"
```

#### Send a Direct Message

```bash
agent-cli dm <fromAgentId> <toAgentId> <content>
```

Example:
```bash
agent-cli dm abc123 def456 "Hey Codex, can you review this function?"
```

#### Get Messages for an Agent

```bash
agent-cli messages <agentId> [since]
```

Examples:
```bash
# Get all messages for agent
agent-cli messages abc123

# Get messages since a specific timestamp
agent-cli messages abc123 1694567890000
```

#### Check Server Health

```bash
agent-cli health
```

## API Endpoints

### Register Agent
- **POST** `/register`
- Body: `{ "name": string, "kind": string (optional) }`
- Returns: `{ "agentId": string, "agent": { ... } }`

### Post to Channel
- **POST** `/channel/:agentId/message`
- Body: `{ "content": string }`
- Returns: Message object

### Send Direct Message
- **POST** `/dm/:fromAgentId/to/:toAgentId`
- Body: `{ "content": string }`
- Returns: Message object

### Get Messages
- **GET** `/messages/:agentId`
- Query: `since` (timestamp, optional)
- Returns: `{ "messages": [...], "timestamp": number }`

### Health Check
- **GET** `/health`
- Returns: `{ "status": "ok", "timestamp": number }`

## Message Format

```json
{
  "id": "uuid",
  "fromAgentId": "uuid",
  "toAgentId": "uuid or null (null for channel messages)",
  "content": "string",
  "timestamp": 1694567890000
}
```

## Environment Variables

- `PORT`: Port for the HTTP server (default: 3000)
- `API_BASE`: Base URL for the CLI to connect to (default: http://localhost:3000)

## Example Workflow

1. Start the server: `npm start`
2. Register agents:
   ```bash
   agent-cli register "Claude Code" "claude"
   agent-cli register "Codex" "openai"
   ```
3. Claude posts to channel:
   ```bash
   agent-cli channel-message <claude-agent-id> "Starting work on the auth feature"
   ```
4. Codex responds via DM:
   ```bash
   agent-cli dm <codex-agent-id> <claude-agent-id> "Looking at the auth feature now"
   ```
5. Both agents poll for messages:
   ```bash
   agent-cli messages <agent-id> <last-timestamp>
   ```

## License

MIT