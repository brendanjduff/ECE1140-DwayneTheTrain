const { app, BrowserWindow, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
import WaysideController from './wayside-controller'

//SETTINGS
const TREAT_BROKEN_AS_OCCUPIED = true

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

//===============================//
// WAYSIDE CONTROLLER (SOFTWARE) //
//===============================//

var greenLineSwitches = new Array(6).fill(false)
var greenLineCrossings = new Array(1).fill(false)
var greenLineLights = new Array(13).fill(false)
var greenLineMiscOut = new Array(4).fill(false)
var greenLineBlockOccupancy = new Array(150).fill(false)
var greenLineBlocksBroken = new Array(150).fill(false)
var greenLineMiscIn = new Array(0).fill(false)
var greenLineSpeed = new Array(150).fill(0)
var greenLineAuth = new Array(150).fill(0)

var redLineSwitches = new Array(7).fill(false)
var redLineCrossings = new Array(1).fill(false)
var redLineLights = new Array(8).fill(false)
var redLineMiscOut = new Array(6).fill(false)
var redLineBlockOccupancy = new Array(76).fill(false)
var redLineBlocksBroken = new Array(76).fill(false)
var redLineMiscIn = new Array(0).fill(false)
var redLineSpeed = new Array(76).fill(0)
var redLineAuth = new Array(76).fill(0)

//declare all messengers
const messenger = require('messenger')
const input = messenger.createListener(8002)    //our input
const watchdog = messenger.createSpeaker(8000)  //system coordinator watchdog timer
const toCtc = messenger.createSpeaker(8001)     //ctc
const toHwws = messenger.createSpeaker(8003)    //hardware wayside controller
const toTrack = messenger.createSpeaker(8004)   //track model

//system coordinator messages
setInterval(() => { watchdog.shout('waysideSW', true) }, 100)

//CTC messages
input.on('ctc', (m, data) => {
  greenLineSpeed = data['greenLineSpeed']
  greenLineAuth = data['greenLineAuth']
  redLineSpeed = data['redLineSpeed']
  redLineAuth = data['redLineAuth']

  toTrack.shout("wayside", { greenLineSpeed: greenLineSpeed, greenLineAuth: greenLineAuth, greenLineSwitches:greenLineSwitches, greenLineLights:greenLineLights, greenLineCrossings: greenLineCrossings, redLineSpeed: redLineSpeed, redLineAuth: redLineAuth, redLineSwitches: redLineSwitches, redLineLights:redLineLights, redLineCrossings:redLineCrossings })
})

//Hardware Wayside messages


//Track Model messages
input.on('trackModel', (m, data) => {
  data.greenLine.forEach((b) => {
    greenLineBlockOccupancy[b.blockNum] = b.isOccupied || (b.railBroken && TREAT_BROKEN_AS_OCCUPIED)
    greenLineBlocksBroken[b.blockNum] = b.railBroken
  })
  data.redLine.forEach((b) => {
    redLineBlockOccupancy[b.blockNum] = b.isOccupied || (b.railBroken && TREAT_BROKEN_AS_OCCUPIED)
    redLineBlocksBroken[b.blockNum] = b.railBroken
  })

  toCtc.shout('wayside', { greenLine: greenLineBlockOccupancy, redLine: redLineBlockOccupancy })
  updateTrack()
})

//wayside objects
const ws_gA = new WaysideController('Green-A', greenLineBlockOccupancy, greenLineBlocksBroken, greenLineMiscIn,
  greenLineSwitches, greenLineCrossings, greenLineLights, greenLineMiscOut)
const ws_gB = new WaysideController('Green-B', greenLineBlockOccupancy, greenLineBlocksBroken, greenLineMiscIn,
  greenLineSwitches, greenLineCrossings, greenLineLights, greenLineMiscOut)
const ws_gC = new WaysideController('Green-C', greenLineBlockOccupancy, greenLineBlocksBroken, greenLineMiscIn,
  greenLineSwitches, greenLineCrossings, greenLineLights, greenLineMiscOut)
const ws_gD = new WaysideController('Green-D', greenLineBlockOccupancy, greenLineBlocksBroken, greenLineMiscIn,
  greenLineSwitches, greenLineCrossings, greenLineLights, greenLineMiscOut)
const ws_rA = new WaysideController('Red-A', redLineBlockOccupancy, redLineBlocksBroken, redLineMiscIn, 
  redLineSwitches, redLineCrossings, redLineLights, redLineMiscOut)
const ws_rB = new WaysideController('Red-B', redLineBlockOccupancy, redLineBlocksBroken, redLineMiscIn, 
  redLineSwitches, redLineCrossings, redLineLights, redLineMiscOut)
const ws_rC = new WaysideController('Red-C', redLineBlockOccupancy, redLineBlocksBroken, redLineMiscIn, 
  redLineSwitches, redLineCrossings, redLineLights, redLineMiscOut)

ipcMain.on('PLC_GreenA', (m,data) => {
  ws_gA.parse(data)
  ws_gA.execute()
})

ipcMain.on('PLC_GreenB', (m,data) => {
  ws_gB.parse(data)
  ws_gB.execute()
})

ipcMain.on('PLC_GreenC', (m,data) => {
  ws_gC.parse(data)
  ws_gC.execute()
})

ipcMain.on('PLC_GreenD', (m,data) => {
  ws_gD.parse(data)
  ws_gD.execute()
})

ipcMain.on('PLC_RedA', (m,data) => {
  ws_rA.parse(data)
  ws_rA.execute()
})

ipcMain.on('PLC_RedB', (m,data) => {
  ws_rB.parse(data)
  ws_rB.execute()
})

ipcMain.on('PLC_RedC', (m,data) => {
  ws_rC.parse(data)
  ws_rC.execute()
})

function updateTrack() {
  ws_gA.execute()
  ws_gB.execute()
  ws_gC.execute()
  ws_gD.execute()
  ws_rA.execute()
  ws_rB.execute()
  ws_rC.execute()
}

/*
//test function designed for Green-A
function test1() {
  console.log('[Set 1]')
  greenLineBlockOccupancy[12-1] = true
  greenLineBlockOccupancy[13-1] = true
  ws_gA.execute()
  console.log('sw5: ' + greenLineSwitches[5-1])
  console.log('sw4: ' + greenLineSwitches[4-1])
  console.log('cr1: ' + greenLineCrossings[1-1])
  console.log('lt4: ' + greenLineLights[4-1])
  console.log('mo1: ' + greenLineMiscOut[1-1])
  console.log('mo2: ' + greenLineMiscOut[2-1])

  console.log('[Set 2]')
  greenLineBlockOccupancy[12-1] = true
  greenLineBlockOccupancy[13-1] = false
  greenLineBlockOccupancy[21-1] = true
  greenLineBlockOccupancy[22-1] = true
  ws_gA.execute()
  console.log('sw5: ' + greenLineSwitches[5-1])
  console.log('sw4: ' + greenLineSwitches[4-1])
  console.log('cr1: ' + greenLineCrossings[1-1])
  console.log('lt4: ' + greenLineLights[4-1])
  console.log('mo1: ' + greenLineMiscOut[1-1])
  console.log('mo2: ' + greenLineMiscOut[2-1])
  
  console.log('[Set 3]')
  greenLineBlockOccupancy[12-1] = false
  greenLineBlockOccupancy[13-1] = false
  greenLineBlockOccupancy[21-1] = false
  greenLineBlockOccupancy[22-1] = false
  ws_gA.execute()
  console.log('sw5: ' + greenLineSwitches[5-1])
  console.log('sw4: ' + greenLineSwitches[4-1])
  console.log('cr1: ' + greenLineCrossings[1-1])
  console.log('lt4: ' + greenLineLights[4-1])
  console.log('mo1: ' + greenLineMiscOut[1-1])
  console.log('mo2: ' + greenLineMiscOut[2-1])
}

//test function designed for Green-A-Test
function test2() {
  console.log('[Test 2]')
  ws_gA.execute()
  console.log('sw4: ' + greenLineSwitches[4-1])
  console.log('sw5: ' + greenLineSwitches[5-1])
  console.log('cr1: ' + greenLineCrossings[1-1])
  console.log('mo1: ' + greenLineMiscOut[1-1])
  console.log('mo2: ' + greenLineMiscOut[2-1])
}
*/