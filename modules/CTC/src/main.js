import Train from './Train'
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

// Create Train
const trainList = []
let createTrainID = 1
let t = new Train()
let isHardware = false
let hwDispatch = false
const occupancyListGreenLine = []
const occupancyListRedLine = []

// UX IPC
ipcMain.on('requestData', (event, arg) => { event.reply('fetchData', {t: t, list: trainList}) })
/* block = t.blockNum,
  arrivalHrs =  t.arrivalTimeHrs,
  arrivalMin = t.arrivalTimeMinutes,
  departureHrs = t.departureTimeHrs,
  departureMin = t.departureTimeMinutes,
  speed = t.speed,
  authority = t.authority,
  destination = t.destination */

function updateBlockOccupancy (data) {
  /* let occupied = 0
  for (let i = 0; i < data.length; i++) {
    if(data[i]) {
      occupied = i+1

    }
  } */
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
  t.trainId = createTrainID
  t.isDispatched = true
  t.Destination = 'Dormont' // remove
  t.calculateSpeedAuth()
  trackModel.shout('createTrain', createTrainID) // send line (red/green)
  waysideHW.shout('createTrain', t)
  waysideSW.shout('createTrain', t)
  trainModel.shout('createTrain', { id: createTrainID, hw: (hwDispatch ? false : isHardware) })
  if(isHardware) { hwDispatch = true }
  controllerSW.shout('createTrain', createTrainID)
  trainList[createTrainID] = t
  t = new Train()
  createTrainID += 1
})

//changes in time from the schedule
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

//changes in block occupancy
input.on('changedBlock', (m, data) => { // change input message when integrated
  updateBlockOccupancy(data)
})

//Getting destination in manual mode
input.on('destination', (m, data) => {
  t.destination = data
})

//Make train hardware or software
input.on('hw', (m, data) => {
  isHardware = data
})

const redLineAuthority = new Array(76).fill(3)
const redLineSpeed = [
  11.1, 11.1, 11.1, 11.1, 11.1, 4.5, 4.5, 4.5, 11.1, 11.1, 11.1, 11.1, 11.1, 11.1, 4.5, 4.5, 4.5, 19.4, 19.4, 4.5, 4.5, 4.5, 15.3, 4.5, 4.5, 4.5, 19.4, 19.4, 19.4, 19.4, 19.4, 19.4, 19.4, 4.5, 4.5, 4.5, 19.4, 19.4, 19.4, 19.4, 19.4, 19.4, 19.4, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 16.7, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 4.5, 4.5, 4.5, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3
]
const greenLineAuthority = new Array(150).fill(3)
const greenLineSpeed = [
  4.5, 4.5, 4.5, 12.5, 12.5, 12.5, 12.5, 4.5, 4.5, 4.5, 12.5, 12.5, 19.4, 19.4, 4.5, 4.5, 4.5, 16.7, 16.7, 16.7, 4.5, 4.5, 4.5, 19.4, 19.4, 19.4, 8.3, 8.3, 8.3, 4.5, 4.5, 4.5, 8.3, 8.3, 8.3, 8.3, 8.3, 4.5, 4.5, 4.5, 8.3, 8.3, 8.3, 8.3, 8.3, 8.3, 4.5, 4.5, 4.5, 8.3, 8.3, 8.3, 8.3, 8.3, 8.3, 4.5, 4.5, 4.5, 8.3, 8.3, 8.3, 8.3, 19.4, 4.5, 4.5, 4.5, 11.1, 11.1, 11.1, 11.1, 11.1, 4.5, 4.5, 4.5, 11.1, 4.5, 4.5, 4.5, 19.4, 19.4, 19.4, 19.4, 19.4, 19.4, 19.4, 6.9, 4.5, 4.5, 4.5, 6.9, 6.9, 6.9, 6.9, 6.9, 4.5, 4.5, 4.5, 6.9, 6.9, 6.9, 7.2, 7.8, 7.8, 4.5, 4.5, 4.5, 7.8, 7.8, 7.8, 8.3, 8.3, 8.3, 4.5, 4.5, 4.5, 8.3, 4.2, 4.2, 4.2, 4.2, 4.2, 4.5, 4.5, 4.5, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 4.5, 4.5, 4.5, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 4.5, 4.5, 4.5, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6
]

input.on('clock1', (m, data) => {
  waysideSW.shout('ctc', { greenLineSpeed: greenLineSpeed, greenLineAuth: greenLineAuthority, redLineSpeed: redLineSpeed, redLineAuth: redLineAuthority })
})
