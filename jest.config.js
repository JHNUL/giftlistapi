module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',  
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputName: 'test_report.xml',
      },
    ],
  ],
  testPathIgnorePatterns: ["<rootDir>/tests/util", "<rootDir>/node_modules/"],
  setupFiles: ["<rootDir>/tests/util/setupTests.ts"]
}
