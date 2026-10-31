
const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req,res)=>res.send('<h1>Mehwar Bot Running</h1><a href="/qr">QR</a>'));
app.listen(PORT, ()=>console.log('Server on '+PORT));
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino'); const QRCode = require('qrcode'); let lastQR='';
async function startBot(){const {state,saveCreds}=await useMultiFileAuthState('auth');const sock=makeWASocket({auth:state,logger:P({level:'silent'}),browser:['Mehwar','Chrome','1.0']});sock.ev.on('creds.update',saveCreds);sock.ev.on('connection.update',async(u)=>{const{connection,lastDisconnect,qr}=u;if(qr){lastQR=await QRCode.toDataURL(qr);console.log(await QRCode.toString(qr,{type:'terminal'}));}if(connection==='close'){const s=lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut;if(s)startBot();}else if(connection==='open')console.log('Bot Connected!');});sock.ev.on('messages.upsert',async({messages})=>{const msg=messages[0];if(!msg.message||msg.key.fromMe)return;const text=msg.message.conversation||msg.message.extendedTextMessage?.text||'';if(text.toLowerCase()==='ping')await sock.sendMessage(msg.key.remoteJid,{text:'Pong! Mehwar Bot alive ✅'});});}startBot();app.get('/qr',(req,res)=>{if(!lastQR)return res.send('<h2>Waiting QR... refresh 10 sec</h2><script>setTimeout(()=>location.reload(),5000)</script>');res.send(`<h1>Scan QR</h1><img src="${lastQR}" style="width:300px"><script>setTimeout(()=>location.reload(),15000)</script>`);});
