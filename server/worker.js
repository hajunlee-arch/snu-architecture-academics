import { assets } from './assets.js';
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
function db(env){if(!env.DB)throw new Error('Database unavailable');return env.DB;}
function valid(data){
 if(!data||typeof data!=='object'||!Array.isArray(data.courses)||!Array.isArray(data.rules)||data.courses.length>500||data.rules.length>100)return false;
 const str=(v,n)=>typeof v==='string'&&v.length<=n;
 const ids=new Set();
 for(const c of data.courses){if(!str(c.id,100)||!c.id.trim()||ids.has(c.id)||!str(c.name,200)||!c.name.trim()||!Number.isInteger(c.grade)||c.grade<1||c.grade>5||![1,2].includes(c.term)||!['전필','전선'].includes(c.type)||!Number.isFinite(c.credit)||c.credit<0||c.credit>30||!str(c.description,5000))return false;ids.add(c.id);}
 for(const r of data.rules)if(!str(r.title,200)||!r.title.trim()||!str(r.text,10000)||!r.text.trim())return false;
 for(const k of ['cohort','effective','sourceTitle','sourceUrl','notes'])if(!str(data[k],k==='notes'?5000:1000))return false;
 if(data.sourceUrl){try{if(!['http:','https:'].includes(new URL(data.sourceUrl).protocol))return false;}catch{return false;}}
 return typeof data.confirmed==='boolean';
}
function validSettings(data){
 const keys=['tracks','courses','rules','changes'];
 const str=(v,n)=>typeof v==='string'&&v.trim().length>0&&v.length<=n;
 return data&&typeof data==='object'&&str(data.siteTitle,100)&&
  Array.isArray(data.menu)&&data.menu.length===4&&new Set(data.menu.map(x=>x.key)).size===4&&
  data.menu.every(x=>keys.includes(x.key)&&str(x.label,60))&&
  ['standard','wide'].includes(data.width)&&['comfortable','compact'].includes(data.density);
}
async function stored(env,key){
 const row=await db(env).prepare('SELECT content, revision, updated_at FROM academic_documents WHERE key = ?').bind(key).first();
 return row?{data:JSON.parse(row.content),revision:row.revision,updatedAt:row.updated_at}:{data:null,revision:0};
}
async function save(env,key,payload,uid){
 const now=new Date().toISOString();
 const result=await db(env).prepare('INSERT INTO academic_documents (key, content, revision, updated_at, updated_by) SELECT ?, ?, 1, ?, ? WHERE ? = 0 OR EXISTS (SELECT 1 FROM academic_documents WHERE key = ?) ON CONFLICT(key) DO UPDATE SET content = excluded.content, revision = academic_documents.revision + 1, updated_at = excluded.updated_at, updated_by = excluded.updated_by WHERE academic_documents.revision = ? RETURNING revision').bind(key,JSON.stringify(payload.data),now,uid,payload.revision,key,payload.revision).first();
 if(!result)return null;
 return {revision:result.revision,updatedAt:now};
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if((url.pathname.startsWith('/api/')||url.pathname==='/index.html') && env.TRUST_SITES_AUTH_HEADERS!=='true')return json({error:'Administrator authentication is not configured.'},403);
 if(url.pathname.startsWith('/api/')){
  const uid=request.headers.get('oai-authenticated-user-id');
  if(!uid)return json({error:'로그인 후 이용해 주세요.'},401);
  const isAdmin=!!env.ADMIN_EMAIL && request.headers.get('oai-authenticated-user-email')?.toLowerCase()===env.ADMIN_EMAIL.toLowerCase();
  if(url.pathname==='/api/session')return json({canEdit:isAdmin});
  if(!isAdmin)return json({error:'관리자 전용 자료입니다.'},403);
  if(!['/api/document','/api/settings'].includes(url.pathname))return json({error:'찾을 수 없습니다.'},404);
  const isSettings=url.pathname==='/api/settings';
  const year=url.searchParams.get('year');if(!isSettings&&!/^20\d{2}$/.test(year||''))return json({error:'연도를 확인해 주세요.'},400);
  const key=isSettings?'__settings':year;
  try{
   if(request.method==='GET')return json(await stored(env,key));
   if(request.method!=='PUT')return json({error:'허용되지 않는 요청입니다.'},405);
   if(!isAdmin)return json({error:'관리자만 수정할 수 있습니다.'},403);
   if(request.headers.get('Origin')!==url.origin||!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'잘못된 요청입니다.'},403);
   const raw=await request.text();if(raw.length>1000000)return json({error:'자료가 너무 큽니다.'},413);
   let payload;try{payload=JSON.parse(raw);}catch{return json({error:'입력 내용을 확인해 주세요.'},400);}
   if(!(isSettings?validSettings(payload.data):valid(payload.data))||!Number.isInteger(payload.revision)||payload.revision<0)return json({error:isSettings?'사이트 제목, 메뉴명·순서와 화면 설정을 확인해 주세요.':'필수 항목, 중복 과목번호, 학점 및 원본 주소를 확인해 주세요.'},400);
   const result=await save(env,key,payload,uid);
   if(!result)return json({error:'다른 창에서 자료가 변경되었습니다. 작성 내용을 복사해 둔 뒤 새로고침하여 최신 자료와 비교해 주세요.'},409);
   return json(result);
  }catch(error){console.error('academic data request failed',error);return json({error:'자료를 불러오거나 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'},503);}
 }
 const path=url.pathname==='/'?'/guide.html':url.pathname;
 if(path==='/index.html'&&(!env.ADMIN_EMAIL||request.headers.get('oai-authenticated-user-email')?.toLowerCase()!==env.ADMIN_EMAIL.toLowerCase()))return new Response('관리자 전용 화면입니다.',{status:403});
 const asset=assets[path];if(!asset)return new Response('Not found',{status:404});
 return new Response(asset.binary?Uint8Array.from(atob(asset.body),c=>c.charCodeAt(0)):asset.body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'self' https://chatgpt.com"}});
}};
