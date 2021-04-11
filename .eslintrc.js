module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true
  },
  globals: {
    $: true,
    document: true,
    window: true
  },
  extends: ['eslint:recommended', 'airbnb-base'],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    indent: [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    quotes: [
      'error',
      'single'
    ],
    semi: [
      'error',
      'always'
    ],
    'comma-dangle': 'off',
    'consistent-return': 'warn',
    curly: 'warn',
    'dot-notation': 'warn',
    'func-names': 'off',
    'global-require': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'keyword-spacing': 'off',
    'no-debugger': 'off',
    'no-floating-decimal': 'off',
    'no-param-reassign': [
      'warn',
      {
        props: false
      }
    ],
    'no-plusplus': 'off',
    'no-tabs': 'off',
    'no-underscore-dangle': 'off',
    'no-var': 'warn',
    'object-shorthand': 'off',
    'one-var': 'off',
    'padded-blocks': 'off',
    'prefer-arrow-callback': 'warn',
    'prefer-template': 'warn',
    'quote-props': 'warn',
    'space-before-blocks': 'off',
    'space-before-function-paren': 'off',
    'space-in-parens': 'off',
    'vars-on-top': 'off'
  }
};
