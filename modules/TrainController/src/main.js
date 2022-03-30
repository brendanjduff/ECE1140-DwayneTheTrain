import TrainController from './trainController'
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

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

  mainWindow.removeMenu()

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

let trainsList = []
let trainsDict = []
let selTrainId = 0

ipcMain.on('RequestData', (event, arg) => {
  if (selTrainId > 0) { event.reply('SendData', {exists: true, train: trainsDict[selTrainId], ids: trainsList.map((t) => t.id)})} 
  else { event.reply('SendData', {exists: false})}})
ipcMain.on('selectTrain', (event, arg) => { selTrainId = arg })
ipcMain.on('spdUp', (event,arg) => {trainsDict[selTrainId].spdUp()})
ipcMain.on('spdDown', (event,arg) => {trainsDict[selTrainId].spdDown()})
ipcMain.on('emerBrake', (event,arg) => {trainsDict[selTrainId].emerBrake()})
ipcMain.on('serBrake', (event,arg) => {trainsDict[selTrainId].serBrake()})
ipcMain.on('tempUp', (event,arg) => {trainsDict[selTrainId].tempUp()})
ipcMain.on('tempDown', (event,arg) => {trainsDict[selTrainId].tempDown()})
ipcMain.on('lightsOnOff', (event,arg) => {trainsDict[selTrainId].lightsOnOff(arg)})
ipcMain.on('leftDoor', (event,arg) => {trainsDict[selTrainId].leftDoor(arg)})
ipcMain.on('rightDoor', (event,arg) => {trainsDict[selTrainId].rightDoor(arg)})
ipcMain.on('showLocation', (event,arg) => {trainsDict[selTrainId].showLocation()})
ipcMain.on('KpUp', (event,arg) => {trainsDict[selTrainId].KpUp()})
ipcMain.on('KpDown', (event,arg) => {trainsDict[selTrainId].KpDown()})
ipcMain.on('KiUp', (event,arg) => {trainsDict[selTrainId].KiUp()})
ipcMain.on('KiDown', (event,arg) => {trainsDict[selTrainId].KiDown()})
ipcMain.on('authorityUp', (event,arg) => {trainsDict[selTrainId].authorityUp()})
ipcMain.on('authorityDown', (event,arg) => {trainsDict[selTrainId].authorityDown()})
ipcMain.on('actSpeedUp', (event,arg) => {trainsDict[selTrainId].actSpeedUp()})
ipcMain.on('actSpeedDown', (event,arg) => {trainsDict[selTrainId].actSpeedDown()})
ipcMain.on('cmdSpeedUp', (event,arg) => {trainsDict[selTrainId].cmdSpeedUp()})
ipcMain.on('cmdSpeedDown', (event,arg) => {trainsDict[selTrainId].cmdSpeedDown()})
ipcMain.on('automaticMode', (event,arg) => {trainsDict[selTrainId].automaticMode()})
ipcMain.on('manualMode', (event,arg) => {trainsDict[selTrainId].manualMode()})
ipcMain.on('powerCalc', (event,arg) => {trainsDict[selTrainId].powerCalc()})

const messenger = require('messenger')
const input = messenger.createListener(8006)
const watchdog = messenger.createSpeaker(8000)
const trainModel = messenger.createSpeaker(8005)

setInterval(() => { watchdog.shout('controllerSW', true)}, 100)

input.on('createTrain', (m, data) => {
  const newTrain = new TrainController(data)
  if(trainsList.length === 0) {
    selTrainId = data
  }
  trainsList.push(newTrain)
  trainsDict[data] = newTrain
})

input.on('trainModel', (m,data) => {
  data.forEach(t => {
    const id = t.id
    trainsDict[id].actSpeed = t['velocity']
    trainsDict[id].cmdSpeed = t['speedCmd']
    trainsDict[id].authority = t['authorityCmd']
    trainsDict[id].location = t['station']
    // = t['rightPlatform']
    // = t['leftPlatform']
    // = t['underground']
  })
  trainsList.forEach(t => {t.powerCalc()})
  trainModel.shout('controllerSW', trainsList.map((t) => t.getMessage()))
})