const { defineConfig } = require('@vue/cli-service')
const fs = require('fs')

function getProxyTarget() {
  if (process.env.DEV_PROXY_TARGET) {
    return process.env.DEV_PROXY_TARGET
  }
  if (fs.existsSync('./.deploy.env')) {
    const envContent = fs.readFileSync('./.deploy.env', 'utf-8')
    const match = envContent.match(/REMOTE_HOST=["']?([^"'\r\n]+)["']?/)
    if (match && match[1]) {
      return `http://${match[1]}`
    }
  }
  return 'http://localhost'
}

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
        target: getProxyTarget(),
        changeOrigin: true,
        pathRewrite: { '^/root/proxy': '' },
        secure: false,
        logLevel: 'debug'
      },
    }
  }
})
