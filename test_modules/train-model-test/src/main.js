import TrainModelInterface from './TrainModelInterface'
import { mphToMs, fromKilo } from './UnitConversion'
const { app, BrowserWindow, ipcMain } = require('electron')
const isDev = require('electron-is-dev')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 750,
    height: 800,
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Instantiate messenger, listeners, and speaker
const messenger = require('messenger')
const watchdog = messenger.createListener(8000)
const inputTrackModel = messenger.createListener(8004)
const trainModel = messenger.createSpeaker(8005)
const inputSWController = messenger.createListener(8006)
const inputHWController = messenger.createListener(8007)

// TIMING
let clockEnable = false
const frequency = 40
let multiplier = 1
let last = Date.now() / 1000
let now = Date.now() / 1000
let simTime = 0
let input = false

// enables or disables the clock when the Start/Stop button is pressed by the user
ipcMain.on('setClock', (event, arg) => { setClock(arg) })
function setClock (arg) {
  last = Date.now() / 1000
  clockEnable = arg
}

// Set the time multiplier when set by the user
ipcMain.on('setMult', (event, arg) => { multiplier = arg })

// Sends timing information to the render process for display
ipcMain.on('requestTiming', (event, arg) => {
  event.reply('fetchTiming', { clock: clockEnable, mult: multiplier, time: simTime })
})

// sends out the two cycle clock signal at half the given frequency
setInterval(() => {
  if (clockEnable) {
    if (input) {
      trainModel.shout('trackModel', trainsList.map((t) => t.trackIntf.inputs))
      trainsList.forEach((t) => { t.trackIntf.inputs.boardingPax = 0 })
      input = false
    } else {
      now = Date.now() / 1000
      const dt = (now - last) * multiplier
      last = now
      simTime += dt
      trainModel.shout('clock2', { dt: dt })
      input = true
    }
  }
}, 1000 / frequency)

// Creating Trains
let nextID = 1
let createHW = false

ipcMain.on('createTrain', (event, arg) => {
  trainModel.shout('createTrain', { id: nextID, hw: false })
  createTrain(nextID, false)
  nextID++
})

ipcMain.on('createTrainHW', (event, arg) => {
  if (!createHW) {
    trainModel.shout('createTrain', { id: nextID, hw: true })
    createTrain(nextID, true)
    nextID++
    createHW = true
  }
})

const trainsList = []
const trainsDict = []
let selTrainId = 1
let hwTrain = null

function createTrain (id, hw) {
  const newTrain = new TrainModelInterface(id, hw)
  if (trainsList.length === 0) {
    selTrainId = id
  }
  trainsList.push(newTrain)
  trainsDict[id] = newTrain
  if (hw) {
    hwTrain = newTrain
  }
}

// WATCHDOG
let lastUpdate = 0
let moduleState = false
watchdog.on('trainModel', (m, data) => {
  lastUpdate = Date.now()
})

// Constants for the timeout and update frequency of the watchdog
const watchdogTimeout = 250
const watchdogFrequency = 100

// Updates module status at the given frequency
setInterval(() => {
  now = Date.now()
  if (now - lastUpdate > watchdogTimeout) { moduleState = false } else { moduleState = true }
}, 1000 / watchdogFrequency)

// Sends watchdog status to the renderer process upon request
ipcMain.on('requestWatchdog', (event, arg) => {
  event.reply('fetchWatchdog', moduleState)
})

// Details
ipcMain.on('request', (event, arg) => { event.reply('fetch', { sel: trainsDict[selTrainId], trains: trainsDict }) })
ipcMain.on('selectTrain', (event, arg) => { selTrainId = arg })

