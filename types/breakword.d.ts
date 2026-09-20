declare module 'breakword' {
  function breakword(input: string, breakAtLength: number): number
  namespace breakword {
    /** Terminal cells (0, 1 or 2) occupied by a single Unicode code point. */
    function width(char: string): number
  }
  export = breakword
}
