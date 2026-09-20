const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory storage
const agents = new Map(); // agentId => { id, name, kind, registeredAt }
const messages = []; // array of { id, fromAgentId, toAgentId (null for channel), content, timestamp }

// Helper to find agent by name (optional)
function findAgentByName(name) {
  for (const [id, agent] of agents.entries()) {
    if (agent.name === name) return agent;
  }
  return null;
}

// Register an agent
app.post('/register', (req, res) => {
  const { name, kind } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  // Check if name already exists
  if (findAgentByName(name)) {
    return res.status(409).json({ error: 'Agent name already taken' });
  }
  const id = uuidv4();
  const agent = { id, name, kind: kind || 'unknown', registeredAt: Date.now() };
  agents.set(id, agent);
  res.json({ agentId: id, agent });
});

// Post a message to the shared channel
app.post('/channel/:agentId/message', (req, res) => {
  const { agentId } = req.params;
  const { content } = req.body;
  if (!agents.has(agentId)) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Message content is required' });
  }
  const message = {
    id: uuidv4(),
    fromAgentId: agentId,
    toAgentId: null, // null indicates channel message
    content,
    timestamp: Date.now()
  };
  messages.push(message);
  res.status(201).json(message);
});

// Send a direct message
app.post('/dm/:fromAgentId/to/:toAgentId', (req, res) => {
  const { fromAgentId, toAgentId } = req.params;
  const { content } = req.body;
  if (!agents.has(fromAgentId)) {
    return res.status(404).json({ error: 'From agent not found' });
  }
  if (!agents.has(toAgentId)) {
    return res.status(404).json({ error: 'To agent not found' });
  }
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Message content is required' });
  }
  const message = {
    id: uuidv4(),
    fromAgentId,
    toAgentId,
    content,
    timestamp: Date.now()
  };
  messages.push(message);
  res.status(201).json(message);
});

// Get messages for an agent (since a timestamp)
app.get('/messages/:agentId', (req, res) => {
  const { agentId } = req.params;
  const { since } = req.query;
  if (!agents.has(agentId)) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  const sinceTs = since ? parseInt(since, 10) : 0;
  const agentMessages = messages.filter(msg => 
    msg.timestamp > sinceTs && 
    (msg.toAgentId === null || msg.toAgentId === agentId || msg.fromAgentId === agentId)
  );
  res.json({ messages: agentMessages, timestamp: Date.now() });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Inter-agent messaging server running on port ${PORT}`);
});

module.exports = app;