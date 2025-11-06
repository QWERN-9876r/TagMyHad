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
    // server: {
    //     proxy: {
    //         '/api': {
    //             target: 'https://158.160.97.248:8080',
    //             changeOrigin: true,
    //         },
    //         '/ws': {
    //             target: 'wss://158.160.97.248/:8080',
    //             ws: true,
    //             changeOrigin: true,
    //         },
    //     },
    // },
})
