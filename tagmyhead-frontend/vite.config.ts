import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    preview: {
        host: '0.0.0.0',
        allowedHosts: ['dimalovedasha.ru', 'tagmyhead.online', 'tagmyhead.ru'],
        port: 3000,
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://89.169.151.181:8080',
                changeOrigin: true,
            },
            '/ws': {
                target: 'ws://89.169.151.181:8080',
                ws: true,
                changeOrigin: true,
            },
        },
    },
})
