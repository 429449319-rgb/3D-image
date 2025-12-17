import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // 代理 API 请求
      '/api': {
        target: 'http://10.213.19.130:9090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // 代理文件服务器请求
      '/sanweifile': {
        target: 'http://10.213.19.130:9001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
