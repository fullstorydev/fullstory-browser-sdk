import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' assert { type: 'json' };

export default [
  {
    input: 'src/index.ts',
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
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
];
