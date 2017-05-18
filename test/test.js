var Tests = {};
var fs = require('fs'); 
var glob = require('glob');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();
var exec = require('child_process').exec, child;
var smartwrap = require('../index.js');
var filepath = 'test/tests.json';

//Run through all examples 
describe('Examples',function(){
	
	//string
	var str = fs.readFileSync(filepath,{
		encoding : 'utf-8'
	});

	obj = JSON.parse(str);

	for(var i in obj){	
		//generate new output 
		var output = smartwrap(obj[i].string,{
			width : obj[i].width
		});

		console.log("Test Properties:",obj[i]);
		console.log("12345678901234567890");
		console.log("BEGIN---------------");
		console.log(output);
		console.log("END-----------------\n");

		//save new output to file (save is set in Gruntfile.js)
		if(typeof global.save !== 'undefined' && global.save){
			obj[i].output = output;
		}
		else{
			//compare this output to saved output
			it('Test should match saved output.',function(){
				obj[i].output.should.equal(output);
			});
		}
	}

	if(typeof global.save !== 'undefined' && global.save){
		//write saved object to file
		fs.writeFileSync(filepath,JSON.stringify(obj,null,2),'utf8');
		console.log("Tests saved to file.");
	}
});

module.exports = Tests;
