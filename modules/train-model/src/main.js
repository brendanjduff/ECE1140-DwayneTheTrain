import { mphToMs, fromKilo } from './UnitConversion'
import TrainModel from './TrainModel'
const { app, BrowserWindow, ipcMain } = require('electron')
const isDev = require('electron-is-dev')

const testMode = true

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 600,
    minHeight: 600,
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

// Main Process
const trainsList = []
const trainsDict = []
let nextId = 1
let selTrainId = 1

// Universal IPC
ipcMain.on('requestData', (event, arg) => { event.reply('fetchData', { sel: trainsDict[selTrainId], trains: trainsList }) })
ipcMain.on('selectTrain', (event, arg) => { selTrainId = arg })
ipcMain.on('setEngineFailure', (event, arg) => { trainsDict[selTrainId].user.engineFailure = arg })
ipcMain.on('setBrakeFailure', (event, arg) => { trainsDict[selTrainId].user.brakeFailure = arg })
ipcMain.on('setSignalFailure', (event, arg) => { trainsDict[selTrainId].user.signalFailure = arg })
ipcMain.on('setEmergencyBrakePax', (event, arg) => { trainsDict[selTrainId].user.emergencyBrake = arg })

function createTrain () {
  const newTrain = new TrainModel(nextId)
  nextId += 1
  trainsList.push(newTrain)
  trainsDict[newTrain.trainId] = newTrain
}

if (testMode) {
  let enableClock = false
  let simulationTime = 0
  let timeMultiplier = 1
  let lastTime = Date.now() / 1000
  const simHz = 120

  function updateTrains () {
    const now = Date.now() / 1000
    const dt = (now - lastTime) * timeMultiplier
    if (dt > 0.1) {
      if (enableClock) {
        simulationTime += dt
        trainsList.forEach(t => { t.update(dt) })
      }
      lastTime = now
    }
  }

  setInterval(() => { updateTrains() }, 1000 / simHz)

  ipcMain.on('createTrain', (event, arg) => { createTrain() })

  ipcMain.on('setClock', (event, arg) => { enableClock = arg })

  ipcMain.on('setMult', (event, arg) => { timeMultiplier = arg })

  ipcMain.on('requestTiming', (event, arg) => {
    event.reply('fetchTiming', { clock: enableClock, mult: timeMultiplier, time: simulationTime })
  })

  ipcMain.on('requestReset', (event, arg) => {
    event.reply('resetOverview', true)
  })

  ipcMain.on('reset', (event, arg) => {
    trainsList.length = 0
    trainsDict.length = 0
    nextId = 1
    selTrainId = 1
    enableClock = false
    simulationTime = 0
    timeMultiplier = 1
    lastTime = Date.now() / 1000
  })

  // Train Update Test IPC
  ipcMain.on('setPower', (event, arg) => { trainsDict[selTrainId].ctrllr.inputs.powerCmd = fromKilo(arg) })
  ipcMain.on('setEmergencyBrake', (event, arg) => { trainsDict[selTrainId].ctrllr.inputs.emergencyBrake = arg })
  ipcMain.on('setServiceBrake', (event, arg) => { trainsDict[selTrainId].ctrllr.inputs.serviceBrake = arg })
  ipcMain.on('setLeftDoors', (event, arg) => { trainsDict[selTrainId].ctrllr.inputs.leftDoors = arg })
  ipcMain.on('setRightDoors', (event, arg) => { trainsDict[selTrainId].ctrllr.inputs.rightDoors = arg })
  ipcMain.on('setLights', (event, arg) => { trainsDict[selTrainId].ctrllr.inputs.lights = arg })
  ipcMain.on('setTemperature', (event, arg) => { trainsDict[selTrainId].ctrllr.inputs.temperature = arg })
  ipcMain.on('setSpeedCmd', (event, arg) => { trainsDict[selTrainId].track.inputs.speedCmd = mphToMs(arg) })
  ipcMain.on('setAuthority', (event, arg) => { trainsDict[selTrainId].track.inputs.authorityCmd = arg })
  ipcMain.on('setBeacon', (event, arg) => {
    trainsDict[selTrainId].track.inputs.station = arg.station
    trainsDict[selTrainId].track.inputs.leftPlatform = arg.leftPlatform
    trainsDict[selTrainId].track.inputs.rightPlatform = arg.rightPlatform
    trainsDict[selTrainId].track.inputs.underground = arg.underground
  })
  ipcMain.on('setPassengers', (event, arg) => {
    trainsDict[selTrainId].track.inputs.boardingPax = Math.round(arg)
    trainsDict[selTrainId].procPassengers()
  })
}
