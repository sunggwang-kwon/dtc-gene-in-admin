const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: "/",
  configureWebpack: {
    resolve: {
      extensions: ['*', '.js', '.vue', '.json'],
    },
  },
  // proxy 설정
  devServer: {
    proxy: {
      '/root/proxy': {
        target: 'http://218.153.133.118',
        changeOrigin: true,
        pathRewrite: { '^/root/proxy': '' },
        secure: false,
        logLevel: 'debug'
      },
    }
  }
})
