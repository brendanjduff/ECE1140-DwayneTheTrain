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
commandedSpeed[72] = 0;
commandedAuth[72] = 0;

const messenger = require('messenger')
const input = messenger.createListener(8002)    //our input
const watchdog = messenger.createSpeaker(8000)  //system coordinator watchdog timer
const toCtc = messenger.createSpeaker(8001)     //ctc
const toHwws = messenger.createSpeaker(8003)    //hardware wayside controller
const toTrack = messenger.createSpeaker(8004)   //track model

input.on('ctc', (m, data) => {
	// get stuff from ctc
	
	waysideAPLC()
	waysideBPLC()
	waysideCPLC()
	waysideDPLC()
	
	updateCmdSpd()

  console.log(switches)

	toTrack.shout("wayside", { cmdSpeed: commandedSpeed, cmdAuth: commandedAuth, switches: switches })
})

input.on('trackModel', (m, data) => {
	data.forEach((b) => {
		blockOccupancy[b.blockNum - 1] = b.isOccupied
	})

	ctcOutput = []
	data.forEach((b) => {
		ctcOutput[b.blockNum] = {num: b.blockNum, isOccupied: b.isOccupied }
	})

	toCtc.shout('wayside', ctcOutput)
})

input.on('waysideHW', (m, data) => {
	switches[4] = data[4]
})

input.on('createTrain', (m, data) => {
	suggestedSpeed.fill(data.speed)
	suggestedAuth.fill(data.authority)
})

function waysideAPLC() {
	if(USING_HW) {
		toHwws.shout('waysideSW', blockOccupancy)
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

var arr2 = false

function updateCmdSpd() {
    commandedSpeed = suggestedSpeed
    commandedAuth.fill(2)
    
    commandedSpeed[71] = 7;
    
    if(!arrived) {
        commandedSpeed[72] = 0;
        commandedAuth[72] = 0;
        

        if(blockOccupancy[72] === true && !arr2) {
            setTimeout(() => {
                console.log("Train Departing Dormont");
                commandedSpeed[72] = suggestedSpeed[72]
                arrived = true;
            }, 20000)
        }

		arr2 = true
    } 
}

setInterval(() => { watchdog.shout('waysideSW', true) }, 100)