import type nodeOsc = require('node-osc');

import { Server } from 'node-osc'
import path from 'path';
import fs from 'fs';
import maxmind from 'maxmind';

(async () => {
  const oscServer = new Server(6374, '0.0.0.0', () => {
    console.log('OSC Server is listening');

  });

  const geolite2 = await import('geolite2-redist')
  const countryLookup = await geolite2.open(geolite2.GeoIpDbName.Country, (path: string) => {
    return maxmind.open(path);
  });


  oscServer.on('message', (msg, reqinfo) => {
    if (!msg[0] || (msg[0] && msg[0] !== '/osc-telemetry')) {
      console.error(`unknown message ${msg[0]?.toString().substring(0, 16)}`)
      return
    }
    if (msg.length < 5) {
      const strMsg = msg.slice(0, 5).join(",")
      console.error(`invalid message ${strMsg.substring(0, 32)}... (${strMsg.length})`)
      return
    }

    let country = null
    try {
      country = countryLookup.get(reqinfo.address)
    } catch (e) {
      console.error(`country lookup failed for ${reqinfo.address}`)
    }

    const now = new Date()
    const nowIso = now.toISOString()
    const payload = {
      date: nowIso,
      ip: reqinfo.address,
      country,
      device: msg[1],
      host: msg[2],
      os: msg[3],
      arch: msg[4]
    }

    const datestamp = nowIso.split('T')[0]
    const outFile = path.join('/osc-telemetry', 'data-' + datestamp + '.txt')

    const outLine = JSON.stringify(payload)

    fs.appendFile(outFile, outLine + "\n", function (err) {
      if (err) {
        console.error(err)
        return
      }
      console.log(`${nowIso} - Added ${payload.device} to ${outFile}`);
    });
  });
})();