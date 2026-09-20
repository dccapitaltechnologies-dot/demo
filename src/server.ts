import express from "express";
import { json } from "body-parser";

interface Agent {
  name: string;
  kind: string;
}

interface Message {
  id: string;
  from: string;
  to?: string; // undefined for channel messages
  content: string;
  timestamp: number;
}

const app = express();
app.use(json());

const agents: Record<string, Agent> = {};
const messages: Message[] = [];

// Helper to generate uuid
function uuid() {
  // simple random id
  return Math.random().toString(36).substring(2, 15);
}

app.post("/agents/register", (req, res) => {
  const { name, kind } = req.body;
  if (!name || !kind) {
    return res.status(400).json({ error: "name and kind required" });
  }
  if (agents[name]) {
    return res.status(409).json({ error: "agent already registered" });
  }
  const agent: Agent = { name, kind };
  agents[name] = agent;
  res.status(201).json(agent);
});

app.get("/agents/list", (_req, res) => {
  res.json(Object.values(agents));
});

app.post("/messages/post", (req, res) => {
  const { from, content } = req.body;
  if (!from || !content) {
    return res.status(400).json({ error: "from and content required" });
  }
  if (!agents[from]) {
    return res.status(400).json({ error: "unknown sender" });
  }
  const msg: Message = {
    id: uuid(),
    from,
    content,
    timestamp: Date.now(),
  };
  messages.push(msg);
  res.status(201).json(msg);
});

app.post("/messages/direct", (req, res) => {
  const { from, to, content } = req.body;
  if (!from || !to || !content) {
    return res
      .status(400)
      .json({ error: "from, to, and content required" });
  }
  if (!agents[from] || !agents[to]) {
    return res.status(400).json({ error: "unknown sender or recipient" });
  }
  const msg: Message = {
    id: uuid(),
    from,
    to,
    content,
    timestamp: Date.now(),
  };
  messages.push(msg);
  res.status(201).json(msg);
});

app.get("/messages", (req, res) => {
  const { agent } = req.query as { agent?: string };
  const filtered = agent
    ? messages.filter((m) => m.to === agent || m.to === undefined && m.from === agent)
    : messages;
  res.json(filtered);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Local inter-agent messaging server running on port ${PORT}`);
});
