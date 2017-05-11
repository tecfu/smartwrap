function smartWrap(text,options){

	options = options || {};
	var Merge = require('merge');
	var Wcwidth = require('wcwidth');
	
	var defaults = {};
	defaults.currentLine = 0; //index of current line in 'lines[]'
	defaults.input = []; //input string split by whitespace 
	defaults.lines = [
		[]
	]; //assume at least one line
	defaults.paddingLeft = 0;
	defaults.paddingRight = 0;
	defaults.lineLength = 10; 
	defaults.returnFormat = 'string'; //or 'array'
	defaults.calculateSpaceRemaining = function(obj,i){//i is in case someone wants to customize based on line index
		return Math.max(obj.lineLength - obj.spacesUsed - obj.paddingLeft - obj.paddingRight,0);
	}; //function to set starting line length
	defaults.skipPadding = false; //set to true when padding set too wide for line length
	defaults.spacesUsed = 0; //spaces used so far on current line
	defaults.splitAt = [" ","\t"];
	defaults.words = [];
	
	var wrapObj = Merge({},defaults,options);

	//make sure correct sign on padding
	wrapObj.paddingLeft = Math.abs(wrapObj.paddingLeft);
	wrapObj.paddingRight = Math.abs(wrapObj.paddingRight);

	var lineLengthNetPadding = wrapObj.lineLength - wrapObj.paddingLeft
		- wrapObj.paddingRight;

	if(lineLengthNetPadding < 2){
		//skip padding if lineLength too narrow
		wrapObj.skipPadding = true;
	}
	else{
		//resize line length to include padding
		wrapObj.lineLength = lineLengthNetPadding;
	}	
		
	//consider wide characters when breaking words
	var breakWord = function(word,breakAtLength){
		var charArr = [...word];
		//get character after which word must be broken
		var index = 0;
		var indexOfLastFitChar = 0;
		var fittableLength = 0;
		while(charArr.length > 0){
			var char = charArr.shift();
			var currentLength = fittableLength + Wcwidth(char);
			if(currentLength <= breakAtLength){
				indexOfLastFitChar = index;
				fittableLength = currentLength;
				index++;
			}
			else{
				break;
			}
		}
		//break after this character
		return indexOfLastFitChar;
	}

	//Break input into array of characters split by whitespace and/or tabs
	var unfilteredWords = [];
	if(wrapObj.splitAt.indexOf('\t')!==-1){
		//split at both spaces and tabs
		unfilteredWords = text.split(/ |\t/i);
	}
	else{
		//split at whitespace
		unfilteredWords = text.split(' ');
	}
	
	//remove empty array elements
	unfilteredWords.forEach(function(val){
		if (val.length > 0){
			wrapObj.words.push(val);
		}
	});

	var i,
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
				splitIndex = breakWord(word,wrapObj.lineLength);
				wrapObj.words.unshift(word.substr(0,Math.max(splitIndex,1)));
				wrapObj.words.splice(1,0,word.substr(Math.max(splitIndex,1)));
				break;

			//2- Word is too long for current line and must be wrapped
			case(spaceRemaining <= wordlength):
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
				//reduce space remaining
				wrapObj.spacesUsed += wordlength;
				//increment iterator
				i++;
				
		}
	}

	if(wrapObj.returnFormat === 'array'){
		return wrapObj.lines;
	}
	else{
		var lines = wrapObj.lines.map(function(line){
			//restore spaces to line
			line = line.join('\ ');
			//add padding to ends of line
			if(!wrapObj.skipPadding){
				line = Array(wrapObj.paddingLeft+1).join('\ ')
						+ line
						+ Array(wrapObj.paddingRight+1).join('\ ');
			}
			return line;
		})
		//return as string
		return lines.join('\n');	
	}
}

module.exports = smartWrap;
