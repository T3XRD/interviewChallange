const express = require('express');
const http = require('http');
const uuid = require('uuid')
const WebSocket = require('ws');

const app = express();
const port = 8080;

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
const sockets = new Map();


// Needed for proper websocket connectivity
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// Using 0.0.0.0 to listen for localhost and 192.168.0.158 hosts
// so that the app can work on 2 different devices
server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0':${port}`);
});

wss.on('connection', (socket) => {

    // Create a new uuid for socket
    // Being used to differentiate websockets inside the Map
    const socketId = uuid.v4();

    // Sets the socket into the Map
    sockets.set(socketId, socket);

    // Sends the UUID to FE
    socket.send(JSON.stringify({ type: 'uuid', socketId }));

    socket.on('message', (message) => {
        // Checks if it's a Buffer, if so decodes it into a string with UTF-8 format
        if (Buffer.isBuffer(message)) {
            message = message.toString('utf-8');
        }

        // 1 websocket speaks with other websockets at once
        sockets.forEach((item, key) => {
            if (key === socketId) {
                return;
            }

            item.send(message)
        });
    });

    // Deletes websocket from the Map
    socket.on("close", () => {
        sockets.delete(socketId);
    });
});
