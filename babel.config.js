module.exports = function (api) {
  // 若build依赖于env，就不要再指定api.cache为forever或never了
  // api.cache(true);

  const env = api.env();
  // const isProd = api.env('production');

  function checkAppEnv(env) {
    return (
      process.env.APP_ENV &&
      process.env.APP_ENV.toLowerCase().indexOf(env) !== -1
    );
  }

  // 用在react应用开发调试阶段，会启用@babel/preset-react、react-refresh/babel
  const isEnvReactHotReload = checkAppEnv('reacthot');
  // 用在react项目打包阶段，会启用@babel/preset-react，不会启用react-refresh/babel
  const isEnvReact = checkAppEnv('react') || checkAppEnv('reactlike');
  const isEnvReactLike = checkAppEnv('reactlike');

  console.log(';;process.env.APP_ENV, ', process.env.APP_ENV);
  console.log(';;isEnvReact, ', isEnvReact);

  /** 需要根据具体的react-like环境单独配置 */
  let babelPresetReactConfig = {};
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
    // [
    //   'babel-plugin-styled-components',
    //   {
    //     displayName: true,
    //     fileName: true,
    //   },
    // ],
    // '@babel/proposal-object-rest-spread',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: false }],
    // ['@babel/plugin-syntax-import-assertions'],
    isEnvReactHotReload && 'react-refresh/babel',
  ].filter(Boolean);

  function configModule() {
    if (env === 'esm' || env === 'es6') {
      return false;
    }
    // 默认会编译成node自身的commonjs
    return 'auto';
  }

  // Preset ordering is reversed (last to first).
  const presets = [
    [
      '@babel/preset-env',
      {
        modules: false,
        // modules: env === 'esm' ? false : 'auto',
        // modules: configModule(),
        // targets: 'defaults',
        // targets: '> 0.25%, not dead',
        useBuiltIns: 'usage',
        corejs: { version: '3.24', proposals: true },
        shippedProposals: true,
        debug: false,
      },
    ],
    [
      '@babel/preset-typescript',
      {
        // later: 支持其他框架的jsx
        isTSX: Boolean(isEnvReact),
        allExtensions: true,
        onlyRemoveTypeImports: true,
        allowNamespaces: true,
        allowDeclareFields: true,
      },
    ],
    // isEnvReact &&
    [
      '@babel/preset-react',
      {
        development: env !== 'production',
        ...babelPresetReactConfig,
      },
    ],
    [
      '@linaria',
      {
        evaluate: true,
        displayName: true,
        babelOptions: {
          rootMode: 'upward',
          plugins: [
            '@babel/plugin-syntax-jsx',
            '@babel/plugin-proposal-class-properties',
            [
              // required for legacy desktop to parse the syntax
              '@babel/plugin-proposal-decorators',
              {
                decoratorsBeforeExport: true,
              },
            ],
          ],
          presets: [
            '@babel/preset-env',
            [
              '@babel/preset-typescript',
              {
                isTSX: true,
                allExtensions: true,
                onlyRemoveTypeImports: true,
                allowNamespaces: true,
                allowDeclareFields: true,
              },
            ],
            '@babel/preset-react',
            [
              '@linaria',
              {
                evaluate: true,
                displayName: true,
              },
            ],
          ],
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
