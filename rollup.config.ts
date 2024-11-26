import type { LoggingFunction, RollupLog, RollupOptions } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const specs = [
  {
    input: 'src',
    output: 'dist/index',
  },
  {
    input: 'src/commander',
    output: 'dist/commander',
  },
  {
    input: 'src/commands',
    output: 'dist/commands',
  },
  {
    input: 'src/dsv',
    output: 'dist/dsv',
  },
  {
    input: 'src/elements',
    output: 'dist/elements',
  },
  {
    input: 'src/requester',
    output: 'dist/requester',
  },
  {
    input: 'src/scroller',
    output: 'dist/scroller',
  },
  {
    input: 'src/state',
    output: 'dist/state',
  },
  {
    input: 'src/util',
    output: 'dist/util',
  },
]

const options: RollupOptions[] = specs.map((spec) => {
  return {
    input: `${spec.input}/index.ts`,
    onwarn: (warning: RollupLog, rollupWarn: LoggingFunction): void => {
      if (warning.code !== 'CIRCULAR_DEPENDENCY') {
        rollupWarn(warning)
      }
    },
    output: [{
      dir: '.',
      entryFileNames: `${spec.output}.mjs`,
      format: 'esm',
    }, {
      dir: '.',
      entryFileNames: `${spec.output}.js`,
      format: 'umd',
      name: 'gm',
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
  }
})

export default options
