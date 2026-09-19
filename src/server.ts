import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

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
  toAgentId: string | null; // null for channel messages
  content: string;
  timestamp: number;
}

const agents: Map<string, Agent> = new Map();
const messages: Message[] = [];

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Agent registration endpoint
app.post('/agents/register', (req: Request, res: Response) => {
  const { name, kind } = req.body;
  
  if (!name || !kind) {
    return res.status(400).json({ error: 'Name and kind are required' });
  }
  
  const agentId = uuidv4();
  const agent: Agent = {
    id: agentId,
    name,
    kind,
    registeredAt: Date.now()
  };
  
  agents.set(agentId, agent);
  
  res.json({ 
    agentId,
    message: `Agent ${name} (${kind}) registered successfully` 
  });
});

// Get all registered agents
app.get('/agents', (req: Request, res: Response) => {
  res.json(Array.from(agents.values()));
});

// Post a message (to channel or direct)
app.post('/messages', (req: Request, res: Response) => {
  const { fromAgentId, toAgentId, content } = req.body;
  
  if (!fromAgentId || !content) {
    return res.status(400).json({ error: 'fromAgentId and content are required' });
  }
  
  if (!agents.has(fromAgentId)) {
    return res.status(404).json({ error: 'From agent not found' });
  }
  
  // If toAgentId is provided, validate it exists
  if (toAgentId && !agents.has(toAgentId)) {
    return res.status(404).json({ error: 'To agent not found' });
  }
  
  const message: Message = {
    id: uuidv4(),
    fromAgentId,
    toAgentId: toAgentId ?? null,
    content,
    timestamp: Date.now()
  };
  
  messages.push(message);
  
  res.json({ 
    messageId: message.id,
    message: 'Message sent successfully' 
  });
});

// Get messages for an agent (channel messages + direct messages to/from agent)
app.get('/messages/:agentId', (req: Request, res: Response) => {
  const agentIdParam = req.params.agentId;
    const agentId = Array.isArray(agentIdParam) ? agentIdParam[0] : agentIdParam;
  
  if (!agents.has(agentId)) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  // Filter messages: channel messages (toAgentId === null) OR direct messages involving this agent
  const agentMessages = messages.filter(msg => 
    msg.toAgentId === null || 
    msg.fromAgentId === agentId || 
    msg.toAgentId === agentId
  );
  
  // Sort by timestamp (newest first)
  const sortedMessages = [...agentMessages].sort((a, b) => b.timestamp - a.timestamp);
  
  res.json(sortedMessages);
});

// Get all messages (for debugging/monitoring)
app.get('/messages', (req: Request, res: Response) => {
  const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp);
  res.json(sortedMessages);
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: Date.now(),
    agents: agents.size,
    messages: messages.length 
  });
});

app.listen(PORT, () => {
  console.log(`Inter-agent messaging server running on port ${PORT}`);
});

export default app;