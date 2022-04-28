const fs = require('fs')
const { SerialPort } = require('serialport')

const MAX_PACKET_SIZE = 48

export default class WaysideController {

	waysideName = 'Unnamed Wayside'
	isHardware = false

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

	errorFound = false

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

	setAsHardware(isHardware) {
		this.isHardware = isHardware

		SerialPort.list((err, ports) => {
			console.log(ports)
		})
		
		const arduino = new SerialPort({
			path: 'COM3',
			baudRate: 9600
		})
		
		arduino.setEncoding('binary')

		arduino.on('readable', () => {
			this.processInput()
		})
	}

	parse(filepath) {
		//read source file contents
		let inputData = fs.readFileSync(filepath, 'utf8', (error, data) => {
			if(error) {
				throw error
			}
	
			return data
		})

		this.errorFound = false
	
		//split source code on newline boundaries and remove excess whitespace
		this.instructions = inputData.toString().trim().toLowerCase().split(/(?:[\s]*[\r\n]+[\s]*)+/).map(s => s.trim())

		if(this.isHardware) {
			this.isHardware = false
			this.execute() //error-checking
			this.isHardware = true

			if(this.errorFound === false) {
				var programString = this.makeProgramString()
				console.log(programString)
				var frame = this.createPacketFrame(0x7F, programString)
				this.transmit(frame)
			}
			else {
				this.reportError('Could not program hardware. ')
			}
		}

		this.internal = [] //reset internal values
		this.programStack = [] //reset evaluation stack
		this.ip = 0 //reset instruction pointer
	}

	createPacketFrame(command, data) {
		const continueCmd = 0x75
		var numPackets = 1
		var packets = []
		var dataIndex = 0

		if(data) {
			//number of packets necessary = max size - checksum - length - cmd
			numPackets = Math.ceil(data.length / (MAX_PACKET_SIZE-4))
			
			for(var i = 0; i < numPackets-1; i++) {
				packets[i] = {packet:new Uint8Array(MAX_PACKET_SIZE)}
			}
			
			packets[numPackets-1] = {packet:new Uint8Array(data.length % (MAX_PACKET_SIZE-4) + 4)}
		}
		else {
			packets[0].packet = {packet:new Uint8Array(2)}
		}

		//for each packet, set length and data if applicable, calculate checksum
		for(var i = 0; i < packets.length; i++) {
			if(i !== 0) {
				packets[i].packet[0] = continueCmd
			}  else {
				packets[i].packet[0] = command
			}
			
			if(i === packets.length - 1) {
				packets[i].packet[0] |= 0x80
			}
			
			var sum = packets[i].packet[0]

			if(data) {
				packets[i].packet[1] = ((packets[i].packet.length-4) & 0xFF)
				packets[i].packet[2] = (((packets[i].packet.length-4) & 0xFF00) >> 8)
				sum += packets[i].packet[1]
				sum += packets[i].packet[2]

				for(var j = 3; j < packets[i].packet.length-1; j++) {
					packets[i].packet[j] = data[dataIndex]
					dataIndex++
					sum += packets[i].packet[j]
				}
			}

			packets[i].packet[packets[i].packet.length-1] = 0x100 - (sum & 0xFF)
		}

		return packets
	}

	transmit(packetFrame) {
		console.log(packetFrame)
	}

	makeProgramString() {
		var instrIndex = 0

		var programString = []
		var outputsStream = []
		var inputsStream = []
		var instrStream = []

		var iSw = []
		var iCr = []
		var iLt = []
		var iMo = []
		var iOc = []
		var iOp = []
		var iMi = []
		var iIm = []

		var varCounts = {nSw:0, nCr:0, nLt:0, nMo:0, nOc:0, nOp:0, nMi:0,
			iSw, iCr, iLt, iMo, iOc, iOp, iMi, iIm}

		var instr
		var opcode
		var hasArg
		var varObj = {}
		varObj.type = 0x00

		for(var i = 0; i < this.instructions.length; i++) {
			instr = this.instructions[i].match(/^[a-z]+/)[0]
			hasArg = false

			if(instr === 'ld') {
				opcode = 0x02
				varObj = this.parseVarHw(this.instructions[i], varCounts)
				hasArg = true
			}
			else if(instr === 'st') {
				opcode = 0x03
				varObj = this.parseVarHw(this.instructions[i], varCounts)
				hasArg = true
			}
			else if(instr === 'or') {
				opcode = 0x04
			}
			else if(instr === 'and') {
				opcode = 0x05
			}
			else if(instr === 'not') {
				opcode = 0x06
			}
			else {
				return false
			}

			instrStream[instrIndex] = (varObj.type | opcode)
			instrIndex++

			if(hasArg) {
				instrStream[instrIndex] = varObj.index
				instrIndex++
			}
		}

		for(let i = 0; i < varCounts.iSw.length; i++) {
			outputsStream.push(iSw[i])
		}

		for(let i = 0; i < varCounts.iCr.length; i++) {
			outputsStream.push(iCr[i])
		}

		for(let i = 0; i < varCounts.iLt.length; i++) {
			outputsStream.push(iLt[i])
		}

		for(let i = 0; i < varCounts.iMo.length; i++) {
			outputsStream.push(iMo[i])
		}

		for(let i = 0; i < varCounts.iOc.length; i++) {
			inputsStream.push(iOc[i])
		}

		for(let i = 0; i < varCounts.iOp.length; i++) {
			inputsStream.push(iOp[i])
		}

		for(let i = 0; i < varCounts.iMi.length; i++) {
			inputsStream.push(iMi[i])
		}

		var progOffset = 0

		programString[0] = varCounts.iSw.length
		programString[1] = varCounts.iCr.length
		programString[2] = varCounts.iLt.length
		programString[3] = varCounts.iMo.length
		programString[4] = varCounts.iOc.length
		programString[5] = varCounts.iOp.length
		programString[6] = varCounts.iMi.length

		console.log(varCounts)

		progOffset = 7

		for(var i = 0; i < outputsStream.length; i++) {
			programString[progOffset + i] = outputsStream[i]
		}

		progOffset += outputsStream.length

		for(var i = 0; i < inputsStream.length; i++) {
			programString[progOffset + i] = inputsStream[i]
		}

		progOffset += inputsStream.length

		for(var i = 0; i < instrStream.length; i++) {
			programString[progOffset + i] = instrStream[i]
		}

		return programString
	}

