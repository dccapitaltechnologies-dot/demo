import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// In-memory storage
interface Agent {
  id: string;
  name: string;
  kind: string;
  registeredAt: number;
}

interface Message {
  id: string;
  fromAgentId: string;
  toAgentId: string | null; // null for shared channel
  content: string;
  timestamp: number;
}

const agents: Map<string, Agent> = new Map();
const messages: Message[] = [];

// Helper to find agent by id
function getAgent(id: string): Agent | undefined {
  return agents.get(id);
}

// Endpoints

// Register an agent
app.post('/register', (req: Request, res: Response) => {
  const { name, kind } = req.body;
  if (!name || !kind) {
    return res.status(400).json({ error: 'name and kind are required' });
  }
  const id = uuidv4();
  const agent: Agent = { id, name, kind, registeredAt: Date.now() };
  agents.set(id, agent);
  res.json({ agentId: id });
});

// Post a message
app.post('/message', (req: Request, res: Response) => {
  const { fromAgentId, toAgentId, content } = req.body;
  if (!fromAgentId || !content) {
    return res.status(400).json({ error: 'fromAgentId and content are required' });
  }
  const fromAgent = getAgent(fromAgentId);
  if (!fromAgent) {
    return res.status(404).json({ error: 'fromAgentId not found' });
  }
  // If toAgentId is provided, check it exists (unless null for shared)
  if (toAgentId !== null && toAgentId !== undefined) {
    const toAgent = getAgent(toAgentId);
    if (!toAgent) {
      return res.status(404).json({ error: 'toAgentId not found' });
    }
  }
  const message: Message = {
    id: uuidv4(),
    fromAgentId,
    toAgentId: toAgentId ?? null,
    content,
    timestamp: Date.now()
  };
  messages.push(message);
  res.status(201).json({ messageId: message.id });
});

// Get messages for an agent (since optional timestamp)
app.get('/messages/:agentId', (req: Request, res: Response) => {
  const { agentId } = req.params;
  const { since } = req.query;
  const agent = getAgent(agentId);
  if (!agent) {
    return res.status(404).json({ error: 'agentId not found' });
  }
  const sinceNum = since ? parseInt(since as string, 10) : 0;
  const agentMessages = messages.filter(m => 
    (m.toAgentId === null || m.toAgentId === agentId) && // shared or direct to this agent
    m.timestamp > sinceNum
  );
  res.json(agentMessages);
});

// Delete messages for an agent (after retrieving)
app.delete('/messages/:agentId', (req: Request, res: Response) => {
  const { agentId } = req.params;
  const agent = getAgent(agentId);
  if (!agent) {
    return res.status(404).json({ error: 'agentId not found' });
  }
  // Remove messages that are for this agent (shared or direct)
  const initialLength = messages.length;
  messages.filter(m => !(m.toAgentId === null || m.toAgentId === agentId));
  // Actually, we want to remove the ones we just returned? Let's do a simpler approach: 
  // We'll remove all messages that are for this agent (since the client has retrieved them).
  // But note: shared messages are for everyone, so we cannot delete them after one agent reads.
  // So we change: we only delete direct messages. Shared messages remain.
  // Let's adjust: we keep shared messages forever (or until a cleanup). For direct, we delete after read.
  // We'll change the GET to not delete, and the DELETE endpoint to delete only direct messages for this agent.
  // However, the requirement is to support listing/polling messages. We can leave deletion to the client.
  // For simplicity, we'll not auto-delete. The client can delete if they want.
  // We'll just return a success without actually deleting.
  // Let's implement a real deletion for direct messages only.
  const toRemove = messages.filter(m => m.toAgentId === agentId);
  messages.forEach(m => {
    if (toRemove.includes(m)) {
      const idx = messages.indexOf(m);
      if (idx > -1) messages.splice(idx, 1);
    }
  });
  res.json({ deleted: toRemove.length });
});

app.listen(PORT, () => {
  console.log(`Inter-agent messaging server running on port ${PORT}`);
});