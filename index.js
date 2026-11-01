const express = require('express');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const app = express();
let qrCodeData = null;
let isConnected = false;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if(qr) {
            qrCodeData = qr;
            console.log('QR Generated');
        }
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
            if(shouldReconnect) startBot();
        } else if(connection === 'open') {
            isConnected = true;
            qrCodeData = null;
            console.log('Bot Connected!');
        }
    });
}

app.get('/', (req, res) => {
    res.send(isConnected ? '<h1>Bot Connected ✅</h1>' : '<h1>Mehwar Bot is Live! Go to /qr</h1>');
});

app.get('/qr', async (req, res) => {
    if(isConnected) return res.send('<h1>Already Connected ✅</h1>');
    if(!qrCodeData) return res.send('<h2>Waiting QR... Refresh after 10 sec</h2><script>setTimeout(()=>location.reload(),5000)</script>');
    const qrImage = await qrcode.toDataURL(qrCodeData);
    res.send(`<div style="text-align:center"><h2>Scan QR</h2><img src="${qrImage}" style="width:300px"><script>setTimeout(()=>location.reload(),20000)</script></div>`);
});

app.listen(3000, () => {
    console.log('Server on 3000');
    startBot();
});
