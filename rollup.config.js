import babel from 'rollup-plugin-babel';
import pkg from './package.json';
import copy from 'rollup-plugin-copy';

export default [	
	{
		input: 'src/index.js',
		output: [
			{ file: pkg.main, format: 'esm' }
		],
		plugins: [
			babel({
				exclude: ['node_modules/**']
			}),
			copy({
				targets: [
					{ src: 'src/index.d.ts', dest: 'dist' },
				]
			}),
		]
	}
];
