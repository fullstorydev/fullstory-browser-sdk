import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';

export default [
  {
    input: 'build/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'esm' },
    ],
    external: ['@fullstory/snippet'],
    plugins: [
      babel({
        exclude: ['node_modules/**'],
        babelHelpers: 'bundled',
      }),
      copy({
        targets: [{ src: 'build/index.d.ts', dest: 'dist' }],
      }),
    ],
  },
];
