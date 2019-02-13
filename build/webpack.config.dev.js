const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');
const buildConfig = require('./build.config');

module.exports = merge(baseConfig, {
    mode: 'development',
    devtool: 'eval-source-map',
    output: {
        chunkFilename: 'chunk_[name].js'
    },
    devServer: {
        contentBase: '../dist',
        hot: true,
        inline: true,
        port: buildConfig.devServerPort,
        noInfo: true,
        disableHostCheck: true,
        publicPath: buildConfig.devAssertPublicPath,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    },
    watch: true
});