// Track Model
ipcMain.on('setSpeedCmd', (event, arg) => { trainsDict[selTrainId].trackIntf.inputs.speedCmd = mphToMs(arg) })
ipcMain.on('setAuthority', (event, arg) => { trainsDict[selTrainId].trackIntf.inputs.authorityCmd = arg })
ipcMain.on('setBeacon', (event, arg) => {
  trainsDict[selTrainId].trackIntf.inputs.station = arg.station
  trainsDict[selTrainId].trackIntf.inputs.leftPlatform = arg.leftPlatform
  trainsDict[selTrainId].trackIntf.inputs.rightPlatform = arg.rightPlatform
  trainsDict[selTrainId].trackIntf.inputs.underground = arg.underground
})
ipcMain.on('setPassengers', (event, arg) => {
  trainsDict[selTrainId].trackIntf.inputs.boardingPax = Math.round(arg)
})
ipcMain.on('setGrade', (event, arg) => { trainsDict[selTrainId].trackIntf.inputs.grade = arg / 100 })

inputTrackModel.on('trainModel', (m, data) => {
  data.forEach(t => {
    const id = t.id
    trainsDict[id].trackIntf.outputs.distance = t.distance
    trainsDict[id].trackIntf.outputs.passengers = t.passengers
    trainsDict[id].trackIntf.outputs.maxBoardingPax = t.maxBoardingPax
    trainsDict[id].trackIntf.outputs.deboardingPax = t.deboardingPax
  })
})

// Train Controller
ipcMain.on('setPower', (event, arg) => { trainsDict[selTrainId].trainIntf.inputs.powerCmd = fromKilo(arg) })
ipcMain.on('setEmergencyBrake', (event, arg) => { trainsDict[selTrainId].trainIntf.inputs.emergencyBrake = arg })
ipcMain.on('setServiceBrake', (event, arg) => { trainsDict[selTrainId].trainIntf.inputs.serviceBrake = arg })
ipcMain.on('setLeftDoors', (event, arg) => { trainsDict[selTrainId].trainIntf.inputs.leftDoors = arg })
ipcMain.on('setRightDoors', (event, arg) => { trainsDict[selTrainId].trainIntf.inputs.rightDoors = arg })
ipcMain.on('setLights', (event, arg) => { trainsDict[selTrainId].trainIntf.inputs.lights = arg })
ipcMain.on('setTemperature', (event, arg) => { trainsDict[selTrainId].trainIntf.inputs.temperature = arg })

inputSWController.on('trainModel', (m, data) => {
  data.forEach(t => {
    const id = t.id
    trainsDict[id].trainIntf.outputs.velocity = t.velocity
    trainsDict[id].trainIntf.outputs.speedCmd = t.speedCmd
    trainsDict[id].trainIntf.outputs.authorityCmd = t.authorityCmd
    trainsDict[id].trainIntf.outputs.engineFailure = t.engineFailure
    trainsDict[id].trainIntf.outputs.brakeFailure = t.brakeFailure
    trainsDict[id].trainIntf.outputs.signalFailure = t.signalFailure
    trainsDict[id].trainIntf.outputs.station = t.station
    trainsDict[id].trainIntf.outputs.rightPlatform = t.rightPlatform
    trainsDict[id].trainIntf.outputs.leftPlatform = t.leftPlatform
    trainsDict[id].trainIntf.outputs.underground = t.underground
  })
  trainModel.shout('controllerSW', trainsList.map((t) => t.trainIntf.inputs))
})

inputHWController.on('trainModel', (m, data) => {
  hwTrain.trainIntf.outputs.velocity = data.velocity
  hwTrain.trainIntf.outputs.speedCmd = data.speedCmd
  hwTrain.trainIntf.outputs.authorityCmd = data.authorityCmd
  hwTrain.trainIntf.outputs.engineFailure = data.engineFailure
  hwTrain.trainIntf.outputs.brakeFailure = data.brakeFailure
  hwTrain.trainIntf.outputs.signalFailure = data.signalFailure
  hwTrain.trainIntf.outputs.station = data.station
  hwTrain.trainIntf.outputs.rightPlatform = data.rightPlatform
  hwTrain.trainIntf.outputs.leftPlatform = data.leftPlatform
  hwTrain.trainIntf.outputs.underground = data.underground
  trainModel.shout('controllerHW', hwTrain.trainIntf.inputs)
})
