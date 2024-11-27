import type { LoggingFunction, RollupLog, RollupOptions } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const specs = [
  {
    input: 'src/browser.ts',
    output: 'dist/browser',
  },
  {
    input: 'src/node.ts',
    output: 'dist/node',
  },
  {
    input: 'src/commander/index.ts',
    output: 'dist/commander',
  },
  {
    input: 'src/commands/index.ts',
    output: 'dist/commands',
  },
  {
    input: 'src/dsv/index.ts',
    output: 'dist/dsv',
  },
  {
    input: 'src/elements/index.ts',
    output: 'dist/elements',
  },
  {
    input: 'src/requester/index.ts',
    output: 'dist/requester',
  },
  {
    input: 'src/scroller/index.ts',
    output: 'dist/scroller',
  },
  {
    input: 'src/state/index.ts',
    output: 'dist/state',
  },
  {
    input: 'src/util/index.ts',
    output: 'dist/util',
  },
]

const options: RollupOptions[] = specs.map((spec) => {
  return {
    input: spec.input,
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
