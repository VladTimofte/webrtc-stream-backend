const WebSocket = require('ws');
const port = process.env.PORT || 3001;
const wss = new WebSocket.Server({ port });

console.log(`✅ WebSocket signaling server running on port ${port}`);

let adminSocket = null;
let clientSocket = null;

wss.on('connection', (socket) => {
  console.log('[Server] Client connected');

  socket.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('[Server] Received:', data);

    if (data.type === 'register') {
      if (data.role === 'admin') {
        adminSocket = socket;
        console.log('[Server] Admin registered');
        if (clientSocket) {
          adminSocket.send(JSON.stringify({ type: 'client-connected' }));
        }
      } else if (data.role === 'client') {
        clientSocket = socket;
        console.log('[Server] Client registered');
        if (adminSocket) {
          adminSocket.send(JSON.stringify({ type: 'client-connected' }));
        }
      }
      return;
    }

    if (data.to === 'client' && clientSocket) {
      console.log('[Server] → Forward to client:', data.payload?.type);
      clientSocket.send(JSON.stringify(data.payload));
    }

    if (data.to === 'admin' && adminSocket) {
      console.log('[Server] → Forward to admin:', data.payload?.type);
      adminSocket.send(JSON.stringify(data.payload));
    }
  });

  socket.on('close', () => {
    if (socket === adminSocket) {
      console.log('[Server] Admin disconnected');
      adminSocket = null;
    }
    if (socket === clientSocket) {
      console.log('[Server] Client disconnected');
      clientSocket = null;
    }
  });
});
