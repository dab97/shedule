/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (

      new Promise(resolve => {
        if ("document" in self) {
          const script = document.createElement("script");
          script.src = uri;
          script.onload = resolve;
          document.head.appendChild(script);
        } else {
          nextDefineUri = uri;
          importScripts(uri);
          resolve();
        }
      })

        .then(() => {
          let promise = registry[uri];
          if (!promise) {
            throw new Error(`Module ${uri} didn’t register its module`);
          }
          return promise;
        })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7144475a'], (function (workbox) {
  'use strict';

  importScripts();
  self.skipWaiting();
  workbox.clientsClaim();
  workbox.registerRoute("/", new workbox.NetworkFirst({
    "cacheName": "start-url",
    plugins: [{
      cacheWillUpdate: async ({
        response: e
      }) => e && "opaqueredirect" === e.type ? new Response(e.body, {
        status: 200,
        statusText: "OK",
        headers: e.headers
      }) : e
    }]
  }), 'GET');
  workbox.registerRoute(/.*/i, new workbox.NetworkOnly({
    "cacheName": "dev",
    plugins: []
  }), 'GET');
  self.__WB_DISABLE_DEV_LOGS = true;

}));

// === Push Notification Handlers ===

// Обработчик push-уведомлений
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[SW] Push received but no data');
    return;
  }

  try {
    const payload = event.data.json();

    const options = {
      body: payload.body || 'Расписание было обновлено',
      icon: payload.icon || '/favicon.png',
      badge: payload.badge || '/favicon.png',
      tag: payload.tag || 'schedule-update',
      vibrate: [100, 50, 100],
      data: payload.data || {},
      actions: [
        { action: 'open', title: 'Открыть' },
        { action: 'dismiss', title: 'Закрыть' },
      ],
      requireInteraction: false,
    };

    event.waitUntil(
      self.registration.showNotification(
        payload.title || 'Расписание РГСУ',
        options
      )
    );
  } catch (error) {
    console.error('[SW] Error processing push:', error);
  }
});

// Обработчик клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'SCHEDULE_UPDATE',
            data: event.notification.data,
          });
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Обработчик закрытия уведомления
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

