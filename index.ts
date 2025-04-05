import type nodeOsc = require('node-osc')

import { Server } from 'node-osc'
import path from 'path'
import fs from 'fs'
import maxmind, { CountryResponse } from 'maxmind'
import { createHash } from 'crypto'

type PayloadType = {
  date: string
  country?: string | null
  device: nodeOsc.ArgumentType
  deviceBase: string | null
  deviceVersion?: string | null
  host: nodeOsc.ArgumentType
  os: nodeOsc.ArgumentType
  arch: nodeOsc.ArgumentType
}
;(async () => {
  const oscServer = new Server(6374, '0.0.0.0', () => {
    console.log('OSC Server is listening')
  })

  const geolite2 = await import('geolite2-redist')
  const countryLookup = await geolite2.open(
    geolite2.GeoIpDbName.Country,
    (path: string) => {
      return maxmind.open<CountryResponse>(path)
    }
  )

  oscServer.on('message', (msg, reqinfo) => {
    if (!msg[0] || (msg[0] && msg[0] !== '/osc-telemetry')) {
      console.error(`unknown message ${msg[0]?.toString().substring(0, 16)}`)
      return
    }

    const [_, device, host, os, arch] = msg

    if (
      device === undefined ||
      host === undefined ||
      os === undefined ||
      arch === undefined
    ) {
      const strMsg = msg.slice(0, 5).join(',')
      console.error(
        `invalid message ${strMsg.substring(0, 32)}... (${strMsg.length})`
      )
      return
    }

    let country = null
    try {
      const resp = countryLookup.get(reqinfo.address)
      country = resp?.country?.iso_code
    } catch (e) {
      console.error(`country lookup failed for ${reqinfo.address}`)
    }

    let deviceBase = null
    let deviceVersion = null

    if (typeof device === 'string') {
      const deviceArr = device.split('-')
      if (deviceArr.length > 1) {
        deviceVersion = deviceArr.pop()
        deviceBase = deviceArr.join('-') //
      }
    }

    const now = new Date()
    const nowIso = now.toISOString()
    const payload: PayloadType = {
      date: nowIso,
      country,
      device,
      deviceBase,
      deviceVersion,
      host: createHash('sha256').update(host.toString()).digest('base64'),
      os,
      arch,
    }

    const datestamp = nowIso.split('T')[0]
    const outFile = path.join('/osc-telemetry', 'data-' + datestamp + '.txt')

    fs.appendFile(outFile, JSON.stringify(payload) + '\n', function (err) {
      if (err) {
        console.error(err)
        return
      }
      console.log(`${nowIso} - Added ${payload.device} to ${outFile}`)
    })
  })
})()
