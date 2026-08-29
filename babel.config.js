// #genai: Babel config. babel-preset-expo injects the worklets plugin when
// react-native-worklets is installed; we still list it explicitly because the
// gluestack UniWind init expects it present after rewriting this file.
module.exports = function babelConfig(api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            // #genai: Keep @ → src so existing app imports resolve; gluestack
            // provider lives under src/components/ui.
            '@': './src',
            '@app': './app',
            '@assets': './assets',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
      'react-native-worklets/plugin',
    ],
  };
};
