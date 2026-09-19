#!/usr/bin/env node
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';

const command = process.argv[2];
const args = process.argv.slice(3);

async function register(name, kind) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, kind })
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Error:', data.error || res.status);
    process.exit(1);
  }
  console.log('Registered agent:', data);
}

async function post(agentId, message, channel = 'shared') {
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: agentId, channel, content: message })
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Error:', data.error || res.status);
    process.exit(1);
  }
  console.log('Message posted:', data);
}

async function direct(fromAgentId, toAgentId, message) {
  const res = await fetch(`${API_BASE}/messages/direct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromAgentId, to: toAgentId, content: message })
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Error:', data.error || res.status);
    process.exit(1);
  }
  console.log('Direct message sent:', data);
}

async function messages(agentId) {
  const res = await fetch(`${API_BASE}/messages/${agentId}`);
  const data = await res.json();
  if (!res.ok) {
    console.error('Error:', data.error || res.status);
    process.exit(1);
  }
  console.log('Messages for agent', agentId + ':');
  console.log(JSON.stringify(data, null, 2));
}

async function help() {
  console.log(`
Usage:
  agent-cli register <name> <kind>          Register a new agent
  agent-cli post <agentId> <message> [--channel <channel>]  Post a message to a shared channel (default: shared)
  agent-cli direct <fromAgentId> <toAgentId> <message>      Send a direct message to another agent
  agent-cli messages <agentId>              List messages for an agent (shared + direct)
  agent-cli help                            Show this help message
`);
}

switch (command) {
  case 'register':
    if (args.length < 2) {
      console.error('Usage: agent-cli register <name> <kind>');
      process.exit(1);
    }
    register(args[0], args[1]);
    break;
  case 'post':
    if (args.length < 2) {
      console.error('Usage: agent-cli post <agentId> <message> [--channel <channel>]');
      process.exit(1);
    }
    let channel = 'shared';
    if (args.includes('--channel')) {
      const channelIndex = args.indexOf('--channel');
      if (channelIndex + 1 < args.length) {
        channel = args[channelIndex + 1];
        // Remove the --channel and its value from args for message reconstruction
        args.splice(channelIndex, 2);
      }
    }
    const agentId = args[0];
    const message = args.slice(1).join(' ');
    post(agentId, message, channel);
    break;
  case 'direct':
    if (args.length < 3) {
      console.error('Usage: agent-cli direct <fromAgentId> <toAgentId> <message>');
      process.exit(1);
    }
    direct(args[0], args[1], args.slice(2).join(' '));
    break;
  case 'messages':
    if (args.length < 1) {
      console.error('Usage: agent-cli messages <agentId>');
      process.exit(1);
    }
    messages(args[0]);
    break;
  case 'help':
  default:
    help();
}