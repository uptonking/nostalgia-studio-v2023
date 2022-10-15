import './app';

if (module.hot) {
  module.hot.accept('./app.js', () => {
    import('./app');
  });
}
