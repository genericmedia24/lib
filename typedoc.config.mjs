export default {
  alwaysCreateEntryPointModule: false,
  customCss: [
    './docs/theme/styles.css',
  ],
  entryPoints: [
    './src/commands/index.ts',
    './src/elements/index.ts',
    './src/helpers/index.ts',
  ],
  out: './docs/site',
  plugin: [
    'typedoc-github-theme',
  ],
  projectDocuments: [
    './docs/guides/custom-commands.md',
    './docs/guides/dsv.md',
    './docs/guides/scroller.md',
    './docs/guides/util.md',
  ],
  searchInDocuments: true,
  theme: 'typedoc-github-theme',
}
