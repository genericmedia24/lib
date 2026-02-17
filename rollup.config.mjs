import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import transformCss from 'css-simple-minifier'
import del from 'rollup-plugin-delete'
import html from 'rollup-plugin-html'
import css from 'rollup-plugin-import-css'

const modules = [
  'commander',
  'datetime',
  'delegator',
  'dialog',
  'fetch',
  'history',
  'menu',
  'nav',
  'notification',
  'observer',
  'preset',
  'scrollbar',
  'select',
  'sheet',
  'state',
  'tab',
  'trap',
]

export default {
  input: {
    index: 'src/index.ts',
    ...Object.fromEntries(modules.map((m) => [
      `${m}/index`,
      `src/${m}/index.ts`,
    ])),
  },
  onwarn(message, warn) {
    if (message.code === 'CIRCULAR_DEPENDENCY') {
      return
    }

    warn(message)
  },
  output: {
    chunkFileNames: 'chunks/[name]-[hash].js',
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    del({
      runOnce: true,
      targets: 'dist',
    }),
    css({
      transform: transformCss,
    }),
    html({
      htmlMinifierOptions: {
        collapseWhitespace: true,
        conservativeCollapse: false,
      },
    }),
    json(),
    commonjs(),
    nodeResolve(),
    typescript(),
    terser(),
  ],
}
