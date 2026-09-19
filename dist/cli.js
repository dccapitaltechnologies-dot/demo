#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const axios_1 = __importDefault(require("axios"));
const program = new commander_1.Command();
const API_BASE_URL = 'http://localhost:3000';
program
    .name('agent-cli')
    .description('CLI for inter-agent messaging API')
    .version('1.0.0');
// Register command
program
    .command('register')
    .description('Register a new agent')
    .requiredOption('-n, --name <string>', 'Agent name')
    .requiredOption('-k, --kind <string>', 'Agent kind (e.g., claude, codex, opencode)')
    .action(async (options) => {
    try {
        const response = await axios_1.default.post(`${API_BASE_URL}/agents/register`, {
            name: options.name,
            kind: options.kind
        });
        console.log('Agent registered successfully:');
        console.log(`  ID: ${response.data.agentId}`);
        console.log(`  Name: ${options.name}`);
        console.log(`  Kind: ${options.kind}`);
    }
    catch (error) {
        console.error('Failed to register agent:', error.response?.data?.error || error.message);
        process.exit(1);
    }
});
// Send message command
program
    .command('send')
    .description('Send a message (channel or direct)')
    .requiredOption('-f, --from <string>', 'From agent ID')
    .option('-t, --to <string>', 'To agent ID (omit for channel message)')
    .requiredOption('-c, --content <string>', 'Message content')
    .action(async (options) => {
    try {
        const response = await axios_1.default.post(`${API_BASE_URL}/messages`, {
            fromAgentId: options.from,
            toAgentId: options.to || undefined,
            content: options.content
        });
        console.log('Message sent successfully:');
        console.log(`  Message ID: ${response.data.messageId}`);
    }
    catch (error) {
        console.error('Failed to send message:', error.response?.data?.error || error.message);
        process.exit(1);
    }
});
// Read messages command
program
    .command('read')
    .description('Read messages for an agent')
    .requiredOption('-a, --agent <string>', 'Agent ID')
    .action(async (options) => {
    try {
        const response = await axios_1.default.get(`${API_BASE_URL}/messages/${options.agent}`);
        const messages = response.data;
        if (messages.length === 0) {
            console.log('No messages found for this agent.');
            return;
        }
        console.log(`Messages for agent ${options.agent}:`);
        messages.forEach((msg, index) => {
            const from = msg.fromAgentId;
            const to = msg.toAgentId === null ? 'channel' : msg.toAgentId;
            const timestamp = new Date(msg.timestamp).toLocaleString();
            console.log(`  ${index + 1}. [${timestamp}] From: ${from} → To: ${to}`);
            console.log(`      ${msg.content}`);
            console.log('');
        });
    }
    catch (error) {
        console.error('Failed to read messages:', error.response?.data?.error || error.message);
        process.exit(1);
    }
});
// List agents command
program
    .command('list')
    .description('List all registered agents')
    .action(async () => {
    try {
        const response = await axios_1.default.get(`${API_BASE_URL}/agents`);
        const agents = response.data;
        if (agents.length === 0) {
            console.log('No agents registered.');
            return;
        }
        console.log('Registered agents:');
        agents.forEach((agent, index) => {
            console.log(`  ${index + 1}. ID: ${agent.id}`);
            console.log(`     Name: ${agent.name}`);
            console.log(`     Kind: ${agent.kind}`);
            console.log(`     Registered: ${new Date(agent.registeredAt).toLocaleString()}`);
            console.log('');
        });
    }
    catch (error) {
        console.error('Failed to list agents:', error.response?.data?.error || error.message);
        process.exit(1);
    }
});
// Health check command
program
    .command('health')
    .description('Check server health')
    .action(async () => {
    try {
        const response = await axios_1.default.get(`${API_BASE_URL}/health`);
        console.log('Server health:');
        console.log(`  Status: ${response.data.status}`);
        console.log(`  Timestamp: ${new Date(response.data.timestamp).toLocaleString()}`);
        console.log(`  Agents: ${response.data.agents}`);
        console.log(`  Messages: ${response.data.messages}`);
    }
    catch (error) {
        console.error('Failed to check health:', error.response?.data?.error || error.message);
        process.exit(1);
    }
});
program.parse();
