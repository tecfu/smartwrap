'use strict';

function smartWrap(text,options){

  options = options || {};
  let Merge = require('merge');
  let Wcwidth = require('wcwidth');
  let Breakword = require('breakword');
  
  let defaults = {};
  defaults.calculateSpaceRemaining = function(obj,i){//i is in case someone wants to customize based on line index
    return Math.max(obj.lineLength - obj.spacesUsed - obj.paddingLeft - obj.paddingRight,0);
  }; //function to set starting line length
  defaults.currentLine = 0; //index of current line in 'lines[]'
  defaults.input = []; //input string split by whitespace 
  defaults.lines = [
    []
  ]; //assume at least one line
  defaults.minWidth = 2; //fallback to if width set too narrow
  defaults.paddingLeft = 0;
  defaults.paddingRight = 0;
  defaults.returnFormat = 'string'; //or 'array'
  defaults.skipPadding = false; //set to true when padding set too wide for line length
  defaults.spacesUsed = 0; //spaces used so far on current line
  defaults.splitAt = [" ","\t"];
  defaults.trim = true;
  defaults.width = 10; 
  defaults.words = [];
  
  let wrapObj = Merge({},defaults,options);

  //make sure correct sign on padding
  wrapObj.paddingLeft = Math.abs(wrapObj.paddingLeft);
  wrapObj.paddingRight = Math.abs(wrapObj.paddingRight);

  wrapObj.lineLength = wrapObj.width -
   wrapObj.paddingLeft -
   wrapObj.paddingRight;
  
  if(wrapObj.lineLength < wrapObj.minWidth){
    //skip padding if lineLength too narrow
    wrapObj.skipPadding = true;
    wrapObj.lineLength = wrapObj.minWidth;
  }
  else{
    //resize line length to include padding
    wrapObj.lineLength = wrapObj.lineLength;
  }
  //Break input into array of characters split by whitespace and/or tabs
  let unfilteredWords = [];

  //to trim or not to trim...
  let modifiedText = text.toString();
  if(wrapObj.trim){
    modifiedText = modifiedText.trim();
  }
  
  if(wrapObj.splitAt.indexOf('\t')!==-1){
    //split at both spaces and tabs
    unfilteredWords = modifiedText.split(/ |\t/i);
  }
  else{
    //split at whitespace
    unfilteredWords = modifiedText.split(' ');
  }
  
  //remove empty array elements
  unfilteredWords.forEach(function(val){
    if (val.length > 0){
      wrapObj.words.push(val);
    }
  });

  let i,
      spaceRemaining,
      splitIndex,
      word,
      wordlength;

  while(wrapObj.words.length > 0){
    spaceRemaining = wrapObj.calculateSpaceRemaining(wrapObj);
    word = wrapObj.words.shift();
    wordlength = Wcwidth(word);
    
    switch(true){
      //1- Word is too long for an empty line and must be broken
      case(wrapObj.lineLength < wordlength):
        //Break it, then re-insert its parts into wrapObj.words
        //so can loop back to re-handle each word
        splitIndex = Breakword(word,wrapObj.lineLength);
        wrapObj.words.unshift(word.substr(0,splitIndex + 1)); //+1 for substr fn
        wrapObj.words.splice(1,0,word.substr(splitIndex + 1));//+1 for substr fn
        break;

      //2- Word is too long for current line and must be wrapped
      case(spaceRemaining < wordlength):
        //add a new line to our array of lines
        wrapObj.lines.push([]);
        //note carriage to new line in counter
        wrapObj.currentLine++;
        //reset the spacesUsed to 0
        wrapObj.spacesUsed = 0;
        /* falls through */

      //3- Word fits on current line
      default:
        //add word to line
        wrapObj.lines[wrapObj.currentLine].push(word);
        //reduce space remaining (add a space between words)
        wrapObj.spacesUsed += wordlength + 1;
        //increment iterator
        i++;
    }
  }

  if(wrapObj.returnFormat === 'array'){
    return wrapObj.lines;
  }
  else{
    let lines = wrapObj.lines.map(function(line){
      //restore spaces to line
      line = line.join('\ ');
      //add padding to ends of line
      if(!wrapObj.skipPadding){
        line = Array(wrapObj.paddingLeft+1).join('\ ') +
             line +
             Array(wrapObj.paddingRight+1).join('\ ');
      }
      return line;
    });
    //return as string
    return lines.join('\n');  
  }
}

module.exports = smartWrap;
