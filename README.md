# osc-telemetry

This is a node.js based OSC server. Its purpose is to collect `/osc-telemetry`
messages and log them to files on disk.

These messages originate from the startup sequence of my Max for Live plugins.
They will dispatch an OSC message to this server, containing the device name and
version, OS type, platform (Intel, AMD), and computer identifier.

That information is logged, with the computer identifier being hashed prior to
being written to disk.

This allows me, the developer of these tools, to see what is being used the most
so that I can more wisely invest my time. It also gives me a sense of
satisfaction to know that my work is being used by many people around the
world.

As of April, 2025, there are about 800 people in 30 countries using my tools. I
think that is pretty cool :)
