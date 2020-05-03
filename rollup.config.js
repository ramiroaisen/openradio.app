import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import config from 'sapper/config/rollup.js';
import pkg from './package.json';
import json from "rollup-plugin-json";

import rootImport from 'rollup-plugin-root-import';
const rootImportOptions = {
	root: `${__dirname}/src`,
	useEntry: 'prepend',
	extensions: '.js'
}

const {preprocess} = require('./svelte.config.js');

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const onwarn = (warning, onwarn) => (warning.code === 'CIRCULAR_DEPENDENCY' && /[/\\]@sapper[/\\]/.test(warning.message)) || onwarn(warning);
const dedupe = importee => importee === 'svelte' || importee.startsWith('svelte/');

export default {
	client: {
		input: config.client.input(),
		output: config.client.output(),
		plugins: [
			
			rootImport(rootImportOptions),

			json(),

			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),

			svelte({
				dev,
				hydratable: true,
				emitCss: true,
				// added
				preprocess
			}),

			//typescript(),

			resolve({
				browser: true,
				dedupe
			}),

			commonjs(),

			legacy && babel({
				extensions: ['.js', '.mjs', '.html', '.svelte'],
				runtimeHelpers: true,
				exclude: ['node_modules/@babel/**'],
				presets: [
					['@babel/preset-env', {
						targets: '> 0.25%, not dead'
					}]
				],
				plugins: [
					'@babel/plugin-syntax-dynamic-import',
					['@babel/plugin-transform-runtime', {
						useESModules: true
					}]
				]
			}),

			!dev && terser({
				module: true
			})
		],

		onwarn,
	},

	server: {
		input: config.server.input(),
		output: config.server.output(),
		plugins: [

			rootImport(rootImportOptions),

			json(),

			replace({
				'process.browser': false,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			
			//typescript(),

			svelte({
				generate: 'ssr',
				dev,
				// added
				preprocess
			}),
			resolve({
				dedupe
			}),
			commonjs()
		],
		// Object.keys(pkg.dependencies)
		external: ["systeminformation"].concat(
			require('module').builtinModules || Object.keys(process.binding('natives'))
		),

		onwarn,
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		plugins: [
			resolve(),
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			commonjs(),
			!dev && terser()
		],

		onwarn,
	}
};
