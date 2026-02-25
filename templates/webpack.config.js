import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env = {}, argv) => {
    const isProduction = argv.mode === 'production';
    const bundleMode = env.bundle || 'bundle'; // 'standalone' or 'bundle'

    // Dynamically find the engine root using require.resolve
    const engineRoot = path.dirname(require.resolve('brick-engine-js/package.json'));

    const config = {
        mode: isProduction ? 'production' : 'development',
        // In 'bundle' mode, we bundle ONLY the game class
        // In 'standalone' mode, we load the engine with the user's game
        entry: {
            app: bundleMode === 'bundle' ? path.resolve(__dirname, 'src/index.ts') : path.resolve(__dirname, 'src/bootstrap.ts'),
        },
        output: {
            filename: 'game.bundle.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
            ...(bundleMode === 'bundle'
                ? {
                      library: 'BrickEngineGame',
                      libraryTarget: 'window',
                      libraryExport: 'default',
                  }
                : {}),
        },
        devtool: isProduction ? false : 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules\/(?!brick-engine-js)/,
                },
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            symlinks: true,
            alias: {
                'brick-engine-js': path.resolve(engineRoot, 'dist/game.bundle.js'),
            },
        },
        externals: {
            p5: 'p5',
            'brick-engine-js': 'BrickEngine',
        },
        plugins: [
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
        delete config.externals['brick-engine-js'];

        // Plugins only for standalone mode
        config.plugins.push(
            new HtmlWebpackPlugin({
                template: path.resolve(engineRoot, 'dist/index.html'),
                favicon: path.resolve(engineRoot, 'dist/favicon.ico'),
                inject: false,
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(engineRoot, 'dist/vendor/p5.min.js'),
                        to: 'vendor/p5.min.js',
                    },
                    { from: path.resolve(engineRoot, 'dist/css'), to: 'css' },
                    { from: path.resolve(engineRoot, 'dist/images'), to: 'images' },
                    { from: path.resolve(engineRoot, 'dist/sounds'), to: 'sounds' },
                    { from: path.resolve(engineRoot, 'dist/fonts'), to: 'fonts' },
                ],
            }),
        );
    }

    return config;
};
