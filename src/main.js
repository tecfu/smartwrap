'use strict'

const stripAnsi = require('strip-ansi')
const wcwidth = require('wcwidth')

const ANSIPattern = [
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
].join('|')
const ANSIRegex = new RegExp(ANSIPattern, 'g')

const defaults = () => ({
  breakword: false,
  minWidth: 2, // fallback if width set too narrow
  paddingLeft: 0,
  paddingRight: 0,
  errorChar: '�',
  returnFormat: 'string', // or 'array' (reserved)
  skipPadding: false, // set true when padding is too wide for line length
  splitAt: [' ', '\t'],
  trim: true,
  width: 10
})

const calculateSpaceRemaining = (lineLength, spacesUsed, config) =>
  Math.max(lineLength - spacesUsed - config.paddingLeft - config.paddingRight, 0)

const validateInput = (text, options) => {
  const config = Object.assign({}, defaults(), options || {})

  if (config.errorChar) {
    // only allow a single errorChar
    config.errorChar = String(config.errorChar).charAt(0)

    // errorChar must not be a wide character
    if (wcwidth(config.errorChar) > 1) {
      throw new Error(`Error character cannot be a wide character (${config.errorChar})`)
    }
  }

  // ensure non-negative padding
  config.paddingLeft = Math.abs(config.paddingLeft)
  config.paddingRight = Math.abs(config.paddingRight)

  let lineLength = config.width - config.paddingLeft - config.paddingRight

  if (lineLength < config.minWidth) {
    // skip padding if lineLength too narrow
    config.skipPadding = true
    lineLength = config.minWidth
  }

  if (config.trim) {
    text = text.trim()
  }

  return { text, config, lineLength }
}

const wrap = (input, options) => {
  const { text, config, lineLength } = validateInput(input, options)

  let words = []

  if (!config.breakword) {
    if (config.splitAt.indexOf('\t') !== -1) {
      words = text.split(/ |\t/)
    } else {
      words = text.split(' ')
    }
  } else {
    words = [text]
  }

  // remove empty array elements
  words = words.filter(val => val.length > 0)

  const lines = [[]]
  let currentLine = 0
  let spacesUsed = 0

  while (words.length > 0) {
    const spaceRemaining = calculateSpaceRemaining(lineLength, spacesUsed, config)
    const word = words.shift()
    const wordLength = wcwidth(word)

    switch (true) {
      // too long for an empty line and is a single character
      case lineLength < wordLength && [...word].length === 1:
        words.unshift(config.errorChar)
        break

      // too long for an empty line, must be broken across lines
      case lineLength < wordLength: {
        // Break the whole word into line-sized chunks in a single pass.
        // Re-queuing just the tail means the remainder is spread and measured
        // again on every iteration, which is quadratic for a long word (a URL,
        // token or base64 blob), so a ~125KB word takes tens of seconds.
        const chunks = []
        let chunk = ''
        let chunkWidth = 0

        for (const character of word) {
          const characterWidth = wcwidth(character)
          if (chunk !== '' && chunkWidth + characterWidth > lineLength) {
            chunks.push(chunk)
            chunk = ''
            chunkWidth = 0
          }
          chunk += character
          chunkWidth += characterWidth
        }
        if (chunk !== '') {
          chunks.push(chunk)
        }

        // concat rather than unshift(...chunks): a long word can produce more
        // chunks than the argument limit allows to be spread.
        words = chunks.concat(words)
        break
      }

      // not enough space remaining in line, wrap to next line
      case spaceRemaining < wordLength:
        lines.push([])
        currentLine++
        spacesUsed = 0
        // fall through

      // fits on current line
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
          ' '.repeat(config.paddingLeft) +
          out +
          ' '.repeat(config.paddingRight)
      }
      return out
    })
    .join('\n')
}

const splitAnsiInput = (text) => {
  const matches = []
  const textArr = [...text]
  const textLength = textArr.length

  let result
  while ((result = ANSIRegex.exec(text)) !== null) {
    matches.push({
      start: result.index,
      end: result.index + result[0].length,
      match: result[0],
      length: result[0].length
    })
  }

  if (matches.length < 1) return [] // no ANSI escapes

  // add start and end positions for non-matches
  let expanded = matches.reduce((prev, curr) => {
    const prevEnd = prev[prev.length - 1]
    if (prevEnd.end < curr.start) {
      prev.push({
        start: prevEnd.end,
        end: curr.start,
        length: curr.start - prevEnd.end,
        expand: true
      }, curr)
    } else {
      prev.push(curr)
    }
    return prev
  }, [{ start: 0, end: 0 }]).slice(1)

  // add trailing match if necessary
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

const restoreANSI = (savedArr, processedArr) => {
  return processedArr
    .map(char => {
      let result
      if (char === '\n') {
        result = [char]
      } else {
        const splicePoint = savedArr.findIndex(element => element === char) + 1
        result = savedArr.splice(0, splicePoint)
      }

      // add following consecutive closing tags in case linebreak inserted next
      const ANSIClosePattern = '^\\x1b\\[([0-9]+)*m'
      const ANSICloseRegex = new RegExp(ANSIClosePattern) // eslint-disable-line no-control-regex
      const closeCodes = ['0', '21', '22', '23', '24', '25', '27', '28', '29', '39', '49', '54', '55']

      let match
      while (savedArr.length && (match = savedArr[0].match(ANSICloseRegex))) {
        if (!closeCodes.includes(match[1])) break
        result.push(savedArr.shift())
      }

      return result.join('')
    })
    .concat(savedArr)
}

module.exports = (input, options) => {
  // process each existing line separately to respect existing line breaks
  const processedLines = String(input).split('\n').map(string => {
    // save input ANSI escape codes to be restored later
    const savedANSI = splitAnsiInput(string)

    // strip ANSI
    string = stripAnsi(string)

    // add newlines to string
    string = wrap(string, options)

    // convert into array of characters
    let charArr = [...string]

    // restore input ANSI escape codes
    if (savedANSI.length > 0) {
      charArr = restoreANSI(savedANSI, charArr)
    }

    // convert array of single characters into array of lines
    return charArr.join('').split('\n')
  })

  return processedLines.flat(2).join('\n')
}
