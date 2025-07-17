import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        signIn: resolve(__dirname, 'signin.html'),
        notes: resolve(__dirname, 'notes.html'),
        forum: resolve(__dirname, 'forum.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        question: resolve(__dirname, 'question.html'),
        ask: resolve(__dirname, 'ask.html'),
        error404: resolve(__dirname, 'errors/error-404.html') 
      },
    }
  }
})
