const axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));
const BASE_URL = 'http://localhost:3000';

async function registerAgent(name, kind) {
  try {
    const response = await axios.post(`${BASE_URL}/register`, { name, kind });
    console.log('Agent registered successfully:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error registering agent:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function postMessage(from, to, message) {
  try {
    const response = await axios.post(`${BASE_URL}/messages`, { from, to, message });
    console.log('Message posted successfully:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error posting message:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function listMessages(agentId, since) {
  try {
    const params = {};
    if (agentId) params.agentId = agentId;
    if (since) params.since = since;
    const response = await axios.get(`${BASE_URL}/messages`, { params });
    console.log('Messages:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error listing messages:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function listAgents() {
  try {
    const response = await axios.get(`${BASE_URL}/agents`);
    console.log('Registered agents:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error listing agents:', error.response?.data || error.message);
    process.exit(1);
  }
}

const command = argv._[0];
switch (command) {
  case 'register':
    if (!argv.name || !argv.kind) {
      console.error('Usage: node cli.js register --name <name> --kind <kind>');
      process.exit(1);
    }
    registerAgent(argv.name, argv.kind);
    break;
  case 'post':
    if (!argv.from || !argv.message) {
      console.error('Usage: node cli.js post --from <agentId> --message <message> [--to <agentId|shared>]');
      process.exit(1);
    }
    postMessage(argv.from, argv.to || 'shared', argv.message);
    break;
  case 'list':
    listMessages(argv.agentId, argv.since);
    break;
  case 'agents':
    listAgents();
    break;
  default:
    console.error('Available commands: register, post, list, agents');
    console.error('Example:');
    console.error('  node cli.js register --name claude --kind claude-code');
    console.error('  node cli.js post --from claude-code-123 --message "hello world" --to shared');
    console.error('  node cli.js list --agentId claude-code-123');
    process.exit(1);
}