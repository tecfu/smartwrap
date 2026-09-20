#!/usr/bin/env node
'use strict'

const smartwrap = require('smartwrap')
const yargs = require('yargs')

const argv = yargs
  .option('breakword', {
    default: false,
    describe: 'Choose whether or not to break words when wrapping a string',
    type: 'boolean'
  })
  .option('errorChar', {
    default: '�',
    describe: 'Placeholder for wide characters when minWidth < 2'
  })
  .option('minWidth', {
    choices: [1, 2],
    default: 2,
    describe:
      'Minimum line width. Use 1 only if you are certain you are not using wide characters and want a 1-space column.'
  })
  .option('paddingLeft', {
    default: 0,
    describe: 'Set the left padding of the output',
    type: 'number'
  })
  .option('paddingRight', {
    default: 0,
    describe: 'Set the right padding of the output',
    type: 'number'
  })
  .option('splitAt', {
    default: [' ', '\t'],
    describe: 'Characters at which to split input'
  })
  .option('trim', {
    default: true,
    describe: 'Trim whitespace from ends of input',
    type: 'boolean'
  })
  .option('width', {
    alias: 'w',
    default: 10,
    describe: 'Set the line width of the output (in spaces)',
    demandOption: true,
    coerce: (arg) => {
      const n = Number(arg)
      if (Number.isNaN(n)) {
        throw new Error('Invalid width specified.')
      }
      return n
    }
  })
  .help('h')
  .alias('h', 'help')
  .parseSync()

const options = {}
const keys = [
  'breakword',
  'errorChar',
  'minWidth',
  'paddingLeft',
  'paddingRight',
  'splitAt',
  'trim',
  'width'
]

for (const key of keys) {
  if (typeof argv[key] !== 'undefined') {
    options[key] = argv[key]
  }
}

process.stdin.resume()
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => {
  const out = smartwrap(chunk, options)
  console.log(out)
})
