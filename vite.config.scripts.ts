import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite config for building background.js and content.js as IIFE scripts.
 *
 * Content scripts and older-style service workers must be plain scripts
 * (no ES module "import" at the top level) because Chrome loads them via
 * the manifest, not as <script type="module">.
 *
 * IIFE format + inlineDynamicImports bundles everything into a single
 * self-contained file with no external chunk references.
 *
 * We build each entry separately so Rollup doesn't complain about
 * inlineDynamicImports being incompatible with multiple entries.
 */

export default [
    // --- Background service worker ---
    defineConfig({
        build: {
            outDir: 'dist',
            emptyOutDir: false,
            lib: {
                entry: resolve(__dirname, 'src/background/index.ts'),
                name: 'background',
                formats: ['iife'],
                fileName: () => 'background.js',
            },
            rollupOptions: {
                output: {
                    inlineDynamicImports: true,
                },
            },
        },
    }),
    // --- Content script ---
    defineConfig({
        build: {
            outDir: 'dist',
            emptyOutDir: false,
            lib: {
                entry: resolve(__dirname, 'src/content/index.ts'),
                name: 'content',
                formats: ['iife'],
                fileName: () => 'content.js',
            },
            rollupOptions: {
                output: {
                    inlineDynamicImports: true,
                },
            },
        },
    }),
];
