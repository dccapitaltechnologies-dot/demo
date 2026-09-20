#!/usr/bin/env node
import fetch from "node-fetch";

interface Agent {
  name: string;
  kind: string;
}

interface Message {
  id: string;
  from: string;
  to?: string;
  content: string;
  timestamp: number;
}

const BASE_URL = "http://localhost:3000";

async function register(name: string, kind: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/agents/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, kind }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error: ${(data as {error?: string}).error || res.statusText}`);
    process.exit(1);
  }
  const agent: Agent = data as Agent;
  console.log(`Registered agent ${agent.name} (${agent.kind})`);
}

async function listAgents(): Promise<void> {
  const res = await fetch(`${BASE_URL}/agents/list`);
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error: ${(data as {error?: string}).error || res.statusText}`);
    process.exit(1);
  }
  const agents: Agent[] = data as Agent[];
  console.log("Registered agents:");
  agents.forEach((agent) => {
    console.log(`  ${agent.name} (${agent.kind})`);
  });
}

async function postMessage(from: string, content: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/messages/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, content }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error: ${(data as {error?: string}).error || res.statusText}`);
    process.exit(1);
  }
  const message: Message = data as Message;
  console.log("Message posted to channel:", message.id);
}

async function directMessage(from: string, to: string, content: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/messages/direct`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, content }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error: ${(data as {error?: string}).error || res.statusText}`);
    process.exit(1);
  }
  const message: Message = data as Message;
  console.log(`Direct message sent from ${from} to ${to}:`, message.id);
}

async function listMessages(agent?: string): Promise<void> {
  const url = agent ? `${BASE_URL}/messages?agent=${agent}` : `${BASE_URL}/messages`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error: ${(data as {error?: string}).error || res.statusText}`);
    process.exit(1);
  }
  const messages: Message[] = data as Message[];
  if (agent) {
    console.log(`Messages for ${agent}:`);
  } else {
    console.log("All messages:");
  }
  messages.forEach((msg) => {
    const to = msg.to ? `-> ${msg.to}` : "-> channel";
    const time = new Date(msg.timestamp).toLocaleTimeString();
    console.log(`[${time}] ${msg.from} ${to}: ${msg.content}`);
  });
}

function printHelp(): void {
  console.log(`
Usage:
  cli register <name> <kind>          Register a new agent
  agents                          List registered agents
  post <name> <message>           Post a message to the shared channel
  direct <from> <to> <message>    Send a direct message from one agent to another
  list [agent]                    List messages (for agent if specified, otherwise all)
  help                            Show this help
`);
}

// Main
const command = process.argv[2];
switch (command) {
  case "register":
    if (process.argv.length < 5) {
      console.error("Usage: cli register <name> <kind>");
      process.exit(1);
    }
    register(process.argv[3], process.argv[4]);
    break;
  case "agents":
    listAgents();
    break;
  case "post":
    if (process.argv.length < 5) {
      console.error("Usage: cli post <name> <message>");
      process.exit(1);
    }
    postMessage(process.argv[3], process.argv[4]);
    break;
  case "direct":
    if (process.argv.length < 6) {
      console.error("Usage: cli direct <from> <to> <message>");
      process.exit(1);
    }
    directMessage(process.argv[3], process.argv[4], process.argv[5]);
    break;
  case "list":
    const agent = process.argv[3];
    listMessages(agent);
    break;
  case "help":
  default:
    printHelp();
    process.exit(0);
}