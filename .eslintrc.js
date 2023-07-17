module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb',
  overrides: [
    {
      files: ['*.js'],
      rules: {
        camelcase: ['error', {
          properties: 'never',
          allow: ['user_id'],
        }],
      },
    },
    {
      files: ['*.js'],
      rules: {
        'react/jsx-one-expression-per-line': ['off'],
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'react/jsx-filename-extension': ['error', { extensions: ['.js'] }],
    'linebreak-style': ['error', 'windows'],
  },
};
