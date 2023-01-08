module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: 'node',
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
  ],
  transform: {
    '^.+\\.[tj]sx?$': [ '@swc/jest' ],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  "moduleDirectories": ["node_modules", "src"],
  "testPathIgnorePatterns": ["lib/", "node_modules/"]
}

