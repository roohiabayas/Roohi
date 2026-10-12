/* ROOHI – caches photos and icons so repeat visits load instantly. */
var CACHE = "roohi-img-v1";
self.addEventListener("install", function(){ self.skipWaiting(); });
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (!/^\/(images\/|favicon|apple-touch-icon)/.test(url.pathname)) return;
  /* show the cached copy at once, refresh it in the background */
  e.respondWith(caches.open(CACHE).then(function(cache){
    return cache.match(req).then(function(hit){
      var net = fetch(req).then(function(res){
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function(){ return hit; });
      return hit || net;
    });
  }));
});
