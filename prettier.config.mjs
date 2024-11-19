export default {
  attributeGroups: ['$CODE_GUIDE'],
  htmlWhitespaceSensitivity: 'ignore',
  plugins: [
    'prettier-plugin-embed',
    'prettier-plugin-multiline-arrays',
    'prettier-plugin-sql',
    '@awmottaz/prettier-plugin-void-html',
    'prettier-plugin-organize-attributes',
  ],
  printWidth: 9999,
  semi: false,
  singleAttributePerLine: true,
  singleQuote: true,
}
