import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    fs: {
      // 允许访问上级目录的静态资源
      allow: ['..', '.']
    },
    // 配置代理解决CORS问题
    proxy: {
      // 将 /iiif 请求代理到 https://www.ai4dh.cn/iiif
      '/iiif': {
        target: 'https://www.ai4dh.cn',
        changeOrigin: true,
        secure: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
