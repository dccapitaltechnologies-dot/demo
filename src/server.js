import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for agents and messages
const agents = new Map(); // agentId -> { name, kind, registeredAt }
const messages = []; // list of { id, from, to, channel, content, timestamp }

// Middleware
app.use(express.json());

// Helper function to generate a timestamp
const timestamp = () => new Date().toISOString();

// Register an agent
app.post('/register', (req, res) => {
  const { name, kind } = req.body;
  if (!name || !kind) {
    return res.status(400).json({ error: 'Name and kind are required' });
  }
  const agentId = uuidv4();
  agents.set(agentId, { name, kind, registeredAt: timestamp() });
  res.json({ agentId, name, kind, registeredAt: timestamp() });
});

// Post a message to a shared channel (or direct if 'to' is specified)
app.post('/messages', (req, res) => {
  const { from, to, channel, content } = req.body;
  if (!from || !content) {
    return res.status(400).json({ error: 'From and content are required' });
  }
  // Validate that the 'from' agent exists
  if (!agents.has(from)) {
    return res.status(404).json({ error: 'Sender agent not found' });
  }
  // If 'to' is specified, validate that the recipient agent exists
  if (to && !agents.has(to)) {
    return res.status(404).json({ error: 'Recipient agent not found' });
  }
  const message = {
    id: uuidv4(),
    from,
    to: to || null, // null means shared channel
    channel: channel || 'shared', // default channel
    content,
    timestamp: timestamp()
  };
  messages.push(message);
  res.status(201).json(message);
});

// Get messages for an agent (either direct messages or shared channel)
app.get('/messages/:agentId', (req, res) => {
  const { agentId } = req.params;
  if (!agents.has(agentId)) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  // Filter messages: either to this agent (direct) or to shared channel (to is null) and channel matches?
  // For simplicity, we'll return:
  //   - Direct messages where to === agentId
  //   - Shared channel messages (to is null) regardless of channel? We'll just return all shared.
  const agentMessages = messages.filter(msg => 
    msg.to === agentId || (msg.to === null && msg.channel === 'shared')
  );
  res.json(agentMessages);
});

// Direct message endpoint (alternative to using /messages with 'to')
app.post('/messages/direct', (req, res) => {
  const { from, to, content } = req.body;
  if (!from || !to || !content) {
    return res.status(400).json({ error: 'From, to, and content are required' });
  }
  if (!agents.has(from)) {
    return res.status(404).json({ error: 'Sender agent not found' });
  }
  if (!agents.has(to)) {
    return res.status(404).json({ error: 'Recipient agent not found' });
  }
  const message = {
    id: uuidv4(),
    from,
    to,
    channel: 'direct', // we can mark direct messages with a channel
    content,
    timestamp: timestamp()
  };
  messages.push(message);
  res.status(201).json(message);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: timestamp() });
});

app.listen(PORT, () => {
  console.log(`Agent messaging server running on port ${PORT}`);
});