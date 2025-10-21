import resolve from '@rollup/plugin-node-resolve';

export default [
  // CommonJS (for Node) and ES module (for bundlers) build
  {
    input: 'src/UiScaler.js',
    output: [
      {
        file: 'dist/UiScaler.js',
        format: 'cjs',
        exports: 'named',
        sourcemap: true
      },
      {
        file: 'dist/UiScaler.esm.js',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      resolve()
    ]
  }
];
