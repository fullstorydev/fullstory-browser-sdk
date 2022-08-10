import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'esm' },
    ],
    plugins: [
      nodeResolve(),
      babel({
        exclude: ['node_modules/**'],
        babelHelpers: 'bundled',
      }),
      copy({
        targets: [{ src: 'src/index.d.ts', dest: 'dist' }],
      }),
      terser({
        mangle: false,
        compress: {
          defaults: false,
          dead_code: true,
        },
      }),
    ],
  },
];
