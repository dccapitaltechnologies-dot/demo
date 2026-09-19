import { Command } from 'commander';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const program = new Command();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

program
  .name('agent-cli')
  .description('CLI for inter-agent messaging')
  .version('1.0.0');

// Register command
program
  .command('register')
  .description('Register a new agent')
  .requiredOption('-n, --name <string>', 'Agent name')
  .requiredOption('-k, --kind <string>', 'Agent kind (e.g., claude, codex, opencode, piagent, devin, groq, muse)')
  .action(async ({ name, kind }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, { name, kind });
      console.log(`Agent registered successfully. Agent ID: ${response.data.agentId}`);
    } catch (error: any) {
      console.error('Error registering agent:', error.response?.data || error.message);
      process.exit(1);
    }
  });

// Send message command
program
  .command('send')
  .description('Send a message to shared channel or direct to another agent')
  .requiredOption('-f, --from <string>', 'From agent ID')
  .option('-t, --to <string>', 'To agent ID (omit for shared channel)')
  .requiredOption('-c, --content <string>', 'Message content')
  .action(async ({ from, to, content }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/message`, {
        fromAgentId: from,
        toAgentId: to ?? null, // null for shared
        content
      });
      console.log(`Message sent successfully. Message ID: ${response.data.messageId}`);
    } catch (error: any) {
      console.error('Error sending message:', error.response?.data || error.message);
      process.exit(1);
    }
  });

// List messages command
program
  .command('list')
  .description('List messages for an agent (shared and direct)')
  .requiredOption('-a, --agentId <string>', 'Agent ID')
  .option('-s, --since <number>', 'Only messages after this timestamp', parseInt)
  .action(async ({ agentId, since }) => {
    try {
      const params: Record<string, any> = {};
      if (since !== undefined) {
        params.since = since;
      }
      const response = await axios.get(`${API_BASE_URL}/messages/${agentId}`, { params });
      console.log('Messages:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error('Error listing messages:', error.response?.data || error.message);
      process.exit(1);
    }
  });

// Delete messages command (for direct messages only, as per our server implementation)
program
  .command('delete')
  .description('Delete direct messages for an agent (shared messages are not deleted)')
  .requiredOption('-a, --agentId <string>', 'Agent ID')
  .action(async ({ agentId }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/messages/${agentId}`);
      console.log(`Deleted ${response.data.deleted} direct message(s) for agent ${agentId}`);
    } catch (error: any) {
      console.error('Error deleting messages:', error.response?.data || error.message);
      process.exit(1);
    }
  });

program.parse();