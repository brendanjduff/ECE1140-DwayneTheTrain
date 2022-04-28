const fs = require('fs')

export default class WaysideController {

	waysideName = 'Unnamed Wayside'
	blockOccupancy = [] //blocks occupied
	blocksBroken = [] //blocks broken
	miscInput = [] //miscellaneous inputs
	miscOutput = [] //miscellaneous outputs
	switches = [] //switch positions
	crossings = [] //crossing active
	lights = [] //station lights
	internal = [] //internal values

	instructions = [] //lines of source program
	programStack = [] //evaluation stack

	ip = 0 //instruction pointer

	//must pass in arrays by reference
	constructor(waysideName, blockOccupancy, blocksBroken, miscInput, 
		switches, crossings, lights, miscOutput) {
		this.waysideName = waysideName
		this.blockOccupancy = blockOccupancy
		this.blocksBroken = blocksBroken
		this.miscInput = miscInput
		this.switches = switches
		this.crossings = crossings
		this.lights = lights
		this.miscOutput = miscOutput
	}

	parse(filepath) {
		//read source file contents
		let inputData = fs.readFileSync(filepath, 'utf8', (error, data) => {
			if(error) {
				throw error
			}
	
			return data
		})

		this.internal = [] //reset internal values
		this.programStack = [] //reset evaluation stack
		this.ip = 0 //reset instruction pointer
	
		//split source code on newline boundaries and remove excess whitespace
		this.instructions = inputData.toString().trim().toLowerCase().split(/(?:[\s]*[\r\n]+[\s]*)+/).map(s => s.trim())
	}

	execute() {
		let argText   //text of instruction argument
		let varValue  //value read from argument or value to write from stack
		let varValue2 //secondary value read for 2-input instruction

		//iterate through lines
		for(this.ip = 0; this.ip < this.instructions.length; this.ip++) {
			//console.log('intruction index ' + this.ip + ': ' + this.instructions[this.ip])
	  
			if(this.instructions[this.ip].match(/^[a-z]+/)[0] === 'ld') {
				argText = this.getInstrArg(this.instructions[this.ip], this.ip, 'LD')

				if(argText === null) {
					continue
				} 
				else if(argText === '1') { //boolean value of true
					varValue = true
				}
				else if(argText === '0') { //boolean value of false
					varValue = false
				}
				else {
					varValue = this.parseVar(argText)
				}

				if(varValue === true || varValue === false) {
					this.programStack.push(varValue)
				}
			} 
			else if(this.instructions[this.ip].match(/^[a-z]+/)[0] === 'st') {
				argText = this.getInstrArg(this.instructions[this.ip], this.ip, 'LD')

				if(argText === null) {
					continue
				}
				else if(argText === '1' || argText === '0') { //cannot write to boolean value
					this.reportError('Error on instruction #' + this.ip + 
						': Cannot store into boolean literal \'' + argText + '\'')
				}
				else {
					varValue = this.parseVar(argText, this.programStack.pop())
				}
			} 
			else if(this.instructions[this.ip].startsWith('or') === true) {
				varValue  = this.programStack.pop()
				varValue2 = this.programStack.pop()
				varValue  = varValue || varValue2 // OR
				this.programStack.push(varValue)
			}
			else if(this.instructions[this.ip].startsWith('and') === true) {
				varValue  = this.programStack.pop()
				varValue2 = this.programStack.pop()
				varValue  = varValue && varValue2 // AND
				this.programStack.push(varValue)
			} 
			else if(this.instructions[this.ip].startsWith('not') === true) {
				varValue  = this.programStack.pop()
				varValue = ~varValue // NOT
				this.programStack.push(varValue)
			}
			else {
				this.reportError('Error on instruction #' + this.ip + 
					': \'' + this.instructions[this.ip] + '\' is not a valid instruction. ')
			}
		}

		if(this.programStack.length != 0) {
			this.reportError('Program stack terminates as non-empty. ')
		}
	}

	//returns argument on success, null on failure
	getInstrArg(line, number, mnemonic) {
		let tokens = line.split(/[\s]+/)
				
		if(tokens.length != 2) {
			this.reportError('Error on instruction #' + number + ': 1 argument needed for ' +
				mnemonic + ' instruction; found ' + (tokens.length - 1) + '. ')
			return null
		}

		return tokens[1]
	}

	//Parses variable and writes value to it, if applicable.
	//Returns value read from variable, if applicable.
	//'value' argument should be specified only when writing values.
	parseVar(varName, value) {
		//variable location
		var varLoc = {blockOccupancy:this.blockOccupancy, blocksBroken:this.blocksBroken,
			switches:this.switches,	crossings:this.crossings, lights:this.lights, 
			miscInput:this.miscInput, miscOutput:this.miscOutput, internal:this.internal}
		var key = '' //key for variable location

		var readOnly = false //indicates a read-only variable
		var hasIndex = true
		var varIndex = 0 //index 0 by default

		//variable names must begin with a letter and be alphanumeric
		if(!(/^[A-Za-z][A-Za-z0-9]*$/).test(varName)) {
			this.reportError('Error on instruction #' + this.ip + ': variable \'' + varName + 
				'\' must begin with a letter and be alphanumeric. ')
			return null
		}
		
		//test matches for all special inputs/outputs
		if((/sw[\d]+/).test(varName)) {
			key = 'switches'
		}
		else if((/cr[\d]+/).test(varName)) {
			key = 'crossings'
		}
		else if((/lt[\d]+/).test(varName)) {
			key = 'lights'
		}
		else if((/mo[\d]+/).test(varName)) {
			key = 'miscOutput'
		}
		else if((/oc[\d]+/).test(varName)) {
			key = 'blockOccupancy'
			readOnly = true
		}	
		else if((/op[\d]+/).test(varName)) {
			key = 'blocksBroken'
			readOnly = true
		}
		else if((/mi[\d]+/).test(varName)) {
			key = 'miscInput'
			readOnly = true
		}
		else { //custom variable
			key = 'internal'
			hasIndex = false
		}

		//if the variable has an index that needs to be parsed, parse it
		if(hasIndex === true) {
			varIndex = parseInt(varName.substring(2))
		}

		if(value === true || value === false) {
			if(readOnly) {
				this.reportError('Error on instruction #' + this.ip + ': ' + varName + ' is a read-only variable. ')
			} else {
				varLoc[key][varIndex - 1] = value
			}
		} else {
			return varLoc[key][varIndex - 1]
		}
	}

	reportError(msg) {
		console.log("[ERROR] Wayside '" + this.waysideName + "': " + msg)
	}
}