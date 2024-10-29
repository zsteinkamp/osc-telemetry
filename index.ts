import { Server } from 'node-osc';
import * as path from 'path'
import * as fs from 'fs'

var oscServer = new Server(6374, '0.0.0.0', () => {
  console.log('OSC Server is listening');
});

oscServer.on('message', (msg, reqinfo) => {
  if (typeof (msg) === 'string') {
    msg = [msg]
  }
  const now = new Date()
  const datestamp = now.toISOString().split('T')[0]
  const outFile = path.join('/osc-telemetry', 'data-' + datestamp + '.txt')

  const outLine = `${reqinfo.address},${msg.join(',')}`

  if (outLine.match("\n")) {
    console.error(`newline found in payload ${JSON.stringify(outLine)}`)
    return
  }

  fs.appendFile(outFile, outLine + "\n", function (err) {
    if (err) {
      console.error(err)
      return
    }
    console.log(`Saved ${outLine} to ${outFile}`);
  });
});