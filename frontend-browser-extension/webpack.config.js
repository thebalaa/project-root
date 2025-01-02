// webpack.config.js
const path = require('path');

module.exports = {
  // You can keep 'development', but be sure to add a devtool that does NOT use eval.
  // If you want to create a production build, set mode to 'production' and devtool to 'source-map'.
  mode: 'development',

  // IMPORTANT: set a devtool that doesn't rely on eval(), e.g., 'source-map' or 'inline-source-map'
  // 'inline-source-map' still inlines the source map but doesn't rely on eval
  // For a final extension build, you might opt for devtool: 'source-map' or devtool: false
  devtool: 'inline-source-map',

  entry: './src/mainController.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  stats: {
    errorDetails: true,
  },
};
