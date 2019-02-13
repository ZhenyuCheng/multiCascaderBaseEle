const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

module.exports = merge(baseConfig, {
    devtool: 'source-map',
    output: {
        filename: '[name]_[hash:8].js',
        chunkFilename: 'chunk_[name]_[hash:8].js'
    }
});