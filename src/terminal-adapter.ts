#!/usr/bin/env node
import smartwrap, { type SmartwrapOptions } from './main'
import yargs from 'yargs'

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
    choices: [1, 2] as const,
    default: 2 as 1 | 2,
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
    default: [' ', '\t'] as string[],
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
    coerce: (arg: string | number): number => {
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

const options: SmartwrapOptions = {}
const keys = [
  'breakword',
  'errorChar',
  'minWidth',
  'paddingLeft',
  'paddingRight',
  'splitAt',
  'trim',
  'width'
] as const

for (const key of keys) {
  if (typeof argv[key] !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(options as any)[key] = argv[key]
  }
}

process.stdin.resume()
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk: string) => {
  const out = smartwrap(chunk, options)
  console.log(out)
})
