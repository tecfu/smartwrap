import breakword from 'breakword'
import stripAnsi from 'strip-ansi'
import wcwidth from 'wcwidth'

/** Options accepted by smartwrap. */
export interface SmartwrapOptions {
  /** Break words that exceed the remaining line width. Default: false */
  breakword?: boolean
  /** Minimum usable width (1 or 2). Default: 2 */
  minWidth?: 1 | 2
  /** Spaces prepended to each line. Default: 0 */
  paddingLeft?: number
  /** Spaces appended to each line. Default: 0 */
  paddingRight?: number
  /** Replacement when a single wide char cannot fit. Default: "�" */
  errorChar?: string
  /** Reserved. Default: "string" */
  returnFormat?: 'string' | 'array'
  /** Characters that split words. Default: [" ", "\t"] */
  splitAt?: string[]
  /** Trim leading/trailing whitespace from input. Default: true */
  trim?: boolean
  /** Target line width in terminal columns. Default: 10 */
  width?: number
}

interface Config {
  breakword: boolean
  minWidth: number
  paddingLeft: number
  paddingRight: number
  errorChar: string
  returnFormat: 'string' | 'array'
  skipPadding: boolean
  splitAt: string[]
  trim: boolean
  width: number
}

interface AnsiMatch {
  start: number
  end: number
  match?: string
  length?: number
  expand?: boolean
}

const ANSIPattern = [
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
].join('|')
const ANSIRegex = new RegExp(ANSIPattern, 'g')

const defaults = (): Config => ({
  breakword: false,
  minWidth: 2,
  paddingLeft: 0,
  paddingRight: 0,
  errorChar: '�',
  returnFormat: 'string',
  skipPadding: false,
  splitAt: [' ', '\t'],
  trim: true,
  width: 10
})

const calculateSpaceRemaining = (
  lineLength: number,
  spacesUsed: number,
  config: Config
): number =>
  Math.max(lineLength - spacesUsed - config.paddingLeft - config.paddingRight, 0)

const validateInput = (
  text: string,
  options?: SmartwrapOptions
): { text: string; config: Config; lineLength: number } => {
  const config: Config = Object.assign({}, defaults(), options || {})

  if (config.errorChar) {
    config.errorChar = String(config.errorChar).charAt(0)
    if (wcwidth(config.errorChar) > 1) {
      throw new Error(
        `Error character cannot be a wide character (${config.errorChar})`
      )
    }
  }

  config.paddingLeft = Math.abs(config.paddingLeft)
  config.paddingRight = Math.abs(config.paddingRight)

  let lineLength = config.width - config.paddingLeft - config.paddingRight

  if (lineLength < config.minWidth) {
    config.skipPadding = true
    lineLength = config.minWidth
  }

  if (config.trim) {
    text = text.trim()
  }

  return { text, config, lineLength }
}

const wrap = (input: string, options?: SmartwrapOptions): string => {
  const { text, config, lineLength } = validateInput(input, options)

  let words: string[]
  if (!config.breakword) {
    if (config.splitAt.indexOf('\t') !== -1) {
      words = text.split(/ |\t/)
    } else {
      words = text.split(' ')
    }
  } else {
    words = [text]
  }

  words = words.filter(val => val.length > 0)

  const lines: string[][] = [[]]
  let currentLine = 0
  let spacesUsed = 0

  while (words.length > 0) {
    const spaceRemaining = calculateSpaceRemaining(lineLength, spacesUsed, config)
    const word = words.shift() as string
    const wordLength = wcwidth(word)

    switch (true) {
      case lineLength < wordLength && [...word].length === 1:
        words.unshift(config.errorChar)
        break

      case lineLength < wordLength: {
        const splitIndex = breakword(word, lineLength)
        const splitWord = [...word]
        words.unshift(splitWord.slice(0, splitIndex + 1).join(''))
        words.splice(1, 0, splitWord.slice(splitIndex + 1).join(''))
        break
      }

      case spaceRemaining < wordLength:
        lines.push([])
        currentLine++
        spacesUsed = 0
      // fall through

      default:
        lines[currentLine].push(word)
        spacesUsed += wordLength + 1
    }
  }

  return lines
    .map(line => {
      let out = line.join(' ')
      if (!config.skipPadding) {
        out =
          ' '.repeat(config.paddingLeft) + out + ' '.repeat(config.paddingRight)
      }
      return out
    })
    .join('\n')
}

const splitAnsiInput = (text: string): string[] => {
  const matches: AnsiMatch[] = []
  const textArr = [...text]
  const textLength = textArr.length

  let result: RegExpExecArray | null
  while ((result = ANSIRegex.exec(text)) !== null) {
    matches.push({
      start: result.index,
      end: result.index + result[0].length,
      match: result[0],
      length: result[0].length
    })
  }

  if (matches.length < 1) return []

  let expanded = matches
    .reduce<AnsiMatch[]>(
      (prev, curr) => {
        const prevEnd = prev[prev.length - 1]
        if (prevEnd.end < curr.start) {
          prev.push(
            {
              start: prevEnd.end,
              end: curr.start,
              length: curr.start - prevEnd.end,
              expand: true
            },
            curr
          )
        } else {
          prev.push(curr)
        }
        return prev
      },
      [{ start: 0, end: 0 }]
    )
    .slice(1)

  const lastMatchEnd = expanded[expanded.length - 1].end
  if (lastMatchEnd < textLength) {
    expanded.push({
      start: lastMatchEnd,
      end: textLength,
      expand: true
    })
  }

  return expanded
    .map(match => {
      const value = text.substring(match.start, match.end)
      return match.expand ? [...value] : [value]
    })
    .flat(2)
}

const restoreANSI = (savedArr: string[], processedArr: string[]): string[] => {
  return processedArr
    .map(char => {
      let result: string[]
      if (char === '\n') {
        result = [char]
      } else {
        const splicePoint = savedArr.findIndex(element => element === char) + 1
        result = savedArr.splice(0, splicePoint)
      }

      const ANSIClosePattern = '^\\x1b\\[([0-9]+)*m'
      // eslint-disable-next-line no-control-regex
      const ANSICloseRegex = new RegExp(ANSIClosePattern)
      const closeCodes = [
        '0',
        '21',
        '22',
        '23',
        '24',
        '25',
        '27',
        '28',
        '29',
        '39',
        '49',
        '54',
        '55'
      ]

      let match: RegExpMatchArray | null
      while (savedArr.length && (match = savedArr[0].match(ANSICloseRegex))) {
        if (!closeCodes.includes(match[1])) break
        result.push(savedArr.shift() as string)
      }

      return result.join('')
    })
    .concat(savedArr)
}

/**
 * Wrap `input` to the given visual width, preserving ANSI codes and
 * respecting wide characters / emoji via wcwidth.
 */
function smartwrap(
  input: string | number,
  options?: SmartwrapOptions
): string {
  const processedLines = String(input)
    .split('\n')
    .map(string => {
      const savedANSI = splitAnsiInput(string)
      string = stripAnsi(string)
      string = wrap(string, options)
      let charArr = [...string]
      if (savedANSI.length > 0) {
        charArr = restoreANSI(savedANSI, charArr)
      }
      return charArr.join('').split('\n')
    })

  return processedLines.flat(2).join('\n')
}

export default smartwrap
export { smartwrap }
