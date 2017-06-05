#!/usr/bin/env node

let Smartwrap = require('./main.js');
let yargs = require('yargs');
yargs.option('paddingLeft', {
	default: 0,
	describe: 'Set the left padding of the output'
});
yargs.option('paddingRight', {
	default: 0,
	describe: 'Set the right padding of the output'
});
yargs.option('splitAt', {
	default: [" ","\t"],
	describe: 'Characters at which to split input'
});
yargs.option('trim', {
	default: true,
	describe: 'Trim the whitespace from end of input'
});
yargs.option('width', {
  alias: 'w',
	default: 10,
  describe: 'Set the line width of the output (in spaces)',
  demandOption: true,
	coerce:function(arg){
		if(isNaN(arg*1)) {
			throw new Error('Invalid width specified.');
		}
		return arg*1;
	}
});

//create options object
let options = {};
[
	'paddingLeft',
	'paddingRight',
	'splitAt',
	'trim',
	'width'
].forEach(function(key){
	if(typeof yargs.argv[key] !== undefined){
		options[key] = yargs.argv[key]
	}
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
	let out = Smartwrap(chunk,options);
	console.log(out);
});

//yargs = yargs('h').argv;
yargs.argv = yargs.help('h').argv;
