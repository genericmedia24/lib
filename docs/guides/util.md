# Util

This library contains a few basic utility functions that are already included in many other libraries. But so often these libraries require (a lot of) extra code to perform a simple function and most of the time they are not useful in the context of TypeScript.

## Custom Error

It is useful to be able to throw an error with some extra information on it, for example to instruct an application how to respond to a request.

The `event` property is useful in combination with custom commands.

```javascript
const cause = new Error('Operation failed')

const error = CustomError.from(cause, {
  code: 'err_operation_failed',
  data: {
    key: 'value',
  },
  event: 'failed',
  status: 500,
})

console.log(error.message === 'Operation failed') // true
console.log(error.code === 'err_operation_failed') // true
```

## I18n

Just a thin wrapper around `toLocaleString` functions. Makes it easier to set the locale of a user once and reuse this helper anywhere in an application.

Can be instantiated as a singleton in the browser. Well, anywhere, but it generally only makes sense in the browser.

```javascript
const i18n = new I18n({
  locale: 'nl-NL',
  locales: {
    'nl-NL': {
      message: 'Hallo %(name)s',
    },
  },
  timeZone: 'Europe/Amsterdam',
})

const date = i18n.formatDate(new Date('2024-07-01'), {
  dateStyle: 'short',
})

console.log(date === '01-07-2024') // true

const number = i18n.formatNumber(8080.8, {
  minimumFractionDigits: 2,
})

console.log(number === '8.080,80') // true

const string = i18n.formatString('message', {
  name: 'Wereld',
})

console.log(string === 'Hallo Wereld') // true
```

## Check array

```typescript
type Value = [1, 2]

const value = [1, 2]

const isValue = isArray<Value>(value, (checkValue) => {
  return checkValue[0] === 1 && checkValue[1] === 2
})

console.log(isValue) // true & TypeScript now knows that value is a Value
```

## Check object

```typescript
interface Value {
  a: 1
}

const value = { a: 1 }

const isValue = isObject<Value>(value, (checkValue) => {
  return checkValue.a === 1
})

console.log(isValue) // true & TypeScript now knows that value is a Value
```

## Check nil

```javascript
console.log(isNil(undefined)) // true
console.log(isNil('undefined')) // false
```

## Check primitive

```javascript
console.log(isPrimitive(123)) // true
console.log(isPrimitive({})) // false
```

## HTML template tag

Concatenates strings and encodes HTML entities (&<>'") in the values of the template. Also joins array values.

```javascript
const value = 'abc&123'
const string = html`<div>${value}</div>`

console.log(string === '<div>abc&#38;123</div>') // true
```

## SQL template tag

Concatenates strings. Also joins array values.

```javascript
const value = 123

// prettier-ignore
const query = sql`SELECT * FROM table WHERE value = ${value}`

console.log(query === 'SELECT * FROM table WHERE value = 123') // true
```
