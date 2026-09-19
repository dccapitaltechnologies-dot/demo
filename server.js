const express = require('express');
const app = express();
const port = 3000;

// In-memory storage
const agents = new Map(); // name -> { name, kind, registeredAt }
const messages = []; // each message: { id, from, to (null for shared), content, timestamp }
let messageIdCounter = 1;

app.use(express.json());

// Register an agent
app.post('/register', (req, res) => {
  const { name, kind } = req.body;
  if (!name || !kind) {
    return res.status(400).json({ error: 'Name and kind are required' });
  }
  if (agents.has(name)) {
    return res.status(409).json({ error: 'Agent already registered' });
  }
  const agent = { name, kind, registeredAt: new Date() };
  agents.set(name, agent);
  res.json({ success: true, agent });
});

// Post a message (to shared channel or direct)
app.post('/messages', (req, res) => {
  const { from, to, content } = req.body;
  if (!from || !content) {
    return res.status(400).json({ error: 'From and content are required' });
  }
  if (!agents.has(from)) {
    return res.status(400).json({ error: 'Sender agent not registered' });
  }
  if (to && !agents.has(to)) {
    return res.status(400).json({ error: 'Recipient agent not registered' });
  }
  const message = {
    id: messageIdCounter++,
    from,
    to: to || null, // null indicates shared channel
    content,
    timestamp: new Date()
  };
  messages.push(message);
  res.json({ success: true, message });
});

// Get messages for an agent (since timestamp or lastId)
app.get('/messages/:agentName', (req, res) => {
  const { agentName } = req.params;
  const { since, lastId } = req.query;

  if (!agents.has(agentName)) {
    return res.status(400).json({ error: 'Agent not registered' });
  }

  let filtered = messages.filter(msg => {
    // Agent receives: messages sent to them directly OR shared messages (to: null)
    const isDirect = msg.to === agentName;
    const isShared = msg.to === null;
    return isDirect || isShared;
  });

  if (since) {
    const sinceDate = new Date(since);
    filtered = filtered.filter(msg => new Date(msg.timestamp) > sinceDate);
  } else if (lastId) {
    const lastIdNum = parseInt(lastId, 10);
    if (!isNaN(lastIdNum)) {
      filtered = filtered.filter(msg => msg.id > lastIdNum);
    }
  }

  // Sort by timestamp ascending
  filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  res.json(filtered);
});

// List registered agents
app.get('/agents', (req, res) => {
  const agentList = Array.from(agents.values());
  res.json(agentList);
});

app.listen(port, () => {
  console.log(`Inter-agent messaging server listening at http://localhost:${port}`);
});

module.exports = app;