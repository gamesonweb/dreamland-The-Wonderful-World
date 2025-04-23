const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
  entry: path.resolve(appDirectory, "src/app.ts"),
  output: {
    filename: "js/bundle.js",
    path: path.resolve(appDirectory, "dist"),
    clean: true,
    publicPath: "/",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  devServer: {
    host: "0.0.0.0",
    port: 8080,
    static: [
      path.resolve(appDirectory, "public"),
      path.resolve(appDirectory, "dist"),
    ],
    hot: true,
    devMiddleware: {
      publicPath: "/",
      writeToDisk: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(appDirectory, "public/index.html"),
      filename: "index.html",
    }),
  ],
  mode: "development",
};
