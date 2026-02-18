const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env = {}, argv) => {
    const isProduction = argv.mode === 'production';
    const bundleMode = env.bundle || 'bundle'; // 'standalone' or 'bundle'

    // Dynamically find the engine root using require.resolve
    const engineRoot = path.dirname(require.resolve('brick-engine-js/package.json'));
    // Path to the game class in THIS project
    const myGamePath = path.resolve(__dirname, 'src/index.ts');

    const config = {
        mode: isProduction ? 'production' : 'development',
        // In 'bundle' mode, we bundle ONLY the game class
        entry: bundleMode === 'bundle' ? myGamePath : path.resolve(engineRoot, 'src/main.ts'),
        output: {
            filename: bundleMode === 'bundle' ? 'game.bundle.js' : 'my-game.bundle.js',
            path: path.resolve(__dirname, 'dist'),
            clean: bundleMode !== 'bundle', // Don't clean if we are just adding a bundle? Actually clean is fine if we run it separately.
        },
        devtool: isProduction ? 'source-map' : 'eval-source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            symlinks: false,
            alias: {
                '@client-game': myGamePath,
                'brick-engine-js': path.resolve(engineRoot, 'dist/brick-engine.js'),
            },
        },
        externals: {
            p5: 'p5',
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.APP_MODE': JSON.stringify('client'),
            }),
            new MiniCssExtractPlugin({
                filename: 'style.css',
            }),
        ],
        devServer: {
            static: path.resolve(__dirname, 'dist'),
            port: 8080,
            open: true,
            hot: true,
        },
    };

    if (bundleMode === 'standalone') {
        // Plugins only for standalone mode
        config.plugins.push(
            new HtmlWebpackPlugin({
                template: path.resolve(engineRoot, 'public/index.html'),
                favicon: path.resolve(engineRoot, 'public/favicon.ico'),
                inject: 'body',
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: path.resolve(engineRoot, 'node_modules/p5/lib/p5.min.js'), to: 'vendor/p5.min.js' },
                    { from: path.resolve(engineRoot, 'public/images'), to: 'images' },
                    { from: path.resolve(engineRoot, 'public/sounds'), to: 'sounds' },
                    { from: path.resolve(engineRoot, 'public/favicon.ico'), to: './' },
                ],
            }),
        );
    }

    return config;
};
