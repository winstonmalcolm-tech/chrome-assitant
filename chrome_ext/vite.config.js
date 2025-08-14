import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content.js'),
        selectText: resolve(__dirname, 'src/selectText.js'),
        background: resolve(__dirname, 'src/background.js'),
        panel: resolve(__dirname, 'src/panel.html'),
        contentStyle: resolve(__dirname, 'src/content.css'),
        modalTemplate: resolve(__dirname, 'src/modalTemplate.js')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        format: 'es',
        manualChunks: undefined,
      },
      external: []
    },
    target: 'es2020',
    minify: false
  },
  define: {
    global: 'globalThis'
  }
  // Remove the plugins array - Vite will handle copying public files automatically
});