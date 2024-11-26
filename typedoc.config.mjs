export default {
  customCss: [
    './docs/theme/styles.css',
  ],
  entryPoints: [
    './src/commander/index.ts',
    './src/commands/index.ts',
    './src/dsv/index.ts',
    './src/elements/index.ts',
    './src/requester/index.ts',
    './src/scroller/index.ts',
    './src/state/index.ts',
    './src/util/index.ts',
  ],
  out: './docs/site',
  plugin: [
    'typedoc-github-theme',
  ],
  projectDocuments: [
    './docs/guides/commander.md',
    './docs/guides/dsv.md',
    './docs/guides/scroller.md',
    './docs/guides/state.md',
  ],
  searchInDocuments: true,
  theme: 'typedoc-github-theme',
}
