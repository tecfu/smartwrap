#!/usr/bin/env node

let Smartwrap = require('./main.js');
let yargs = require('yargs');
yargs.option('width', {
  alias: 'w',
  describe: 'set the line width of the output',
  demandOption: true,
	coerce:function(arg){
		if(isNaN(arg*1)) {
			throw new Error('Invalid width specified.');
		}
		return arg*1;
	}
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
	let out = Smartwrap(chunk,{
		width: yargs.argv.width
	});
	console.log(out);
});

//yargs = yargs('h').argv;
yargs.argv = yargs.help('h').argv;
