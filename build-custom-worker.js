'use strict'

const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const buildCustomWorker = ({ name, basedir, destdir, mode }) => {
  const customWorkerEntries = ['ts', 'js']
    .map(ext => path.join(basedir, 'worker', `index.${ext}`))
    .filter(entry => fs.existsSync(entry))

  if (customWorkerEntries.length === 1) {
    const customWorkerEntry = customWorkerEntries[0]
    console.log(`> [PWA] Custom worker found: ${customWorkerEntry}`)
    console.log(`> [PWA] Build custom worker: ${path.join(destdir, name)}`)
    webpack({
      mode,
      target: 'webworker',
      entry: customWorkerEntry,
      resolve: {
        extensions: ['.ts', '.js']
      },
      module: {
        rules: [
          {
            test: /\.(t|j)s$/i,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  //presets: ['@babel/preset-env']
                  presets: [['next/babel', {
                    'transform-runtime': {
                      corejs: false,
                      helpers: true,
                      regenerator: false,
                      useESModules: true
                    },
                    'preset-env': {
                      modules: false,
                      targets: 'chrome >= 56'
                    }
                  }]]
                }
              }
            ]
          }
        ]
      },
      output: {
        path: destdir,
        filename: name
      },
      plugins: [
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [path.join(destdir, 'worker-*.js'), path.join(destdir, 'worker-*.js.map')]
        })
      ]//.concat(config.plugins.filter(plugin => plugin instanceof webpack.DefinePlugin))
    }).run((error, status) => {
      if (error || status.hasErrors()) {
        console.error(`> [PWA] Failed to build custom worker`)
        console.error(status.toString({ colors: true }))
        process.exit(-1)
      }
    })
  }
}

module.exports = buildCustomWorker
