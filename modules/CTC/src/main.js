const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
import Train from './Train'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 700,
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
  if (isDev) {
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



//Create Train
const t = new Train(1)
let createTrainID = 1


// UX IPC
ipcMain.on('requestData', (event, arg) => { event.reply('fetchData', { // send properties of each train from here
  block: t.blockNum, 
  arrivalHrs: t.arrivalTimeHrs, 
  arrivalMin: t.arrivalTimeMinutes,
  departureHrs: t.departureTimeHrs,
  departureMin: t.departureTimeMinutes,
  speed: t.speed,
  authority: t.authority.reduce((a, b) => a + b, 0),
  destination: t.destination
}) })

function updateBlockOccupancy(data) {
  let occupied = 0
  for (let i = 0; i < data.length; i++) {
    if(data[i]) {
      occupied = i+1
      break
    }
  }
  t.blockNum = occupied
}

const messenger = require('messenger')
const watchdog = messenger.createSpeaker(8000)
const input = messenger.createListener(8001)
const waysideSW = messenger.createSpeaker(8002)
const waysideHW = messenger.createSpeaker(8002)
const trackModel = messenger.createSpeaker(8004)
const trainModel = messenger.createSpeaker(8005)
const controllerSW = messenger.createSpeaker(8006)

setInterval(() => { watchdog.shout('ctc', true) }, 100)

ipcMain.on('createTrain', (event, arg) => {
  t.isDispatched = true
  t.blockNum = 62
  t.destination = 'Dormont'
  t.calculateSpeedAuth()
  trackModel.shout('createTrain', createTrainID) //create train is the data that i send, put suggested speed and auth in place of that
  waysideHW.shout('createTrain', t)
  waysideSW.shout('createTrain', t)
  trainModel.shout('createTrain', { id: createTrainID, hw: false })
  controllerSW.shout('createTrain', createTrainID)
  createTrainID += 1
})

ipcMain.on('arrivalTimeHrs', (event, arg) => {
  t.arrivalTimeHrs = arg
})
ipcMain.on('arrivalTimeMin', (event, arg) => {
  t.arrivalTimeMinutes = arg
})
ipcMain.on('departTimeHrs', (event, arg) => {
  t.departureTimeHrs = arg
})
ipcMain.on('departTimeMin', (event, arg) => {
  t.departureTimeMinutes = arg
})

input.on('changedBlock', (m, data) => { // change input message when integrated
  updateBlockOccupancy(data)
})