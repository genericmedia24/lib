import type { LoggingFunction, RollupLog, RollupOptions } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const options: RollupOptions[] = [{
  input: 'src/default.ts',
  onwarn: (warning: RollupLog, rollupWarn: LoggingFunction): void => {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      rollupWarn(warning)
    }
  },
  output: [{
    dir: '.',
    entryFileNames: 'dist/default.mjs',
    format: 'esm',
  }],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript(),
  ],
}, {
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
  }],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      declaration: true,
      declarationDir: 'dist',
      include: [
        'src/**/*.ts',
      ],
    }),
  ],
}]

export default options
