'use strict';

let Tests = {};
let fs = require('fs'); 
//let glob = require('glob');
let chai = require('chai');
let expect = chai.expect;
let assert = chai.assert;
let should = chai.should();
let smartwrap = require('../src/main.js');
let filepath = 'test/tests.json';
let test = function(testResult,savedResult){
  it('Strings should match',function(){
    testResult.should.equal(savedResult);
  })
};

//get test list
let str = fs.readFileSync(filepath,{
  encoding : 'utf-8'
});

let obj = JSON.parse(str);

for(let i in obj){  
  
  //generate new output 
  let options = {};
  [
    'width',
    'minWidth',
    'paddingLeft',
    'paddingRight',
    'trim'
  ].forEach(function(element){
    if (typeof obj[i][element] !== 'undefined') {
     options[element] = obj[i][element]; 
    }
  });

  let testResult = smartwrap(obj[i].input,options);

  console.log("Test Properties:",obj[i]);
  console.log("12345678901234567890");
  console.log("BEGIN---------------");
  console.log(testResult);
  console.log("END-----------------\n");
  switch(true){
    case(typeof global.save !== 'undefined' && global.save):
    //save tests
      obj[i].output = testResult;
      break;
    case(typeof global.display !== 'undefined' && global.display):
    //show tests (do nothing)
      break;
    default:
    //run tests
      describe('Test '+i,function(){
        test(testResult,obj[i].output);
      })
  }
}

if(typeof global.save !== 'undefined' && global.save){
  //write saved object to file
  fs.writeFileSync(filepath,JSON.stringify(obj,null,2),'utf8');
  console.log("Tests saved to file.");
}

module.exports = Tests;
