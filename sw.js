/* Kings & Dice service worker: Web Push for async invites. */
self.addEventListener("push", function (event) {
  var data = { title: "Kings & Dice", body: "Your friend is ready to play!", url: "https://kingsanddice.github.io/" };
  try {
    if (event.data) {
      var parsed = event.data.json();
      if (parsed) {
        if (parsed.title) data.title = String(parsed.title);
        if (parsed.body) data.body = String(parsed.body);
        if (parsed.url) data.url = String(parsed.url);
      }
    }
  } catch (e) {
    try { var t = event.data && event.data.text(); if (t) data.body = t; } catch (e2) {}
  }
  var tag = "kd-invite";
  try {
    var m = /[?&]room=([A-Za-z0-9]+)/.exec(data.url);
    if (m) tag = "kd-invite-" + m[1].toUpperCase();
  } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: tag,
      icon: "/assets/icon-192.png",
      badge: "/assets/icon-192.png",
      data: { url: data.url }
    })
  );
});
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "https://kingsanddice.github.io/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url && c.url.indexOf("kingsanddice.github.io") !== -1 && "focus" in c) {
          if ("navigate" in c) { try { c.navigate(url); } catch (e) {} }
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
self.addEventListener("install", function (event) { event.waitUntil(self.skipWaiting()); });
self.addEventListener("activate", function (event) { event.waitUntil(clients.claim()); });
