import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'Isekai Tab',
    description: 'Anime wallpaper new tab page',
    permissions: ['storage'],
    host_permissions: [
      'https://wallhaven.cc/*',
      'https://*.wallhaven.cc/*',
      'https://w.wallhaven.cc/*',
      'https://th.wallhaven.cc/*',
      'https://raw.githubusercontent.com/*',
      'https://api.github.com/*',
      'https://konachan.net/*',
      'https://*.konachan.net/*',
      'https://yande.re/*',
      'https://*.yande.re/*',
      'https://files.yande.re/*',
    ],
    browser_specific_settings: {
      gecko: {
        id: 'isekai-tab@urstark.is-a.dev',
        strict_min_version: '142.0',
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
  },
});
