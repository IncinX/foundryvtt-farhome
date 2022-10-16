const { nodeResolve } = require('@rollup/plugin-node-resolve');

module.exports = () => ({
  input: 'src/module/farhome.mjs',
  output: {
    dir: 'dist/module',
    format: 'es',
    sourcemap: true,
  },
  plugins: [nodeResolve()],
});
