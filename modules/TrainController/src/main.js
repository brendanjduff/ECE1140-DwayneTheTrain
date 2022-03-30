import { listenerCount } from 'process'
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
const train = new TrainController()
ipcMain.on('RequestData', (event, arg) => {event.reply('SendData', train)})
ipcMain.on('spdUp', (event,arg) => {train.spdUp()})
ipcMain.on('spdDown', (event,arg) => {train.spdDown()})
ipcMain.on('emerBrake', (event,arg) => {train.emerBrake()})
ipcMain.on('serBrake', (event,arg) => {train.serBrake()})
ipcMain.on('tempUp', (event,arg) => {train.tempUp()})
ipcMain.on('tempDown', (event,arg) => {train.tempDown()})
ipcMain.on('lightsOnOff', (event,arg) => {train.lightsOnOff(arg)})
ipcMain.on('leftDoor', (event,arg) => {train.leftDoor(arg)})
ipcMain.on('rightDoor', (event,arg) => {train.rightDoor(arg)})
ipcMain.on('showLocation', (event,arg) => {train.showLocation()})
ipcMain.on('KpUp', (event,arg) => {train.KpUp()})
ipcMain.on('KpDown', (event,arg) => {train.KpDown()})
ipcMain.on('KiUp', (event,arg) => {train.KiUp()})
ipcMain.on('KiDown', (event,arg) => {train.KiDown()})
ipcMain.on('authorityUp', (event,arg) => {train.authorityUp()})
ipcMain.on('authorityDown', (event,arg) => {train.authorityDown()})
ipcMain.on('actSpeedUp', (event,arg) => {train.actSpeedUp()})
ipcMain.on('actSpeedDown', (event,arg) => {train.actSpeedDown()})
ipcMain.on('cmdSpeedUp', (event,arg) => {train.cmdSpeedUp()})
ipcMain.on('cmdSpeedDown', (event,arg) => {train.cmdSpeedDown()})
ipcMain.on('automaticMode', (event,arg) => {train.automaticMode()})
ipcMain.on('manualMode', (event,arg) => {train.manualMode()})
ipcMain.on('powerCalc', (event,arg) => {train.powerCalc()})

const messenger = require('messenger')
const input = messenger.createListener(8006)
const watchdog = messenger.createSpeaker(8000)
const trainModel = messenger.createSpeaker(8005)

setInterval(() => { watchdog.shout('controllerSW', true)}, 100)

input.on('trainModel', (m,data) => {
  data.forEach(t => {
    const id = t.id
    train.actSpeed = t['velocity']
    train.cmdSpeed = t['speedCmd']
    train.authority = t['authorityCmd']
    train.location = t['station']
    // = data['rightPlatform']
    // = data['leftPlatform']
    // = data['underground']
  })
  train.powerCalc()
  var output = []
  output.push(train.getMessage())
  trainModel.shout('controllerSW', output)
})