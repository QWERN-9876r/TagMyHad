import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    preview: {
        host: '0.0.0.0',
        allowedHosts: ['tagmyhead.ru'],
        port: 3000,
    },
    // server: {
    //     proxy: {
    //         '/api': {
    //             target: 'http://localhost:8080',
    //             changeOrigin: true,
    //         },
    //         '/ws': {
    //             target: 'ws://localhost:8080',
    //             ws: true,
    //             changeOrigin: true,
    //         },
    //     },
    // },
})