	parseVarHw(instr, varCounts) {
		var varObj = {}
		var argText = this.getInstrArg(instr, this.ip, '')
		var varIndex

		//test matches for all special inputs/outputs
		if((/^0/).test(argText)) {
			varObj = {type:0x20, index:0x00}
		}
		else if((/^1/).test(argText)) {
			varObj = {type:0x30, index:0x00}
		}
		else if((/sw[\d]+/).test(argText)) {
			varIndex = (parseInt(argText.substring(2))-1)
			varObj = {type:0x40, index:varIndex}
			varCounts.nSw++

			//index of variable is index in array
			varObj.index = varCounts.iSw.indexOf(varIndex)

			//check to see if it was already created
			if(varObj.index === -1) { //if not, add it
				varObj.index = varCounts.iSw.length
				varCounts.iSw.push(varIndex) 
			}
		}
		else if((/cr[\d]+/).test(argText)) {
			varIndex = (parseInt(argText.substring(2))-1)
			varObj = {type:0x50, index:varIndex}
			varCounts.nCr++
			
			//index of variable is index in array
			varObj.index = varCounts.iCr.indexOf(varIndex)

			//check to see if it was already created
			if(varObj.index === -1) { //if not, add it
				varObj.index = varCounts.iCr.length
				varCounts.iCr.push(varIndex) 
			}
		}
		else if((/lt[\d]+/).test(argText)) {
			varIndex = (parseInt(argText.substring(2))-1)
			varObj = {type:0x60, index:varIndex}
			varCounts.nLt++

			//index of variable is index in array
			varObj.index = varCounts.iLt.indexOf(varIndex)

			//check to see if it was already created
			if(varObj.index === -1) { //if not, add it
				varObj.index = varCounts.iLt.length
				varCounts.iLt.push(varIndex) 
			}
		}
		else if((/mo[\d]+/).test(argText)) {
			varIndex = (parseInt(argText.substring(2))-1)
			varObj = {type:0x70, index:varIndex}
			varCounts.nMo++

			//index of variable is index in array
			varObj.index = varCounts.iMo.indexOf(varIndex)

			//check to see if it was already created
			if(varObj.index === -1) { //if not, add it
				varObj.index = varCounts.iMo.length
				varCounts.iMo.push(varIndex) 
			}
		}
		else if((/oc[\d]+/).test(argText)) {
			varIndex = (parseInt(argText.substring(2))-1)
			varObj = {type:0x80, index:varIndex}
			varCounts.nOc++

			//index of variable is index in array
			varObj.index = varCounts.iOc.indexOf(varIndex)

			//check to see if it was already created
			if(varObj.index === -1) { //if not, add it
				varObj.index = varCounts.iOc.length
				varCounts.iOc.push(varIndex) 
			}
		}	
		else if((/op[\d]+/).test(argText)) {
			varIndex = (parseInt(argText.substring(2))-1)
			varObj = {type:0x90, index:varIndex}
			varCounts.nOp++

			//index of variable is index in array
			varObj.index = varCounts.iOp.indexOf(varIndex)

			//check to see if it was already created
			if(varObj.index === -1) { //if not, add it
				varObj.index = varCounts.iOp.length
				varCounts.iOp.push(varIndex) 
			}
		}
		else if((/mi[\d]+/).test(argText)) {
			varIndex = (parseInt(argText.substring(2))-1)
			varObj = {type:0xA0, index:varIndex}
			varCounts.nMi++

			//index of variable is index in array
			varObj.index = varCounts.iMi.indexOf(varIndex)

			//check to see if it was already created
			if(varObj.index === -1) { //if not, add it
				varObj.index = varCounts.iMi.length
				varCounts.iMi.push(varIndex) 
			}
		}
		else { //custom variable
			varObj = {type:0xB0, index:0x00}

			//index of variable is index in array
			varObj.index = varCounts.iIm.indexOf(argText)

			//check to see if it was already created
			if(varObj.index === -1) { //if not, add it
				varObj.index = varCounts.iIm.length
				varCounts.iIm.push(argText) 
			}
		}

		return varObj
	}

	execute() {
		if(this.isHardware) {
			return
		}

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
				varValue = !varValue // NOT
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
		this.errorFound = true
	}
}