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
        secure: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(`[代理] /iiif 请求: ${req.method} ${req.url}`);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log(`[代理] /iiif 响应: ${req.url} - ${proxyRes.statusCode}`);
          });
          proxy.on('error', (err) => {
            console.error(`[代理] /iiif 错误:`, err);
          });
        }
      },
      // 将 /proxy 请求代理到对应的URL
      '/proxy': {
        target: 'https://www.ai4dh.cn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          // 从 /proxy?url=https://www.ai4dh.cn/iiif/... 中提取实际URL
          const urlParams = new URLSearchParams(path.split('?')[1]);
          const actualUrl = urlParams.get('url');
          console.log(`[代理] /proxy 重写: ${path} -> ${actualUrl}`);
          return actualUrl || path;
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(`[代理] /proxy 请求: ${req.method} ${req.url}`);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log(`[代理] /proxy 响应: ${req.url} - ${proxyRes.statusCode}`);
          });
          proxy.on('error', (err) => {
            console.error(`[代理] /proxy 错误:`, err);
          });
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
