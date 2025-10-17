import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'example/**',
        '*.config.ts',
        'coverage/**',
        'tests/**',
        'src/types/**',
        'src/index.ts',
        'src/errors/index.ts',
        'src/parsers/index.ts',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/720p*.ts', // Test fixtures
      ],
      include: ['src/**/*.ts'],
    },
  },
});

