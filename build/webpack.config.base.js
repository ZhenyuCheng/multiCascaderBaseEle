const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

const _ = require('./utils');
const buildConfig = require('./build.config');

const {
    MODE = 'development',
} = process.env;

const mode = MODE || 'development';
const isDev = mode === 'development';

module.exports = {
    output: {
        publicPath: mode == 'development' ? buildConfig.devAssertPublicPath : './',
        path: buildConfig.output
    },
    entry: {
        index: [
            './index.js'
        ],
        example: [
            './example/index.js'
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.vue', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                }
            },
            {
                test: /\.(jsx?|babel|es6)$/,
                exclude: /node_modules\/(?!element-ui\/(packages|src))|utils\/popper\.js|utils\/date\.js/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        less: [
                            { loader: 'style-loader' }, 
                            { loader: 'css-loader' }, 
                            { loader: 'postcss-loader' }, 
                            { loader: 'less-loader' },
                        ],
                        js: [{ loader: 'babel-loader' }]
                    }
                }
            },
            {
                test: /\.css$/, 
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'postcss-loader' }
                ]
            },
            { 
                test: /\.less$/, 
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' }, 
                    { loader: 'less-loader' }
                ] 
            },
            { 
                test: /\.(sa|sc)ss$/, 
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' }, 
                    { loader: 'sass-loader' }
                ] 
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: './static/img/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: './static/media/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: './static/fonts/[name].[hash:7].[ext]'
                }
            }
        ]
    },
    plugins: [
        new FriendlyErrorsWebpackPlugin(),

        new MiniCssExtractPlugin({
            filename: isDev ? '[name].css' : '[name].[hash].css',
            chunkFilename: isDev ? '[id].css' : '[id].[hash].css'
        }), 
        new webpack.HotModuleReplacementPlugin(),

        new HtmlWebpackPlugin({
            template: _.resolve('./example/index.html'),
            inject: true,
            chunks: ['example']
        }),
    ]
}