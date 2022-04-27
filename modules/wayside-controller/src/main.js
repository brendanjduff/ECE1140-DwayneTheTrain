//import WaysideController from './wayside-controller'

const { app, BrowserWindow, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const fs = require('fs')



// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 720,
    minWidth: 300,
    minHeight: 500,
    show: false,

    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  // mainWindow.maximize()

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (isDev) {
  // Open the DevTools.
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }
  mainWindow.removeMenu()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

export default class WaysideController {

	waysideName = 'Unnamed Wayside'
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

	ip = 0 //instruction pointer

	//must pass in arrays by reference
	constructor(waysideName, blockOccupancy, blockOperational, switches, crossings, lights) {
		this.waysideName = waysideName
		this.blockOccupancy = blockOccupancy
		this.blockOperational = blockOperational
		this.switches = switches
		this.crossings = crossings
		this.lights = lights
    //this.ip = ip
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
			console.log('intruction index ' + this.ip + ': ' + this.instructions[this.ip])
	  
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
		var varLoc = {blockOccupancy:this.blockOccupancy, blockOperational:this.blockOperational,
			switches:this.switches,	crossings:this.crossings, lights:this.lights, 
			miscInput:this.miscInput, miscOutput:this.miscInput, internal:this.internal}
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
			key = 'blockOperational'
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
				varLoc[key][varIndex-1] = value
			}
		} else {
			return varLoc[key][varIndex-1]
		}
	}

	reportError(msg) {
		console.log("[ERROR] Wayside '" + this.waysideName + "': " + msg)
	}
}

const messenger = require('messenger')
const input = messenger.createListener(8002)    //our input
const watchdog = messenger.createSpeaker(8000)  //system coordinator watchdog timer
const toCtc = messenger.createSpeaker(8001)     //ctc
const toHwws = messenger.createSpeaker(8003)    //hardware wayside controller
const toTrack = messenger.createSpeaker(8004)   //track model

var greenLineSpeed = new Array(150).fill(0);
var greenLineAuth = new Array(150).fill(0);

var redLineSpeed = new Array(76).fill(0);
var redLineAuth = new Array(76).fill(0)

var greenBlockOccupancy = new Array(150).fill(false)
var redBlockOccupancy = new Array(76).fill(false)

var greenLineSwitches =  new Array(7).fill(false)
var greenLineCrossings = new Array(1).fill(false)
var greenLineLights = new Array(2).fill(false)

var redLineSwitches =  new Array(7).fill(false)
var redLineCrossings = new Array(1).fill(false)
var redLineLights = new Array(2).fill(false)

setInterval(() => { watchdog.shout('waysideSW', true) }, 100)

//CTC messages
input.on('ctc', (m, data) => {
  greenLineSpeed = data['greenLineSpeed']
  greenLineAuth = data['greenLineAuth']
  redLineSpeed = data['redLineSpeed']
  redLineAuth = data['redLineAuth']
  toTrack.shout("wayside", { greenLineSpeed: greenLineSpeed, greenLineAuth: greenLineAuth, redLineSpeed: redLineSpeed, redLineAuth: redLineAuth }) // also send switche positions
})

//Hardware Wayside messages


//Track Model messages
input.on('trackModel', (m, data) => {
  data.greenLine.forEach((b) => {
    greenBlockOccupancy[b.blockNum] = b.isOccupied
  })
  data.redLine.forEach((b) => {
    redBlockOccupancy[b.blockNum] = b.isOccupied
  })

  toCtc.shout('wayside', { greenLine: greenBlockOccupancy, redLine: redBlockOccupancy })
})

//
const ws_gA = new WaysideController('greenLineA',greenBlockOccupancy, greenBlockOccupancy, greenLineSwitches,
    greenLineCrossings, greenLineLights)
ipcMain.on('PLC_GreenA',(m,data) =>
{
  

  ws_gA.parse(data)
  ws_gA.execute()
})

const ws_gB = new WaysideController('greenLineB',greenBlockOccupancy, greenBlockOccupancy, greenLineSwitches,
greenLineCrossings, greenLineLights)

ipcMain.on('PLC_GreenB',(m,data) =>
{


  ws_gB.parse(data)
  ws_gB.execute()
})


const ws_gC = new WaysideController('greenLineC',greenBlockOccupancy, greenBlockOccupancy, greenLineSwitches,
greenLineCrossings, greenLineLights)

ipcMain.on('PLC_GreenC',(m,data) =>
{

  ws_gC.parse(data)
  ws_gC.execute()
})

const ws_gD = new WaysideController('greenLineD',greenBlockOccupancy, greenBlockOccupancy, greenLineSwitches,
greenLineCrossings, greenLineLights)


ipcMain.on('PLC_GreenD',(m,data) =>
{

  ws_gD.parse(data)
  ws_gD.execute()
})

const ws_rA = new WaysideController('redLineA',redBlockOccupancy, redBlockOccupancy, redLineSwitches,
redLineCrossings, redLineLights)
ipcMain.on('PLC_RedA',(m,data) =>
{


  ws_rA.parse(data)
  ws_rA.execute()
})

const ws_rB = new WaysideController('redLineB',redBlockOccupancy, redBlockOccupancy, greenLineSwitches,
greenLineCrossings, greenLineLights)

ipcMain.on('PLC_RedB',(m,data) =>
{

  ws_rB.parse(data)
  ws_rB.execute()
})

const ws_rC = new WaysideController('redLineC',greenBlockOccupancy, greenBlockOccupancy, greenLineSwitches,
greenLineCrossings, greenLineLights)

ipcMain.on('PLC_RedC',(m,data) =>
{


  ws_rC.parse(data)
  ws_rC.execute()
})





input.on('trackModel', (m, data) => {
	data.greenLine.forEach((b) => {
		greenBlockOccupancy[b.blockNum] = b.isOccupied
	})
  data.redLine.forEach((b) => {
		redBlockOccupancy[b.blockNum] = b.isOccupied
	})

	toCtc.shout('wayside', { greenLine: greenBlockOccupancy, redLine: redBlockOccupancy })
})