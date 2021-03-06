'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

const entry = { app: ['./src/Index.tsx'] };

const plugins = [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
    }),
    new HtmlWebpackPlugin({
        template: 'src/index.html'
    })
];

let cssLoader;

if (process.env.NODE_ENV === 'production') {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');

    cssLoader = {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
    };

    plugins.push(
        new MiniCssExtractPlugin({
            filename: '[name].min.css'
        })
    );
} else {
    const WebpackNotifierPlugin = require('webpack-notifier');

    entry.app.unshift('webpack-hot-middleware/client');

    cssLoader = {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
    };

    plugins.push(new WebpackNotifierPlugin(), new webpack.HotModuleReplacementPlugin());
}

module.exports = {
    mode: 'development',

    devtool: 'source-map',

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
        modules: [path.resolve('.'), 'node_modules']
    },

    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: path.resolve(__dirname, 'node_modules')
            },
            {
                enforce: 'pre',
                test: /\.tsx?$/,
                loader: 'tslint-loader',
                exclude: [path.resolve(__dirname, 'node_modules')],
                options: {
                    emitErrors: true,
                    failOnHint: true
                }
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: path.resolve(__dirname, 'node_modules')
            },
            cssLoader
        ]
    },

    entry,

    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].[hash].js'
    },

    plugins,

    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: mod => {
                        return /[\\/]node_modules[\\/]/.test(mod.context);
                    },
                    chunks: 'initial',
                    name: 'vendors',
                    priority: 10,
                    enforce: true
                }
            }
        },
        minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
    }
};
