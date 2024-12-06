export default {
  coverageOutputPath: './docs/site/docs-coverage.json',
  coverageOutputType: 'json',
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
  favicon: './docs/theme/logo.ico',
  headings: {
    readme: false,
  },
  jsDocCompatibility: {
    exampleTag: false,
  },
  markdownLinkExternal: false,
  navigationLinks: {
    GitHub: 'https://github.com/genericmedia24/lib',
  },
  out: './docs/site',
  plugin: [
    'typedoc-plugin-coverage',
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
