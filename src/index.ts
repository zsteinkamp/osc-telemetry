import { Server, ServerMessageListener } from 'node-osc';

var oscServer = new Server(6374, '0.0.0.0', () => {
  console.log('OSC Server is listening');
});

oscServer.on('message', (msg) => {
  console.log(`Message: ${msg}`);
  oscServer.close();
});