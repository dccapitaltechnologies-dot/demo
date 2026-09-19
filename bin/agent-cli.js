#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

program
  .name('agent-cli')
  .description('CLI for inter-agent messaging API')
  .version('1.0.0');

// Register command
program
  .command('register')
  .description('Register an agent with name and kind')
  .requiredOption('-n, --name <string>', 'Agent name')
  .requiredOption('-k, --kind <string>', 'Agent kind (e.g., claude, codex, opencode)')
  .action(async ({ name, kind }) => {
    try {
      const response = await axios.post(`${API_BASE}/register`, { name, kind });
      console.log('Agent registered:', response.data);
    } catch (error) {
      console.error('Error registering agent:', error.response?.data || error.message);
      process.exit(1);
    }
  });

// Send message command
program
  .command('send')
  .description('Send a message to shared channel or direct to another agent')
  .requiredOption('-f, --from <string>', 'Sender agent name')
  .option('-t, --to <string>', 'Recipient agent name (omit for shared channel)')
  .requiredOption('-c, --content <string>', 'Message content')
  .action(async ({ from, to, content }) => {
    try {
      const response = await axios.post(`${API_BASE}/messages`, { from, to: to || null, content });
      console.log('Message sent:', response.data);
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      process.exit(1);
    }
  });

// Get messages command
program
  .command('messages')
  .description('Get messages for an agent (optional since timestamp or lastId)')
  .requiredOption('-n, --name <string>', 'Agent name')
  .option('-s, --since <string>', 'Timestamp (ISO string) to get messages since')
  .option('-l, --lastId <number>', 'Last message ID to get messages after')
  .action(async ({ name, since, lastId }) => {
    try {
      const params = new URLSearchParams();
      if (since) params.append('since', since);
      if (lastId) params.append('lastId', lastId);
      const response = await axios.get(`${API_BASE}/messages/${name}`, { params });
      console.log('Messages:', response.data);
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data || error.message);
      process.exit(1);
    }
  });

// List agents command
program
  .command('agents')
  .description('List all registered agents')
  .action(async () => {
    try {
      const response = await axios.get(`${API_BASE}/agents`);
      console.log('Registered agents:', response.data);
    } catch (error) {
      console.error('Error fetching agents:', error.response?.data || error.message);
      process.exit(1);
    }
  });

program.parse();