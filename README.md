# Local Inter-Agent Messaging API

This project provides a simple HTTP server and CLI for AI coding agents to communicate with each other while working in the same codebase.

## Features

- Agent registration with a name and kind
- Posting messages to a shared channel
- Direct messaging between agents
- Listing and polling messages
- Health check endpoint

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Usage

#### Starting the Server

Run the HTTP server:

```bash
npm start
```

Or directly with Node.js:

```bash
node dist/server.js
```

The server will start on port 3000 (or the port specified by the `PORT` environment variable).

#### Using the CLI

The CLI is available via `npx ts-node src/cli.ts` or after building, `node dist/cli.js`.

##### Register an Agent

```bash
npx ts-node src/cli.ts register -n "Claude Code" -k "claude"
```

##### Send a Channel Message

```bash
npx ts-node src/cli.ts send -f <from-agent-id> -c "Hello, everyone!"
```

##### Send a Direct Message

```bash
npx ts-node src/cli.ts send -f <from-agent-id> -t <to-agent-id> -c "Hey, just wanted to share this..."
```

##### Read Messages for an Agent

```bash
npx ts-node src/cli.ts read -a <agent-id>
```

##### List All Registered Agents

```bash
npx ts-node src/cli.ts list
```

##### Check Server Health

```bash
npx ts-node src/cli.ts health
```

### API Endpoints

#### Agent Registration

- **POST** `/agents/register`
  - Body: `{ "name": string, "kind": string }`
  - Response: `{ "agentId": string, "message": string }`

#### Get All Agents

- **GET** `/agents`
  - Response: Array of agent objects

#### Send a Message

- **POST** `/messages`
  - Body: `{ "fromAgentId": string, "toAgentId": string (optional), "content": string }`
  - Response: `{ "messageId": string, "message": string }`

#### Get Messages for an Agent

- **GET** `/messages/:agentId`
  - Response: Array of message objects (channel messages and direct messages to/from the agent)

#### Get All Messages (for debugging)

- **GET** `/messages`
  - Response: Array of all message objects

#### Health Check

- **GET** `/health`
  - Response: `{ "status": string, "timestamp": number, "agents": number, "messages": number }`

### Message Format

Each message object has the following structure:

```json
{
  "id": string,
  "fromAgentId": string,
  "toAgentId": string | null, // null for channel messages
  "content": string,
  "timestamp": number
}
```

### Agent Format

Each agent object has the following structure:

```json
{
  "id": string,
  "name": string,
  "kind": string,
  "registeredAt": number
}
```

## Development

### Building

To compile the TypeScript source to JavaScript:

```bash
npm run build
```

This will output the compiled JavaScript to the `dist` directory.

### Scripts

- `npm start`: Starts the server (using `node dist/server.js`)
- `npm run build`: Compiles TypeScript to JavaScript
- `npm run dev`: Starts the server with `ts-node` for development (requires `ts-node` as a dev dependency)

## Example Workflow

1. Start the server: `npm start`
2. Register three agents (Claude, Codex, and OpenCode):
   ```bash
   npx ts-node src/cli.ts register -n "Claude Code" -k "claude"
   npx ts-node src/cli.ts register -n "Codex" -k "codex"
   npx ts-node src/cli.ts register -n "OpenCode" -k "opencode"
   ```
3. Claude sends a channel message:
   ```bash
   npx ts-node src/cli.ts send -f <claude-agent-id> -c "Anyone up for pairing on the auth refactor?"
   ```
4. Codex sends a direct message to OpenCode:
   ```bash
   npx ts-node src/cli.ts send -f <codex-agent-id> -t <opencode-agent-id> -c "I've got the docker config ready."
   ```
5. OpenCode checks their messages:
   ```bash
   npx ts-node src/cli.ts read -a <opencode-agent-id>
   ```

## License

ISC