// Service worker: guarda o jogo no aparelho para abrir sem internet.
// Páginas: tenta a internet primeiro (sempre a versão nova) e usa a cópia guardada se estiver offline.
// Para publicar uma nova versão, troque o número em VERSAO.
var VERSAO = "batalha-v5";
var ARQUIVOS = ["./", "index.html", "jogo.html", "logo.png", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(VERSAO).then(function(c){
    return Promise.all(ARQUIVOS.map(function(u){
      return fetch(new Request(u, {cache: "reload"})).then(function(r){ if (r.ok) return c.put(u, r); });
    }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== VERSAO; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, {cache: "no-cache"}).then(function(r){
      if (r && r.ok){ var cp = r.clone(); caches.open(VERSAO).then(function(c){ c.put(req, cp); }); }
      return r;
    }).catch(function(){
      return caches.match(req, {ignoreSearch: true}).then(function(hit){ return hit || caches.match(req.mode === "navigate" ? "jogo.html" : req); });
    })
  );
});
