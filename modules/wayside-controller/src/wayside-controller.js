const fs = require('fs')

export default class WaysideController {

	blockOccupancy = [] //blocks occupied
	blockOperational = [] //blocks operational
	miscInput = [] //miscellaneous inputs
	miscOutput = [] //miscellaneous outputs
	switches = [] //switch positions
	crossings = [] //crossing active
	lights = [] //station lights
	internal = [] //internal values

	instructions = [] //lines of source program
	programStack = [] //evaluation stack

	#ip = 0 //instruction pointer

	//must pass in arrays by reference
	constructor(blockOccupancy, blockOperational, switches, crossings, lights) {
		this.blockOccupancy = blockOccupancy
		this.blockOperational = blockOperational
		this.switches = switches
		this.crossings = crossings
		this.lights = lights
	}

	//must pass in arrays by reference
	constructor(blockOccupancy, blockOperational, switches, crossings, lights, filepath) {
		this(blockOccupancy, blockOperational, switches, crossings, lights)
		this.parse(filepath)
	}

	parse(filepath) {
		//read source file contents
		inputData = fs.readFileSync(filepath, 'utf8', (error, data) => {
			if(error) {
				throw error
			}
	
			return data
		})
	
		//split source code on newline boundaries and remove excess whitespace
		instructions = inputData.toString().trim().toLowerCase().split(/([\s]*\n+[\s]*)+/).map(s => s.trim())
	}

	execute() {
		let tokens = []
		let argText
		let varValue

		//iterate through lines
		for(ip = 0; ip < instructions.length; ip++) {
			console.log('intruction index ' + ip + ': ' + instructions[ip])
	  
			if(instructions[ip].match(/^[a-z]+/)[0] === 'ld') {
				argText = getInstrArg(instructions[ip], ip, 'LD')
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
					varValue = parseVar(argText)
				}

				programStack.push(varValue)
			} 
			else if(instructions[ip].match(/^[a-z]+/)[0] === 'st') {
				programStack.push(instructions[ip + 1])
			} 
			else if(instructions[ip].startsWith('or') === true) {
				programStack.push(instructions[ip])
			}
			else if(instructions[ip].startsWith('and') === true) {
				programStack.push(instructions[ip])
			} 
			else if(instructions[ip].startsWith('not') === true) {
				programStack.push(instructions[ip])
			}
			else {
				//invalid instruction
			}
		}
	}

	//returns argument on success, null on failure
	#getInstrArg(line, number, mnemonic) {
		tokens = line.split(/[\s]+/)
				
		if(tokens.length != 2) {
			reportError('Error on instruction #' + number + ': 1 argument needed for ' +
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
		var varLoc = {blockOccupancy, blockOperational, switches, 
			crossings, lights, miscInput, miscOutput, internal}
		var key = '' //key for variable location

		var readOnly = false //indicates a read-only variable
		var hasIndex = true
		var varIndex = 0 //index 0 by default

		//variable names must begin with a letter and be alphanumeric
		if(!varName.test(/^[A-Za-z][A-Za-z0-9]*$/)) {
			reportError('Error on instruction #' + ip + ': variable \'' + varName + 
				'\' must begin with a letter and be alphanumeric. ')
		}
		
		//test matches for all special inputs/outputs
		if(varName.test(/sw[\d]+/)) {
			key = 'switches'
		}
		else if(varName.test(/cr[\d]+/)) {
			key = 'crossings'
		}
		else if(varName.test(/lt[\d]+/)) {
			key = 'lights'
		}
		else if(varName.test(/mo[\d]+/)) {
			key = 'miscOutput'
		}
		else if(varName.test(/oc[\d]+/)) {
			key = 'blockOccupancy'
			readOnly = true
		}	
		else if(varName.test(/op[\d]+/)) {
			key = 'blockOperational'
			readOnly = true
		}
		else if(varName.test(/mi[\d]+/)) {
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
				reportError('Error on instruction #' + ip + ': ' + varName + ' is a read-only variable. ')
			} else {
				varLoc[key][varIndex] = value
			}
		} else {
			return varLoc[key][varIndex]
		}
	}

	#reportError(msg) {
		console.log(msg)
	}
}