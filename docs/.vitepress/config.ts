import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'ffmpeg-forge',
  description: 'A modern, type-safe FFmpeg wrapper for Node.js',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/ffmpeg-class' },
      { text: 'Examples', link: '/examples/basic-conversion' },
      {
        text: 'v0.1.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
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
          text: 'Core Concepts',
          items: [
            { text: 'Configuration API', link: '/guide/configuration' },
            { text: 'Progress Tracking', link: '/guide/progress' },
            { text: 'Error Handling', link: '/guide/errors' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Video Conversion', link: '/guide/video-conversion' },
            { text: 'Filters', link: '/guide/filters' },
            { text: 'Hardware Acceleration', link: '/guide/hardware' },
            { text: 'Screenshots & Thumbnails', link: '/guide/screenshots' },
            { text: 'Trailers', link: '/guide/trailers' },
            { text: 'Concatenation', link: '/guide/concatenation' },
            { text: 'Batch Processing', link: '/guide/batch' },
            { text: 'Presets', link: '/guide/presets' },
          ],
        },
      ],
      
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'FFmpeg Class', link: '/api/ffmpeg-class' },
            { text: 'Types', link: '/api/types' },
            { text: 'Enums', link: '/api/enums' },
            { text: 'Presets', link: '/api/presets' },
            { text: 'Utilities', link: '/api/utilities' },
          ],
        },
      ],
      
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Conversion', link: '/examples/basic-conversion' },
            { text: 'Filters', link: '/examples/filters' },
            { text: 'Hardware Acceleration', link: '/examples/hardware' },
            { text: 'Screenshots', link: '/examples/screenshots' },
            { text: 'Thumbnails & Trailers', link: '/examples/thumbnails-trailers' },
            { text: 'Concatenation', link: '/examples/concatenation' },
            { text: 'Batch Processing', link: '/examples/batch' },
            { text: 'Advanced', link: '/examples/advanced' },
          ],
        },
      ],
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/parth181195/ffmpeg-forge' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/ffmpeg-forge' },
    ],
    
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
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'ffmpeg-forge' }],
  ],
});

