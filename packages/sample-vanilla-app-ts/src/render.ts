import './App';

if ((module as any).hot) {
  (module as any).hot.accept('./App.ts', () => {
    import('./App');
  });
}
