#!/usr/bin/env node
const axios = require('axios');
const { program } = require('commander');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

program
  .name('agent-cli')
  .description('CLI for local inter-agent messaging API')
  .version('1.0.0');

program
  .command('register <name> [kind]')
  .description('Register an agent with a name and optional kind')
  .action(async (name, kind) => {
    try {
      const res = await axios.post(`${API_BASE}/register`, { name, kind });
      console.log('Registered agent:', res.data);
    } catch (err) {
      console.error('Error registering agent:', err.response?.data || err.message);
      process.exit(1);
    }
  });

program
  .command('channel-message <agentId> <content>')
  .description('Post a message to the shared channel')
  .action(async (agentId, content) => {
    try {
      const res = await axios.post(`${API_BASE}/channel/${agentId}/message`, { content });
      console.log('Message posted:', res.data);
    } catch (err) {
      console.error('Error posting message:', err.response?.data || err.message);
      process.exit(1);
    }
  });

program
  .command('dm <fromAgentId> <toAgentId> <content>')
  .description('Send a direct message from one agent to another')
  .action(async (fromAgentId, toAgentId, content) => {
    try {
      const res = await axios.post(`${API_BASE}/dm/${fromAgentId}/to/${toAgentId}`, { content });
      console.log('Direct message sent:', res.data);
    } catch (err) {
      console.error('Error sending DM:', err.response?.data || err.message);
      process.exit(1);
    }
  });

program
  .command('messages <agentId> [since]')
  .description('Get messages for an agent (optional since timestamp)')
  .action(async (agentId, since) => {
    try {
      const params = since ? { since } : {};
      const res = await axios.get(`${API_BASE}/messages/${agentId}`, { params });
      console.log('Messages for agent', agentId + ':', res.data);
    } catch (err) {
      console.error('Error fetching messages:', err.response?.data || err.message);
      process.exit(1);
    }
  });

program
  .command('health')
  .description('Check the health of the server')
  .action(async () => {
    try {
      const res = await axios.get(`${API_BASE}/health`);
      console.log('Server health:', res.data);
    } catch (err) {
      console.error('Error checking health:', err.response?.data || err.message);
      process.exit(1);
    }
  });

program.parse();