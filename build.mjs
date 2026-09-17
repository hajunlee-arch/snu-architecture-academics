import fs from 'node:fs';
const assets={};
for(const file of fs.readdirSync('public')){const types={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',json:'application/json; charset=utf-8',jpg:'image/jpeg'};const type=types[file.split('.').pop()];if(type)assets['/'+file]={body:fs.readFileSync('public/'+file,type.startsWith('image/')?'base64':'utf8')+(file==='guide.js'?'\n'+fs.readFileSync('public/details.js','utf8'):''),type,binary:type.startsWith('image/')};}
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/assets.js','export const assets='+JSON.stringify(assets)+';');
fs.copyFileSync('server/worker.js','dist/server/index.js');fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
if(fs.existsSync('drizzle'))fs.cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
