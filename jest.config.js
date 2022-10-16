export default {
  preset: 'rollup-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  roots: ['src'],
  moduleFileExtensions: ['mjs', 'js'],
  testMatch: ['**/?(*.)test.?js'],
};
