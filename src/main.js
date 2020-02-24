const wcwidth = require("wcwidth")
const breakword = require("breakword")

const defaults = () => {
  let obj = {}

  obj.breakword = false
  obj.input = [] // input string split by whitespace
  obj.minWidth = 2 // fallback to if width set too narrow
  obj.paddingLeft = 0
  obj.paddingRight = 0
  obj.errorChar = "�"
  obj.returnFormat = "string" // or 'array'
  obj.skipPadding = false // set to true when padding set too wide for line length
  obj.splitAt = [" ", "\t"]
  obj.trim = true
  obj.width = 10

  return obj
}


const calculateSpaceRemaining = function(lineLength, spacesUsed, config) {
  return Math.max(lineLength - spacesUsed - config.paddingLeft - config.paddingRight, 0)
} // function to set starting line length


const validateInput = (text, options) => {

  // options validation
  let config = Object.assign({}, defaults(), options || {})

  if (config.errorChar) {
    // only allow a single errorChar
    config.errorChar = config.errorChar.split("")[0]

    // errorChar must not be wide character
    if (wcwidth(config.errorChar) > 1)
      throw new Error(`Error character cannot be a wide character (${config.errorChar})`)
  }

  // make sure correct sign on padding
  config.paddingLeft = Math.abs(config.paddingLeft)
  config.paddingRight = Math.abs(config.paddingRight)

  let lineLength = config.width
    - config.paddingLeft
    - config.paddingRight

  if(lineLength < config.minWidth) {
    // skip padding if lineLength too narrow
    config.skipPadding = true
    lineLength = config.minWidth
  }

  // to trim or not to trim...
  if(config.trim) {
    text = text.trim()
  }

  return { text, config, lineLength }
}


const wrap = (input, options) => {

  let { text, config, lineLength } = validateInput(input, options)

  // array of characters split by whitespace and/or tabs
  let words = []

  if(!config.breakword) {
    // break string into words
    if(config.splitAt.indexOf("\t")!==-1) {
      // split at both spaces and tabs
      words = text.split(/ |\t/i)
    } else{
      // split at whitespace
      words = text.split(" ")
    }
  } else {
    // do not break string into words
    words = [text]
  }

  // remove empty array elements
  words = words.filter(val => {
    if (val.length > 0) {
      return true
    }
  })

  // assume at least one line
  let lines = [
    []
  ]

  let spaceRemaining, splitIndex, word
  let currentLine = 0 // index of current line in 'lines[]'
  let spacesUsed = 0 // spaces used so far on current line

  while(words.length > 0) {
    spaceRemaining = calculateSpaceRemaining(lineLength, spacesUsed, config)
    word = words.shift()
    let wordLength = wcwidth(word)

    switch(true) {

      // too long for an empty line and is a single character
      case(lineLength < wordLength && [...word].length === 1):
        words.unshift(config.errorChar)
        break

        // too long for an empty line, must be broken between 2 lines
      case(lineLength < wordLength):
        // break it, then re-insert its parts into words
        // so can loop back to re-handle each word
        splitIndex = breakword(word, lineLength)
        let splitWord = [...word]
        words.unshift(splitWord.slice(0, splitIndex + 1).join(""))
        words.splice(1, 0, splitWord.slice(splitIndex + 1).join("")) // +1 for substr fn
        break

      // not enough space remaining in line, must be wrapped to next line
      case(spaceRemaining < wordLength):
        // add a new line to our array of lines
        lines.push([])
        // note carriage to new line in counter
        currentLine++
        // reset the spacesUsed to 0
        spacesUsed = 0
        /* falls through */

      // fits on current line
      // eslint-disable-next-line
      default:
        // add word to line
        lines[currentLine].push(word)
        // reduce space remaining (add a space between words)
        spacesUsed += wordLength + 1
    }
  }


  lines = lines.map( line => {
    // restore spaces to line
    line = line.join(" ")
    // add padding to ends of line
    if(!config.skipPadding) {
      line = Array(config.paddingLeft + 1).join(" ")
        + line
        + Array(config.paddingRight + 1).join(" ")
    }
    return line
  })


  return lines.join("\n")
}


module.exports = (input, options) => {
  // in case a template literal was passed that has newling characters,
  // split string by newlines and process each resulting string
  const str = input.toString()
  const strArr = str.split("\n").map( string => {
    return wrap(string, options)
  })

  return strArr.join("\n")
}
