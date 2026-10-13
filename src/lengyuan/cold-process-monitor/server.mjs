import http from 'node:http';
import {createHash} from 'node:crypto';
import {readFile, realpath} from 'node:fs/promises';
import {dirname, resolve, relative, extname, sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url), catalog=require('./data.js');
const store=require('./model.js').createStore(), root=dirname(fileURLToPath(import.meta.url));
const peers=new Set(), limit=1024*1024;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.ico':'image/x-icon'};
function json(res,status,data,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(JSON.stringify(data));}
function local(req){const port=server.address().port;return [`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.host)&&(!req.headers.origin||req.headers.origin===`http://${req.headers.host}`);}
function frame(data,opcode=1){const payload=Buffer.isBuffer(data)?data:Buffer.from(JSON.stringify(data));let header;if(payload.length<126){header=Buffer.from([128|opcode,payload.length]);}else if(payload.length<65536){header=Buffer.alloc(4);header[0]=128|opcode;header[1]=126;header.writeUInt16BE(payload.length,2);}else{header=Buffer.alloc(10);header[0]=128|opcode;header[1]=127;header.writeBigUInt64BE(BigInt(payload.length),2);}return Buffer.concat([header,payload]);}
function send(socket,message){if(socket.destroyed)return;if(socket.writableLength>2*limit){socket.destroy();return;}socket.write(frame(message));}
function broadcast(message){for(const socket of peers)send(socket,message);}
function snapshot(){return {type:'cold-process-points',source:'live',timestamp:new Date().toISOString(),points:store.snapshot()};}
async function body(req){if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))throw Object.assign(Error('仅接受 application/json'),{status:415});let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>limit)throw Object.assign(Error('请求体超过 1 MiB'),{status:413});chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks));}catch{throw Object.assign(Error('JSON 格式无效'),{status:400});}}
function object(value){return value!==null&&typeof value==='object'&&!Array.isArray(value);}
const server=http.createServer(async(req,res)=>{try{
 if(!local(req))return json(res,403,{error:'只允许本机同源访问'});
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const api={'/api/cold-process/catalog':['GET'],'/api/cold-process/points':['GET','POST'],'/api/cold-process/device-motion':['POST'],};
 if(pathname.startsWith('/api/')){
  if(!api[pathname])return json(res,404,{error:'接口不存在'});
  if(!api[pathname].includes(req.method))return json(res,405,{error:'方法不支持'},{Allow:api[pathname].join(', ')});
  if(req.method==='GET')return json(res,200,pathname.endsWith('/catalog')?catalog:snapshot());
  const input=await body(req);if(!object(input))return json(res,400,{error:'请求必须为 JSON 对象'});
  if(pathname.endsWith('/points')){
   const points=input.points;
   if(!(object(points)||Array.isArray(points))||Array.isArray(points)&&points.some(p=>!object(p)||typeof p.key!=='string'))return json(res,400,{error:'points 必须为点位对象或包含 key 的对象数组'});
   // Canonicalize keys before calling the shared model; untrusted metadata cannot override a map key.
   const entries=Array.isArray(points)?points:Object.entries(points).map(([key,v])=>({...object(v)?v:{value:v},key}));
   const result=store.updatePoints(entries);if(result.rejected.length)return json(res,400,result);
   broadcast(snapshot());return json(res,200,result);
  }
  if(!catalog.devices.some(d=>d.id===input.deviceId)||!Number.isInteger(input.duration)||input.duration<100||input.duration>5000)return json(res,400,{error:'deviceId 必须存在；duration 必须是 100–5000 毫秒的整数'});
  const event={type:'cold-process-device-motion',deviceId:input.deviceId,duration:input.duration,timestamp:new Date().toISOString()};broadcast(event);return json(res,200,{accepted:true,...event});
 }
 if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'方法不支持'},{Allow:'GET, HEAD'});
 const parts=pathname.split('/');if(parts.some(p=>p==='..'||p.startsWith('.'))||pathname.includes('\\')||pathname.includes(':')||pathname.includes('\0'))return json(res,404,{error:'文件不存在'});
 const staticRoot=pathname.startsWith('/cold-monitor/')?resolve(root,'../cold-monitor'):root;
 const localPath=staticRoot===root?pathname:pathname.slice('/cold-monitor'.length);
 const path=resolve(staticRoot,'.'+(localPath==='/'?'/index.html':localPath));
 const actual=await realpath(path), rel=relative(staticRoot,actual);if(rel.startsWith('..'+sep)||rel==='..'||!mime[extname(actual)]||actual===resolve(staticRoot,'server.mjs'))return json(res,404,{error:'文件不存在'});
 const bytes=await readFile(actual);res.writeHead(200,{'Content-Type':mime[extname(actual)],'Content-Length':bytes.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(error){json(res,error.status||(error.code==='ENOENT'||error.code==='EISDIR'?404:400),{error:error.status?error.message:'请求或文件无效'});}});
server.requestTimeout=15000;server.headersTimeout=10000;
server.on('upgrade',(req,socket,head)=>{
 const reject=status=>socket.end(`HTTP/1.1 ${status}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
 if(!local(req))return reject('403 Forbidden');
 if(req.url!=='/ws')return reject('404 Not Found');
 const key=req.headers['sec-websocket-key'];
 if(req.method!=='GET'||req.headers.upgrade?.toLowerCase()!=='websocket'||req.headers['sec-websocket-version']!=='13'||typeof key!=='string'||!/^[A-Za-z0-9+/]{22}==$/.test(key))return reject('400 Bad Request');
 const accept=createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
 socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
 peers.add(socket);socket.on('error',()=>socket.destroy());socket.on('close',()=>peers.delete(socket));send(socket,snapshot());
 let pending=Buffer.alloc(0);
 function receive(chunk){pending=Buffer.concat([pending,chunk]);while(pending.length>=2){const opcode=pending[0]&15,len=pending[1]&127;if(pending[0]!==128+opcode||!(pending[1]&128)||![8,9,10].includes(opcode)||len>125){socket.end(frame(Buffer.from([3,235]),8));return;}if(pending.length<6+len)return;const data=Buffer.from(pending.subarray(6,6+len)),mask=pending.subarray(2,6);for(let i=0;i<len;i++)data[i]^=mask[i%4];pending=pending.subarray(6+len);if(opcode===8){socket.end(frame(data.length===1?Buffer.from([3,234]):data,8));return;}if(opcode===9)socket.write(frame(data,10));}}
 socket.on('data',receive);if(head.length)receive(head);
});
server.listen(Number(process.env.PORT??8812),'127.0.0.1',()=>console.log(`Cold process monitor http://127.0.0.1:${server.address().port}`));
function stop(){for(const socket of peers)socket.destroy();server.close(()=>process.exit(0));}
process.on('SIGTERM',stop);process.on('SIGINT',stop);
