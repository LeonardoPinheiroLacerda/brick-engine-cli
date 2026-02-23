import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default (env = {}, argv) => {
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
            filename: 'game.bundle.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
        },
        devtool: isProduction ? false : 'source-map',
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
