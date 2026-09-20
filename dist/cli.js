#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const BASE_URL = "http://localhost:3000";
async function register(name, kind) {
    const res = await (0, node_fetch_1.default)(`${BASE_URL}/agents/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, kind }),
    });
    const data = await res.json();
    if (!res.ok) {
        console.error(`Error: ${data.error || res.statusText}`);
        process.exit(1);
    }
    const agent = data;
    console.log(`Registered agent ${agent.name} (${agent.kind})`);
}
async function listAgents() {
    const res = await (0, node_fetch_1.default)(`${BASE_URL}/agents/list`);
    const data = await res.json();
    if (!res.ok) {
        console.error(`Error: ${data.error || res.statusText}`);
        process.exit(1);
    }
    const agents = data;
    console.log("Registered agents:");
    agents.forEach((agent) => {
        console.log(`  ${agent.name} (${agent.kind})`);
    });
}
async function postMessage(from, content) {
    const res = await (0, node_fetch_1.default)(`${BASE_URL}/messages/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, content }),
    });
    const data = await res.json();
    if (!res.ok) {
        console.error(`Error: ${data.error || res.statusText}`);
        process.exit(1);
    }
    const message = data;
    console.log("Message posted to channel:", message.id);
}
async function directMessage(from, to, content) {
    const res = await (0, node_fetch_1.default)(`${BASE_URL}/messages/direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, content }),
    });
    const data = await res.json();
    if (!res.ok) {
        console.error(`Error: ${data.error || res.statusText}`);
        process.exit(1);
    }
    const message = data;
    console.log(`Direct message sent from ${from} to ${to}:`, message.id);
}
async function listMessages(agent) {
    const url = agent ? `${BASE_URL}/messages?agent=${agent}` : `${BASE_URL}/messages`;
    const res = await (0, node_fetch_1.default)(url);
    const data = await res.json();
    if (!res.ok) {
        console.error(`Error: ${data.error || res.statusText}`);
        process.exit(1);
    }
    const messages = data;
    if (agent) {
        console.log(`Messages for ${agent}:`);
    }
    else {
        console.log("All messages:");
    }
    messages.forEach((msg) => {
        const to = msg.to ? `-> ${msg.to}` : "-> channel";
        const time = new Date(msg.timestamp).toLocaleTimeString();
        console.log(`[${time}] ${msg.from} ${to}: ${msg.content}`);
    });
}
function printHelp() {
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
