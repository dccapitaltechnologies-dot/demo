#!/bin/sh
# Test script for the inter-agent messaging API

# Start the server in the background
npm start > server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID $SERVER_PID"

# Wait for server to start
sleep 3

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "Server failed to start"
  cat server.log
  exit 1
fi

# Register agent 1
echo "Registering Agent 1..."
AGENT1_OUTPUT=$(npx ts-node src/cli.ts register -n "Agent1" -k "test" 2>&1)
echo "$AGENT1_OUTPUT"
AGENT1_ID=$(echo "$AGENT1_OUTPUT" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
if [ -z "$AGENT1_ID" ]; then
  echo "Failed to extract Agent 1 ID"
  exit 1
fi
echo "Agent 1 ID: $AGENT1_ID"

# Register agent 2
echo "Registering Agent 2..."
AGENT2_OUTPUT=$(npx ts-node src/cli.ts register -n "Agent2" -k "test" 2>&1)
echo "$AGENT2_OUTPUT"
AGENT2_ID=$(echo "$AGENT2_OUTPUT" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
if [ -z "$AGENT2_ID" ]; then
  echo "Failed to extract Agent 2 ID"
  exit 1
fi
echo "Agent 2 ID: $AGENT2_ID"

# Send a message from agent 1 to agent 2
echo "Sending message from Agent 1 to Agent 2..."
npx ts-node src/cli.ts send -f "$AGENT1_ID" -t "$AGENT2_ID" -c "Hello from Agent 1" 2>&1

# Read messages for agent 2
echo "Reading messages for Agent 2..."
npx ts-node src/cli.ts read -a "$AGENT2_ID" 2>&1

# Stop the server
echo "Stopping server..."
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null

echo 'Manual test completed'