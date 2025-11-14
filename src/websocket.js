const WebSocket = require('ws');

let wss;

function init(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', ws => {
        console.log('Client connected to WebSocket');

        ws.send(JSON.stringify({ type: 'connection', message: 'Connected to WebSocket server' }));

        ws.on('message', message => {
            console.log(`Received message => ${message}`);
        });

        ws.on('close', () => {
            console.log('Client disconnected from WebSocket');
        });
    });

    console.log('WebSocket server initialized');
}

function broadcast(data) {
    if (!wss) {
        console.error('WebSocket server not initialized');
        return;
    }

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

module.exports = {
    init,
    broadcast
};
