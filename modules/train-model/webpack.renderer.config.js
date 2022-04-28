const rules = require('./webpack.rules')

rules.push({
  test: /\.jsx?$/,
  exclude: /node_modules/,
  use: [{ loader: 'babel-loader' }]
})

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
})

rules.push({
  test: /\.png$/,
  use: [{loader: 'url-loader?limit=8192'}]
})

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules
  }
}
