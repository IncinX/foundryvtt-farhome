export default {
  preset: 'rollup-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  roots: ['src'],
};
