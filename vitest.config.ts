import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
    globals: true,
    css: true,
    // Configurações de timeout
    testTimeout: 10000,
    hookTimeout: 10000,
    // Configurações de coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.next/**',
        '**/build/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/mock*/**',
        '**/__mocks__/**',
        '**/types/**',
        '**/*.stories.*',
        '**/storybook-static/**',
      ],
      // Thresholds mínimos de coverage
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
        // Thresholds específicos para módulos críticos
        './app/hooks/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        './app/lib/': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
      },
      // Incluir apenas arquivos de código fonte
      include: [
        'app/**/*.{ts,tsx}',
        '!app/**/*.d.ts',
        '!app/**/*.stories.*',
        '!app/**/*.test.*',
        '!app/**/*.spec.*',
      ],
    },
    // Configurações de ambiente
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Configurações de retry para testes flaky
    retry: 2,
    // Configurações de watch
    watch: false,
    // Configurações de reporter
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results.json',
      html: './test-results.html',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
