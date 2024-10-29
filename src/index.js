"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_osc_1 = require("node-osc");
var oscServer = new node_osc_1.Server(6374, '0.0.0.0', () => {
    console.log('OSC Server is listening');
});
oscServer.on('message', (msg) => {
    console.log(`Message: ${msg}`);
    oscServer.close();
});
