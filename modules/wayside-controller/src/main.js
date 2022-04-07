const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

var USING_HW = true

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  // Open the DevTools.
  if(isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

var numBlocks = 150;
var blockOccupancy = new Array(numBlocks).fill(false)
var blockOperational = new Array(numBlocks).fill(true)

var switches = new Array(6).fill(false)

var arrived = false; //arrived at Dormont Station

var waysideDistribution = new Array(150)
waysideDistribution = ['A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A',
'B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B',
'C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C',
'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
'C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C',
'B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B']

var suggestedSpeed = new Array(numBlocks).fill(10)
var commandedSpeed = new Array(numBlocks).fill(10)
var suggestedAuth  = new Array(4).fill(2) //4 authorities for number of waysides
var commandedAuth  = new Array(numBlocks).fill(2) //send authority to individual blocks

//DORMONT STATION BLOCKS
waysideDistroDCmdSpeed[72] = 0;
waysideDistroDCmdAuth[72] = 0;

const messenger = require('messenger')
const input = messenger.createListener(8002)    //our input
const watchdog = messenger.createSpeaker(8000)  //system coordinator watchdog timer
const toCtc = messenger.createSpeaker(8001)     //ctc
const toHwws = messenger.createSpeaker(8003)    //hardware wayside controller
const toTrack = messenger.createSpeaker(8004)   //track model

setInterval(() => { watchdog.shout('waysideHW', true) }, 100)

input.on('trackModel', (m, data) => {
	blockOccupancy = data.map((b) => { b.isOccupied })
	toCtc.shout('changeBlock', blockOccupancy)
	
	waysideAPLC()
	waysideBPLC()
	waysideCPLC()
	waysideDPLC()
	
	updateCmdSpd()
	
	toTrack.shout('waysideSwP', switches)
	toTrack.shout('cmdSpeed', commandedSpeed)
	toTrack.shout('cmdAuth', commandedAuth)
})

input.on('hwWayside', (m, data) => {
	switches[4] = data[4]
})

input.on('createTrain', (m, data) => {
	suggestedSpeed.fill(data.speed);
	suggestedAuth.fill(data.authority)
})

function waysideAPLC() {
	if(USING_HW) {
		var buffer = new ArrayBuffer(4).fill(0)
		
		for(var i = 0; i < 25; i++) {
			buffer[i/8] |= blockOccupancy[i] << (i%8)
		}
		
		toHwws.shout('blockOccupancyA', buffer)
	} else {
		switches[4] = blockOccupancy[11]
	}
}

function waysideBPLC() {
    switches[3] = blockOccupancy[28]
}

function waysideCPLC() {
    switches[0] = false
    switches[5] = false
}

function waysideDPLC() {
    switches[1] = blockOccupancy[76]
    switches[2] = blockOccupancy[99]
}

function updateCmdSpd() {
	commandedSpeed = suggestedSpeed.map((a) => {suggestedSpeed})
	commandedAuth.fill(2)
	
	if(!arrived) {
		waysideDistroDCmdSpeed[72] = 0;
		waysideDistroDCmdAuth[72] = 0;
		
		if(blockOccupancy[72] === true) {
			arrived = true;
			setTimeout(() => {
				console.log("Train Departing Dormont");
				waysideDistroDComSpeed[72] = waysideDistroDSugSpeed[72]
			}, 2000)
		}
	}
}