module.exports = function(api) {
  api.cache(true);

  return {
    presets: ['@babel/env', '@babel/react', '@babel/typescript'],

    plugins: [
      ['@babel/proposal-decorators', { legacy: true }],
      ['@babel/proposal-class-properties', { loose: true }],
      '@babel/proposal-object-rest-spread',
      '@babel/syntax-dynamic-import',
      'react-hot-loader/babel',
      'react-loadable/babel',
      'styled-components',
    ],

    ignore: ['**/__tests__', '**/*.spec.*', '**/*.test.*'],
  };
};
