module.exports = {
  parser: 'babel-eslint',
  extends: 'airbnb',
  ecmaFeatures: {
    classes: true,
  },
  rules: {
    'react/jsx-filename-extension': ['error', { extensions: ['.js'] }],
    'linebreak-style': ['error', 'windows'],
  },
  overrides: [
    {
      files: ['MobAppAssingment/**/*.js', 'MobAppAssingment/Components/**/*.js'],
      rules: {
        'global-require': 'off',
      },
    },
  ],
};
