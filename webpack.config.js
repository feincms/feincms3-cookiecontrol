const path = require("path")

const isProduction = process.env.NODE_ENV == "production"
const staticPath = "fh_cookiecontrol/static/fh_cookiecontrol/"

const config = {
  entry: `./${staticPath}main.js`,
  output: {
    filename: "main.min.js",
    path: path.resolve(__dirname, staticPath),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
    ],
  },
  optimization: {
    minimize: true,
  },
}

module.exports = () => {
  if (isProduction) {
    config.mode = "production"
  } else {
    config.mode = "development"
  }
  return config
}
