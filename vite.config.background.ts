import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';

/**
 * Builds background.js as a self-contained IIFE.
 * Service workers in MV3 can use type:module, but building as IIFE
 * is simpler and avoids any chunk-splitting issues.
 */
export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
            entry: fileURLToPath(new URL('src/background/index.ts', import.meta.url)),
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
});
