// Space Prompter pairing relay.
// Passes opaque, end-to-end encrypted messages between devices that share a
// room id. It never stores anything and cannot read scripts: the encryption
// key lives only in the QR link's #fragment, which browsers never send.
//
//   npm install ws && PORT=8787 node server.js
//
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || 8787);
const ALLOWED = (process.env.ALLOWED_ORIGINS || 'https://studio.shovonix.dev,http://localhost:8099,http://127.0.0.1:8099').split(',');
const MAX_MSG = 512 * 1024;      // bytes per message
const MAX_PEERS = 4;             // host + up to 3 phones/tablets per room
const MAX_ROOMS = 500;
const IDLE_MS = 30 * 60 * 1000;  // drop a silent connection after 30 min
const RATE = { windowMs: 1000, max: 80 }; // messages per second per socket

const rooms = new Map(); // roomId -> Set<ws>

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') { res.writeHead(200, { 'content-type': 'text/plain' }); res.end('ok'); return; }
  res.writeHead(404); res.end();
});
const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_MSG });

server.on('upgrade', (req, socket, head) => {
  const origin = req.headers.origin || '';
  if (ALLOWED.indexOf(origin) === -1) { socket.write('HTTP/1.1 403 Forbidden\r\n\r\n'); socket.destroy(); return; }
  const u = new URL(req.url, 'http://x');
  const room = u.searchParams.get('room') || '';
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(room)) { socket.write('HTTP/1.1 400 Bad Request\r\n\r\n'); socket.destroy(); return; }
  const set = rooms.get(room);
  if (!set && rooms.size >= MAX_ROOMS) { socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n'); socket.destroy(); return; }
  if (set && set.size >= MAX_PEERS) { socket.write('HTTP/1.1 409 Conflict\r\n\r\n'); socket.destroy(); return; }
  wss.handleUpgrade(req, socket, head, (ws) => { ws.room = room; wss.emit('connection', ws); });
});

wss.on('connection', (ws) => {
  let set = rooms.get(ws.room);
  if (!set) { set = new Set(); rooms.set(ws.room, set); }
  set.add(ws);
  ws.alive = true; ws.lastMsg = Date.now(); ws.count = 0; ws.winStart = Date.now();
  ws.on('pong', () => { ws.alive = true; });
  ws.on('message', (data, isBinary) => {
    const now = Date.now();
    if (now - ws.winStart > RATE.windowMs) { ws.winStart = now; ws.count = 0; }
    if (++ws.count > RATE.max) return; // silently drop floods
    ws.lastMsg = now;
    const peers = rooms.get(ws.room);
    if (!peers) return;
    for (const p of peers) if (p !== ws && p.readyState === 1) p.send(data, { binary: isBinary });
  });
  const leave = () => {
    const s = rooms.get(ws.room);
    if (!s) return;
    s.delete(ws);
    if (s.size === 0) rooms.delete(ws.room);
  };
  ws.on('close', leave);
  ws.on('error', leave);
});

setInterval(() => {
  const now = Date.now();
  for (const ws of wss.clients) {
    if (!ws.alive || now - ws.lastMsg > IDLE_MS) { ws.terminate(); continue; }
    ws.alive = false; ws.ping();
  }
}, 20000);

server.listen(PORT, '127.0.0.1', () => console.log('space-prompter relay on 127.0.0.1:' + PORT));
