let wcwidth = require("wcwidth")
let breakword = require("breakword")


const defaults = () => {
  let obj = {}

  obj.breakword = false
  obj.calculateSpaceRemaining = function(obj) {
    return Math.max(obj.lineLength - obj.spacesUsed - obj.paddingLeft - obj.paddingRight, 0)
  } // function to set starting line length
  obj.currentLine = 0 // index of current line in 'lines[]'
  obj.input = [] // input string split by whitespace
  obj.lines = [
    []
  ] // assume at least one line
  obj.minWidth = 2 // fallback to if width set too narrow
  obj.paddingLeft = 0
  obj.paddingRight = 0
  obj.errorChar = "�"
  obj.returnFormat = "string" // or 'array'
  obj.skipPadding = false // set to true when padding set too wide for line length
  obj.spacesUsed = 0 // spaces used so far on current line
  obj.splitAt = [" ", "\t"]
  obj.trim = true
  obj.width = 10
  obj.words = []

  return obj
}


const validateInput = (text, options) => {

  // text validation
  let wText = text.toString()


  // options validation
  let wConfig = Object.assign({}, defaults(), options || {})

  if (wConfig.errorChar) {
    // only allow a single errorChar
    wConfig.errorChar = wConfig.errorChar.split("")[0]

    // errorChar must not be wide character
    if (wcwidth(wConfig.errorChar) > 1)
      throw new Error(`Error character cannot be a wide character (${wConfig.errorChar})`)
  }

  // make sure correct sign on padding
  wConfig.paddingLeft = Math.abs(wConfig.paddingLeft)
  wConfig.paddingRight = Math.abs(wConfig.paddingRight)

  wConfig.lineLength = wConfig.width
    - wConfig.paddingLeft
    - wConfig.paddingRight

  if(wConfig.lineLength < wConfig.minWidth) {
    // skip padding if lineLength too narrow
    wConfig.skipPadding = true
    wConfig.lineLength = wConfig.minWidth
  }

  // to trim or not to trim...
  if(wConfig.trim) {
    wText = wText.trim()
  }

  return { wText, wConfig }
}


const wrap = (text, options) => {

  let { wText, wConfig } = validateInput(text, options)

  // array of characters split by whitespace and/or tabs
  let wordArray = []

  if(!wConfig.breakword) {
    // break string into words
    if(wConfig.splitAt.indexOf("\t")!==-1) {
      // split at both spaces and tabs
      wordArray = wText.split(/ |\t/i)
    } else{
      // split at whitespace
      wordArray = wText.split(" ")
    }
  } else {
    // do not break string into words
    wordArray = [wText]
  }

  // remove empty array elements
  wConfig.words = wordArray.filter(val => {
    if (val.length > 0) {
      return true
    }
  })

  let spaceRemaining, splitIndex, word

  while(wConfig.words.length > 0) {
    spaceRemaining = wConfig.calculateSpaceRemaining(wConfig)
    word = wConfig.words.shift()
    let wordLength = wcwidth(word)

    switch(true) {

      // too long for an empty line and is a single character
      case(wConfig.lineLength < wordLength && [...word].length === 1):
        wConfig.words.unshift(wConfig.errorChar)
        break

        // too long for an empty line, must be broken between 2 lines
      case(wConfig.lineLength < wordLength):
        // break it, then re-insert its parts into wConfig.words
        // so can loop back to re-handle each word
        splitIndex = breakword(word, wConfig.lineLength)
        let splitWord = [...word]
        wConfig.words.unshift(splitWord.slice(0, splitIndex + 1).join(""))
        wConfig.words.splice(1, 0, splitWord.slice(splitIndex + 1).join("")) // +1 for substr fn
        break

      // not enough space remaining in line, must be wrapped to next line
      case(spaceRemaining < wordLength):
        // add a new line to our array of lines
        wConfig.lines.push([])
        // note carriage to new line in counter
        wConfig.currentLine++
        // reset the spacesUsed to 0
        wConfig.spacesUsed = 0
        /* falls through */

      // fits on current line
      // eslint-disable-next-line
      default:
        // add word to line
        wConfig.lines[wConfig.currentLine].push(word)
        // reduce space remaining (add a space between words)
        wConfig.spacesUsed += wordLength + 1
    }
  }

  if(wConfig.returnFormat === "array") {
    return wConfig.lines
  } else {
    let lines = wConfig.lines.map(function(line) {
      // restore spaces to line
      line = line.join(" ")
      // add padding to ends of line
      if(!wConfig.skipPadding) {
        line = Array(wConfig.paddingLeft + 1).join(" ")
          + line
          + Array(wConfig.paddingRight + 1).join(" ")
      }
      return line
    })
    // return as string
    return lines.join("\n")
  }
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
