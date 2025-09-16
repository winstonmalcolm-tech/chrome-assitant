import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  optimizeDeps: {
    include: ["firebase/app", "firebase/auth"]
  },
  build: {
     commonjsOptions: {
      include: [/firebase/, /node_modules/]
    },
    outDir: 'dist',
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content.js'),
        selectText: resolve(__dirname, 'src/selectText.js'),
        background: resolve(__dirname, 'src/background.js'),
        panel: resolve(__dirname, 'src/panel.html'),
        contentStyle: resolve(__dirname, 'src/content.css'),
        modalTemplate: resolve(__dirname, 'src/modalTemplate.js'),
        modalTemplateStyle: resolve(__dirname, 'src/modalTemplate.css'),
        tokenListener: resolve(__dirname, 'src/tokenListener.js')
      },
      output: {
        entryFileNames: 'src/[name].js',
        assetFileNames: 'src/[name].[ext]',
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