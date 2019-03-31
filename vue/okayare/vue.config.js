// vue.config.js
const webpack = require('webpack');

module.exports = {
    runtimeCompiler: true,
    configureWebpack: config => {
        return {
            plugins: [
                new webpack.DefinePlugin({
                    'process.env.VUE_APP_SECRETS_JSON': JSON.stringify(require(process.env.VUE_APP_JSON_FILE))
                })
            ]
        }
    }

}
