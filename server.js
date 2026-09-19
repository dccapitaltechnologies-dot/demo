const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for agents and messages
const agents = new Map(); // agentId -> {id, name, kind, registeredAt}
const messages = []; // Array of message objects
let messageIdCounter = 1;

app.use(express.json());

// Register an agent
app.post('/register', (req, res) => {
  const { name, kind } = req.body;
  
  if (!name || !kind) {
    return res.status(400).json({ error: 'Name and kind are required' });
  }
  
  const agentId = `${name}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const agent = {
    id: agentId,
    name,
    kind,
    registeredAt: new Date()
  };
  
  agents.set(agentId, agent);
  
  res.json({
    success: true,
    agentId,
    agent
  });
});

// Post a message (to shared channel or direct)
app.post('/messages', (req, res) => {
  const { from, to, message } = req.body;
  
  if (!from || !message) {
    return res.status(400).json({ error: 'From and message are required' });
  }
  
  // Validate that 'from' agent exists
  const fromAgent = agents.get(from);
  if (!fromAgent) {
    return res.status(400).json({ error: 'Sender agent not registered' });
  }
  
  // For direct messages, validate that 'to' agent exists
  if (to && to !== 'shared' && !agents.get(to)) {
    return res.status(400).json({ error: 'Recipient agent not registered' });
  }
  
  const msg = {
    id: `msg-${messageIdCounter++}`,
    from,
    to: to || 'shared', // Default to shared channel
    message,
    timestamp: new Date()
  };
  
  messages.push(msg);
  
  res.json({
    success: true,
    messageId: msg.id
  });
});

// List messages (with optional filtering)
app.get('/messages', (req, res) => {
  const { agentId, since } = req.query;
  
  let filteredMessages = [...messages];
  
  // Filter by agent (either sender or recipient)
  if (agentId) {
    filteredMessages = filteredMessages.filter(msg => 
      msg.from === agentId || msg.to === agentId || msg.to === 'shared'
    );
  }
  
  // Filter by timestamp (messages after since)
  if (since) {
    const sinceDate = new Date(since);
    filteredMessages = filteredMessages.filter(msg => 
      new Date(msg.timestamp) > sinceDate
    );
  }
  
  res.json({
    success: true,
    messages: filteredMessages
  });
});

// Get registered agents
app.get('/agents', (req, res) => {
  res.json({
    success: true,
    agents: Array.from(agents.values())
  });
});

app.listen(PORT, () => {
  console.log(`Inter-agent messaging API server running on port ${PORT}`);
});

module.exports = app;