import './App';

if (module.hot) {
  module.hot.accept('./App.js', () => {
    import('./App');
  });
}
