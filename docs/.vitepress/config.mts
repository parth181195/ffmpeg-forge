import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'ffmpeg-forge',
  description: 'A modern, type-safe FFmpeg wrapper for Node.js',
  base: '/ffmpeg-forge/',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Examples', link: '/guide/quick-start' },
      {
        text: 'v0.3.1',
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/parth181195/ffmpeg-forge/blob/main/CHANGELOG.md',
          },
          { text: 'GitHub', link: 'https://github.com/parth181195/ffmpeg-forge' },
          { text: 'npm', link: 'https://www.npmjs.com/package/ffmpeg-forge' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ],
        },
        {
          text: 'Guides',
          items: [
            { text: 'Filters', link: '/FILTERS' },
            { text: 'Hardware Acceleration', link: '/HARDWARE' },
            { text: 'Thumbnails & Trailers', link: '/THUMBNAILS_TRAILERS' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/parth181195/ffmpeg-forge' }],

    editLink: {
      pattern: 'https://github.com/parth181195/ffmpeg-forge/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Parth Jansari',
    },
  },
});
