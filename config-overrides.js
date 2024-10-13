const {override, addWebpackPlugin} = require('customize-cra')
const webpack = require('webpack')

module.exports = override(
  addWebpackPlugin(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development',
      ), // Sử dụng biến môi trường hiện tại hoặc mặc định là 'development'
      // Thêm các biến môi trường khác nếu cần
    }),
  ),
  config => {
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'cheap-module-source-map'
      config.output.devtoolModuleFilenameTemplate = '[absolute-resource-path]'
      config.output.devtoolFallbackModuleFilenameTemplate =
        '[absolute-resource-path]?[hash]'
    }
    return config
  },
)
