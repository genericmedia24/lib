export interface ParseDsvState {
  /**
   * The index of the current column.
   */
  columnIndex?: number

  /**
   * The current row that is being parsed.
   */
  row?: string[]

  /**
   * The template for each row.
   */
  rowTemplate?: string[]

  /**
   * The string that is being parsed.
   */
  string: string
}
