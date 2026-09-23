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
        target: 'http://lims.geneinsight.com',
        changeOrigin: true,
        pathRewrite: { '^/root/proxy': '' },
        secure: false,
        logLevel: 'debug'
      },
    }
  }
})
