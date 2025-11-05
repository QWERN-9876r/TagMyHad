import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        port: 80,
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
