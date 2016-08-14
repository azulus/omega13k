var webpack = require('webpack')

module.exports = {
  output: {
    filename: 'g.js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true
    })
  ]
};
