const { merge } = require("webpack-merge");
const commonConfiguration = require("./webpack.lib.common.js");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = merge(commonConfiguration, {
  mode: "production",
  devtool: false,
  plugins: [new CleanWebpackPlugin()],
});
