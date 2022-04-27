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

let inputData
const blockArrData = []
const trackAtrData = []
const trackLogic = []

export function createVar (filepath) {
  inputData = fs.readFileSync(filepath, 'utf8', (error, data) => {
    if (error) {
      throw error
    }

    return data
  }
  )
  inputData = inputData.toString().split(/[\s,]+/)

  for (let i = 0; i < inputData.length; i++) {
    console.log('index ' + i + ' ' + inputData[i])

    if (inputData[i].includes('LD') == true) {
      blockArrData.push(inputData[i + 1])
    }
    if (inputData[i].includes('SET') == true) {
      trackAtrData.push(inputData[i + 1])
    }
    if (inputData[i].includes('OR' || 'AND' || 'NOT')) {
      trackLogic.push(inputData[i])
    }
  }

  // blockArrData[0] = 1;
  console.log(blockArrData)
  console.log(trackAtrData)
  console.log(trackLogic)
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

input.on('ctc', (m, data) => {
  greenLineSpeed = data['greenLineSpeed']
  greenLineAuth = data['greenLineAuth']
  redLineSpeed = data['redLineSpeed']
  redLineAuth = data['redLineAuth']
	toTrack.shout("wayside", { greenLineSpeed: greenLineSpeed, greenLineAuth: greenLineAuth, redLineSpeed: redLineSpeed, redLineAuth: redLineAuth }) // also send switche positions
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