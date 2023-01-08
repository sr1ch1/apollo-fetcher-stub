module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    "@typescript-eslint",
    "prettier",
    "import",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  overrides: [
    {
      files: ["*.test.js"],
      plugins: ["jest"],
      globals: {
        fastify: 'readonly'
      }
    }
  ],
  env: {
    "node": true,
    "commonjs": true,
    "amd": true,
    "jest/globals": true
  },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {'ts-ignore': 'allow-with-description',  minimumDescriptionLength: 10 },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }
    ]
  },
};
