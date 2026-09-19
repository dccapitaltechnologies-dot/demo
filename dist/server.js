"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const agents = new Map();
const messages = [];
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
// Agent registration endpoint
app.post('/agents/register', (req, res) => {
    const { name, kind } = req.body;
    if (!name || !kind) {
        return res.status(400).json({ error: 'Name and kind are required' });
    }
    const agentId = (0, uuid_1.v4)();
    const agent = {
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
app.get('/agents', (req, res) => {
    res.json(Array.from(agents.values()));
});
// Post a message (to channel or direct)
app.post('/messages', (req, res) => {
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
    const message = {
        id: (0, uuid_1.v4)(),
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
app.get('/messages/:agentId', (req, res) => {
    const agentIdParam = req.params.agentId;
    const agentId = Array.isArray(agentIdParam) ? agentIdParam[0] : agentIdParam;
    if (!agents.has(agentId)) {
        return res.status(404).json({ error: 'Agent not found' });
    }
    // Filter messages: channel messages (toAgentId === null) OR direct messages involving this agent
    const agentMessages = messages.filter(msg => msg.toAgentId === null ||
        msg.fromAgentId === agentId ||
        msg.toAgentId === agentId);
    // Sort by timestamp (newest first)
    const sortedMessages = [...agentMessages].sort((a, b) => b.timestamp - a.timestamp);
    res.json(sortedMessages);
});
// Get all messages (for debugging/monitoring)
app.get('/messages', (req, res) => {
    const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp);
    res.json(sortedMessages);
});
// Health check endpoint
app.get('/health', (req, res) => {
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
exports.default = app;
