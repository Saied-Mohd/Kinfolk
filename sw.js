const VERSION='kinfolk-v34';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(/openrouter\.ai|elevenlabs\.io|api\.openai\.com|artificialanalysis\.ai|workers\.dev|fal\.run|fal\.media|queue\.fal\.run/.test(u.host))return;               // never cache API calls
  if(u.origin===location.origin){e.respondWith(caches.match(e.request).then(r=>{const f=fetch(e.request).then(res=>{if(res.ok)caches.open(VERSION).then(c=>c.put(e.request,res.clone()));return res}).catch(()=>r);return r||f}));return}
  if(/cdnjs\.cloudflare\.com|unpkg\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host)){e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok)caches.open(VERSION).then(c=>c.put(e.request,res.clone()));return res})))}});

self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{const c=cs.find(x=>'focus' in x);return c?c.focus():clients.openWindow('./')}))});
