/**
 * Creates a new callback function to pass to the parse function.
 *
 * The new callback function will handle the first row as a header and transform all subsequent rows into an object with properties names provided by the header.
 *
 * See [the guide](../../docs/guides/dsv.md) for more information.
 *
 * @example
 * ```javascript
 * const string = `a,b,c\n1,2,3\n`
 *
 * parseDsvString(string, parseDsvRowToObject((object) => {
 *   console.log(object.a === '1') // true
 * }))
 * ```
 *
 * @param rowCallback the callback function that accepts a row of values
 */
export function parseDsvRowToObject<ObjectType = Record<string, string>>(rowCallback: (object: ObjectType) => void): (row: string[]) => void {
  let toObject: ((row: string[]) => ObjectType) | undefined = undefined

  return (row): void => {
    if (toObject === undefined) {
      let objectBody = ''

      for (let i = 0; i < row.length; i += 1) {
        objectBody += `"${row[i]}":row[${i}],`
      }

      // eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
      toObject = new Function('row', `return {${objectBody}}`) as (row: string[]) => ObjectType
    } else {
      rowCallback(toObject(row))
    }
  }
}
