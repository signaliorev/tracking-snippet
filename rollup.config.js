import { defineConfig } from 'rollup';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * (c) ${new Date().getFullYear()} signalio
 * Released under the ${pkg.license} License
 */`;

export default defineConfig({
  input: 'src/index.js',
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        __VERSION__: pkg.version,
      },
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    }),
  ],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      banner,
    },
    {
      file: pkg.module,
      format: 'esm',
      banner,
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'signalio',
      exports: 'named',
      banner,
    },
  ],
});
