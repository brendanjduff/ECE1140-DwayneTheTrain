import TrainModel from './TrainModel'
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

// Main Process
const trainsList = []
const trainsDict = []
let selTrainId = 1
let hwTrain = null
let hwTrainId = 0

// UX IPC
ipcMain.on('requestData', (event, arg) => { event.reply('fetchData', { sel: trainsDict[selTrainId], trains: trainsList }) })
ipcMain.on('selectTrain', (event, arg) => { selTrainId = arg })
// User IPC
ipcMain.on('setEngineFailure', (event, arg) => { trainsDict[selTrainId].user.engineFailure = arg })
ipcMain.on('setBrakeFailure', (event, arg) => { trainsDict[selTrainId].user.brakeFailure = arg })
ipcMain.on('setSignalFailure', (event, arg) => { trainsDict[selTrainId].user.signalFailure = arg })
ipcMain.on('setEmergencyBrakePax', (event, arg) => { trainsDict[selTrainId].user.emergencyBrake = arg })

function createTrain (id, hw) {
  const newTrain = new TrainModel(id, hw)
  if (trainsList.length === 0) { selTrainId = id }
  trainsList.push(newTrain)
  trainsDict[newTrain.trainId] = newTrain
  if (hw) {
    hwTrain = newTrain
    hwTrainId = hwTrain.trainId
  }
}

const messenger = require('messenger')
const input = messenger.createListener(8005)
const watchdog = messenger.createSpeaker(8000)
const trackOutput = messenger.createSpeaker(8004)
const swtcOutput = messenger.createSpeaker(8006)
const hwtcOutput = messenger.createSpeaker(8007)

input.on('trackModel', (m, data) => {
  const outputSW = []
  data.forEach(t => {
    const id = t.id
    trainsDict[id].receiveTrackInput(t)
    trainsDict[id].procTrackInputs()
    trainsDict[id].procControlOutputs()
    if (hwTrainId === id) { hwtcOutput.shout('trainModel', trainsDict[id].getControlOutputs()) } else { outputSW.push(trainsDict[id].getControlOutputs()) }
  })
  swtcOutput.shout('trainModel', outputSW)
})

input.on('controllerSW', (m, data) => {
  data.forEach(t => {
    const id = t.id
    trainsDict[id].receiveControlInput(t)
  })
})

input.on('controllerHW', (m, data) => {
  hwTrain.receiveControlInput(data)
})

input.on('clock2', (m, data) => {
  const outputTrack = []
  trainsList.forEach(t => {
    const dt = data.dt
    t.procControlAndUserInputs()
    t.updatePhysics(dt)
    t.procTrackOutputs(dt)
    outputTrack.push(t.getTrackOutputs())
  })
  trackOutput.shout('trainModel', outputTrack)
})

input.on('createTrain', (m, data) => {
  createTrain(data.id, data.hw)
})

setInterval(() => { watchdog.shout('trainModel', true) }, 100)
