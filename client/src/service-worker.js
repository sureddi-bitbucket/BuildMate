/* eslint-disable no-restricted-globals */
// This service worker is built with Workbox precaching to provide offline support.
// It caches build assets during install and falls back to network-first for runtime requests.

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

clientsClaim();

// Precache all build assets injected by the build process.
precacheAndRoute(self.__WB_MANIFEST);

// Use App Shell-style routing to serve index.html for navigation requests.
const fileExtensionRegexp = /[^/?]+\.[^/]+$/;
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false;
    }

    if (url.pathname.startsWith('/_')) {
      return false;
    }

    if (fileExtensionRegexp.test(url.pathname)) {
      return false;
    }

    return true;
  },
  new NavigationRoute(createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html'))
);

// Cache API responses with a stale-while-revalidate strategy.
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'buildmate-api-cache',
    plugins: [],
  })
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
