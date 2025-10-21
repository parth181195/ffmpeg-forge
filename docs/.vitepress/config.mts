import { defineConfig } from 'vitepress';
import pkg from '../../package.json';

export default defineConfig({
  title: 'ffmpeg-forge',
  description: 'A modern, type-safe FFmpeg wrapper for Node.js',
  base: '/ffmpeg-forge/',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Examples', link: '/guide/quick-start' },
      {
        text: `v${pkg.version}`,
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
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'FFmpeg Class', link: '/api/ffmpeg-class' },
          ],
        },
        {
          text: 'Configuration',
          items: [
            { text: 'Conversion Config', link: '/api/conversion-config' },
            { text: 'Video Config', link: '/api/video-config' },
            { text: 'Audio Config', link: '/api/audio-config' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Filters', link: '/api/filters' },
            { text: 'Enums', link: '/api/enums' },
            { text: 'Types', link: '/api/types' },
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
