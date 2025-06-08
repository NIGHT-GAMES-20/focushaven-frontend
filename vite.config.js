import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        notes: resolve(__dirname, 'notes.html'),
        forum: resolve(__dirname, 'forum.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        question: resolve(__dirname, 'forum/question.html'),

      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'question') {
            return 'forum/question.js';
          }
          return 'assets/[name].js';
        },
      },
    }
  }
})
