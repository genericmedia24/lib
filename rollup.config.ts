import type { LoggingFunction, RollupLog, RollupOptions } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const options: RollupOptions = {
  input: 'src/index.ts',
  onwarn: (warning: RollupLog, rollupWarn: LoggingFunction): void => {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      rollupWarn(warning)
    }
  },
  output: [{
    dir: '.',
    entryFileNames: 'dist/index.mjs',
    format: 'esm',
  }, {
    dir: '.',
    entryFileNames: 'dist/index.js',
    format: 'umd',
    name: 'gm',
  }],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      declaration: true,
      declarationDir: 'types',
      include: [
        'src/**/*.ts',
      ],
    }),
  ],
}

export default options
