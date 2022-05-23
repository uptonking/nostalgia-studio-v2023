import './app';

if ((module as any).hot) {
  (module as any).hot.accept('./app.ts', () => {
    import('./app');
  });
}
