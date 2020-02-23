"use strict"

let wcwidth = require("wcwidth")
let breakword = require("breakword")

function smartWrap(input, options) {
  // in case a template literal was passed that has newling characters,
  // split string by newlines and process each resulting string
  const str = input.toString()
  const strArr = str.split("\n").map( string => {
    return wrap(string, options)
  })

  return strArr.join("\n")
}

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

function wrap(text, options) {

  options = options || {}

  if (options.errorChar) {
    // only allow a single errorChar
    options.errorChar = options.errorChar.split("")[0]

    // errorChar must not be wide character
    if (wcwidth(options.errorChar) > 1)
      throw new Error(`Error character cannot be a wide character (${options.errorChar})`)
  }

  let wrapObj = Object.assign({}, defaults(), options)

  // make sure correct sign on padding
  wrapObj.paddingLeft = Math.abs(wrapObj.paddingLeft)
  wrapObj.paddingRight = Math.abs(wrapObj.paddingRight)

  wrapObj.lineLength = wrapObj.width
    - wrapObj.paddingLeft
    - wrapObj.paddingRight

  if(wrapObj.lineLength < wrapObj.minWidth) {
    // skip padding if lineLength too narrow
    wrapObj.skipPadding = true
    wrapObj.lineLength = wrapObj.minWidth
  }

  // to trim or not to trim...
  let modifiedText = text.toString()
  if(wrapObj.trim) {
    modifiedText = modifiedText.trim()
  }

  // array of characters split by whitespace and/or tabs
  let wordArray = []

  if(!wrapObj.breakword) {
    // break string into words
    if(wrapObj.splitAt.indexOf("\t")!==-1) {
      // split at both spaces and tabs
      wordArray = modifiedText.split(/ |\t/i)
    } else{
      // split at whitespace
      wordArray = modifiedText.split(" ")
    }
  } else {
    // do not break string into words
    wordArray = [modifiedText]
  }

  // remove empty array elements
  wrapObj.words = wordArray.filter(val => {
    if (val.length > 0) {
      return true
    }
  })

  let spaceRemaining, splitIndex, word

  while(wrapObj.words.length > 0) {
    spaceRemaining = wrapObj.calculateSpaceRemaining(wrapObj)
    word = wrapObj.words.shift()
    let wordLength = wcwidth(word)

    switch(true) {

      // too long for an empty line and is a single character
      case(wrapObj.lineLength < wordLength && [...word].length === 1):
        wrapObj.words.unshift(wrapObj.errorChar)
        break

        // too long for an empty line, must be broken between 2 lines
      case(wrapObj.lineLength < wordLength):
        // break it, then re-insert its parts into wrapObj.words
        // so can loop back to re-handle each word
        splitIndex = breakword(word, wrapObj.lineLength)
        let splitWord = [...word]
        wrapObj.words.unshift(splitWord.slice(0, splitIndex + 1).join(""))
        wrapObj.words.splice(1, 0, splitWord.slice(splitIndex + 1).join("")) // +1 for substr fn
        break

      // not enough space remaining in line, must be wrapped to next line
      case(spaceRemaining < wordLength):
        // add a new line to our array of lines
        wrapObj.lines.push([])
        // note carriage to new line in counter
        wrapObj.currentLine++
        // reset the spacesUsed to 0
        wrapObj.spacesUsed = 0
        /* falls through */

      // fits on current line
      // eslint-disable-next-line
      default:
        // add word to line
        wrapObj.lines[wrapObj.currentLine].push(word)
        // reduce space remaining (add a space between words)
        wrapObj.spacesUsed += wordLength + 1
    }
  }

  if(wrapObj.returnFormat === "array") {
    return wrapObj.lines
  } else {
    let lines = wrapObj.lines.map(function(line) {
      // restore spaces to line
      line = line.join(" ")
      // add padding to ends of line
      if(!wrapObj.skipPadding) {
        line = Array(wrapObj.paddingLeft + 1).join(" ")
          + line
          + Array(wrapObj.paddingRight + 1).join(" ")
      }
      return line
    })
    // return as string
    return lines.join("\n")
  }
}

module.exports = smartWrap
