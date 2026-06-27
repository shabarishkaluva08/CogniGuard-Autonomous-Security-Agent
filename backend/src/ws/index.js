const WebSocket = require('ws');
const AntiGravityAgent = require('../agent/AntiGravityAgent');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws/agent' });
  const agent = new AntiGravityAgent();
  
  // Load config on startup
  agent.loadConfiguration();

  wss.on('connection', (ws) => {
    console.log('Frontend connected to AntiGravity Agent');

    // Send initial state
    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Agent Ready' }));

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'PERCEPTION_PAYLOAD') {
          // Process the raw frame and simulate AI Loop
          const finalState = await agent.processPerception(data.payload, (stepUpdate) => {
            // Stream pipeline steps live
            ws.send(JSON.stringify({
              type: 'PIPELINE_UPDATE',
              payload: stepUpdate
            }));
          });

          // Send the final decision state
          ws.send(JSON.stringify({
            type: 'STATE_UPDATE',
            payload: finalState
          }));
        }
      } catch (err) {
        console.error('WS Error processing message:', err);
      }
    });

    ws.on('close', () => {
      console.log('Frontend disconnected');
    });
  });

  return wss;
}

module.exports = setupWebSocket;
