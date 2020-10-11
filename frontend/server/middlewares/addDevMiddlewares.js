const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

function createWebpackMiddleware(compiler, publicPath) {
  return webpackDevMiddleware(compiler, {
    logLevel: 'warn',
    publicPath,
    silent: true,
    stats: 'errors-only',
  });
}

module.exports = function addDevMiddlewares(app, webpackConfig) {
  const compiler = webpack(webpackConfig);
  const middleware = createWebpackMiddleware(
    compiler,
    webpackConfig.output.publicPath,
  );

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));

  // Since webpackDevMiddleware uses memory-fs internally to store build
  // artifacts, we use it instead
  const fs = middleware.fileSystem;

  app.get('/webjs', (req, res) => {
    fs.readFile(path.join(compiler.outputPath, 'privacy.wasm'), (err, file) => {
      if (err) {
        res.sendStatus(404);
      } else {
        res.send(file);
      }
    });
  });

  app.get('/shared-ls', (req, res) => {
    fs.readFile(path.join(compiler.outputPath, 'shared-local-storage.html'), (err, file) => {
      if (err) {
        res.sendStatus(404);
      } else {
        res.send(file.toString());
      }
    });
  });

  // app.get('/privacy.wasm', (req, res) => {
  //   fs.readFile(path.join(compiler.outputPath, 'privacy.wasm'), (err, file) => {
  //     if (err) {
  //       res.sendStatus(404);
  //     } else {
  //       res.setHeader('Cache-Control', 'public,max-age=31536000');
  //       res.send(file);
  //       console.log({res});
  //     }
  //   });
  // });

  app.get('*', (req, res) => {
    fs.readFile(path.join(compiler.outputPath, 'index.html'), (err, file) => {
      if (err) {
        res.sendStatus(404);
      } else {
        res.send(file.toString());
      }
    });
  });
};
