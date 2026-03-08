import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';

/**
 * Builds content.js as a self-contained IIFE.
 * Content scripts CANNOT use ES module imports — they must be plain scripts.
 * IIFE format + inlineDynamicImports bundles everything into a single file
 * with no external chunk references.
 */
export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
            entry: fileURLToPath(new URL('src/content/index.ts', import.meta.url)),
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
});
