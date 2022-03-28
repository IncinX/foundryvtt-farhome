module.exports = {
  parser: '@babel/eslint-parser',

  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    requireConfigFile: false,
  },

  env: {
    browser: true,
  },

  extends: ['plugin:jest/recommended', 'plugin:prettier/recommended'],

  plugins: ['jest'],

  rules: {
    // Specify any specific ESLint rules.
  },
};
