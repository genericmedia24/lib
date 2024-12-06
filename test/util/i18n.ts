import { describe, it } from 'node:test'
import { I18n } from '../../src/util/i18n.js'

describe('I18n', () => {
  const options = {
    locale: 'nl-NL',
    locales: {
      'nl-NL': {
        message: 'Hallo %(name)s',
      },
    },
    timeZone: 'Europe/Amsterdam',
  }

  it('should create singleton', (test) => {
    const i18n1 = I18n.create(options)
    const i18n2 = I18n.create(options)

    test.assert.equal(i18n1, i18n2)
  })

  it('should instantiate with default options', (test) => {
    const i18n = new I18n()

    test.assert.equal(JSON.stringify(i18n.locales), '{}')
    test.assert.equal(i18n.locale, 'nl-NL')
    test.assert.equal(i18n.timeZone, 'Europe/Amsterdam')
  })

  it('should format date', (test) => {
    const i18n = new I18n(options)

    const string = i18n.formatDate(new Date('2024-07-01'), {
      dateStyle: 'short',
    })

    test.assert.equal(string, '01-07-2024')
  })

  it('should format number', (test) => {
    const i18n = new I18n(options)

    const string = i18n.formatNumber(8080.80, {
      minimumFractionDigits: 2,
    })

    test.assert.equal(string, '8.080,80')
  })

  it('should format string from locale', (test) => {
    const i18n = new I18n(options)

    const string = i18n.formatString('message', {
      name: 'Wereld',
    })

    test.assert.equal(string, 'Hallo Wereld')
  })

  it('should format string as-is', (test) => {
    const i18n = new I18n(options)

    const string = i18n.formatString('Hallo %(name)s', {
      name: 'Wereld',
    })

    test.assert.equal(string, 'Hallo Wereld')
  })
})
