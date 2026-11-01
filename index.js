const express = require('express');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const app = express();
let qrData = null;
let connected = false;
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ auth: state });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect, qr } = u;
    if(qr){ qrData = qr; console.log('QR READY'); }
    if(connection==='open'){ connected=true; qrData=null; console.log('CONNECTED'); }
    if(connection==='close'){ if(lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startBot(); }
  });
}
app.get('/', (req,res)=>res.send('<h1>Bot Live! Go to /qr</h1>'));
app.get('/qr', async (req,res)=>{
  if(connected) return res.send('<h1>Connected ✅</h1>');
  if(!qrData) return res.send('<h2>Waiting QR... Refresh in 5 sec</h2><script>setTimeout(()=>location.reload(),5000)</script>');
  const img = await qrcode.toDataURL(qrData);
  res.send(`<center><h2>Scan QR</h2><img src="${img}" width="300"><br><br>Refreshes auto</center><script>setTimeout(()=>location.reload(),20000)</script>`);
});
app.listen(3000, ()=>{ console.log('Server 3000'); startBot(); });
