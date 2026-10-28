import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'Isekai Tab',
    description: 'Anime wallpaper new tab page',
    permissions: ['storage'],
    host_permissions: [
      'https://*.reddit.com/*',
      'https://*.redd.it/*',
      'https://*.redditmedia.com/*',
      'https://wallhaven.cc/*',
      'https://*.wallhaven.cc/*',
      'https://w.wallhaven.cc/*',
      'https://th.wallhaven.cc/*',
    ],
  },
});
