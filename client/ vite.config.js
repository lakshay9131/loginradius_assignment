export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            console.log('Proxying to:', proxyReq.path) // Should show "/your-endpoint"
          })
        }
      }
    }
  }
})