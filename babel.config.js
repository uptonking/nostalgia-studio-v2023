module.exports = function (api) {
  // 若build依赖于env，就不要再指定api.cache为forever或never了
  // api.cache(true);

  // api.env() returns the current NODE_ENV string.
  const env = api.env();
  const isProd = env?.toLowerCase() === 'production';

  function checkAppEnv(env) {
    return (
      process.env.APP_ENV &&
      process.env.APP_ENV.toLowerCase().indexOf(env) !== -1
    );
  }

  // 用在react应用开发调试阶段，会启用 react-refresh/babel
  const isEnvReactHotReload = checkAppEnv('reacthot');
  // 用在react项目打包阶段，不会启用react-refresh/babel
  const isEnvReact = checkAppEnv('react');
  const isEnvReactLike = checkAppEnv('reactlike');

  console.log(
    ';; env.APP_ENV, isEnvReact ',
    process.env.APP_ENV,
    isEnvReact,
    env,
  );

  let babelPresetReactConfig = {};
  /** 根据具体的react-like环境单独配置 */
  if (isEnvReactLike) {
    babelPresetReactConfig = {
      runtime: 'classic',
      pragma: 'Didact.createElement',
      // pragmaFrag: 'Reacting.Fragment',
      throwIfNamespace: false,
    };
  }

  // Plugins run before Presets. Plugin ordering is first to last.
  const plugins = [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: false }],
    // ['@babel/plugin-syntax-import-assertions'],
    isEnvReactHotReload && 'react-refresh/babel',
  ].filter(Boolean);

  function configModule() {
    if (env === 'esm' || env === 'es6') {
      return false;
    }
    // auto defaults to node commonjs
    return 'auto';
  }

  // Preset ordering is reversed (last to first).
  const presets = [
    [
      '@babel/preset-env',
      {
        modules: false,
        // modules: configModule(),
        // targets: 'defaults', // '> 0.5%, last 2 versions, not dead',
        targets: 'last 2 Chrome versions',
        useBuiltIns: 'usage',
        corejs: { version: '3.30', proposals: true },
        shippedProposals: true,
        debug: false,
      },
    ],
    [
      '@babel/preset-typescript',
      {
        // later: support other jsx
        isTSX: Boolean(isEnvReact),
        allExtensions: true,
        // onlyRemoveTypeImports: true,
        allowNamespaces: true,
        allowDeclareFields: true,
      },
    ],
    isEnvReact && [
      '@babel/preset-react',
      {
        development: !isProd,
        ...babelPresetReactConfig,
      },
    ],
    [
      '@linaria',
      {
        evaluate: true,
        displayName: !isProd,
        babelOptions: {
          // rootMode: 'upward',
          configFile: false,
          presets: [
            [
              '@babel/preset-env',
              {
                modules: false,
                useBuiltIns: 'usage',
                corejs: { version: '3.30', proposals: true },
                shippedProposals: true,
                debug: false,
              },
            ],
            [
              '@babel/preset-typescript',
              {
                isTSX: Boolean(isEnvReact),
                allExtensions: true,
                // onlyRemoveTypeImports: true,
                allowNamespaces: true,
                allowDeclareFields: true,
              },
            ],
            isEnvReact && '@babel/preset-react',
          ].filter(Boolean),
        },
      },
    ],
  ].filter(Boolean);

  // console.log('babel-presets, ', JSON.stringify(presets));

  const ignore = ['node_modules'];

  return {
    plugins,
    presets,
    ignore,
  };
};
