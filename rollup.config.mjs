import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' with { type: 'json' };

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'esm' },
    ],
    external: ['@fullstory/snippet'],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
];
