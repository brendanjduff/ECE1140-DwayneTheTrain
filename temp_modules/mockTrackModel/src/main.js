const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev')
import TrainModelInterface from './TrainModelInterface';
import { mphToMs, fromKilo } from './UnitConversion'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 350,
    height: 800,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (isDev) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }
  mainWindow.removeMenu()
  mainWindow.setResizable(false)
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

var messenger = require('messenger')
var input = messenger.createListener(8004)
var watchdog = messenger.createSpeaker(8000)
const trainModel = messenger.createSpeaker(8005)

setInterval(() => { watchdog.shout('trackModel', true)}, 100)

let trainsList = []
let trainsDict = []
let selTrainId = 1

function createTrain (id) {
  const newTrain = new TrainModelInterface(id)
  if(trainsList.length === 0) {
    selTrainId = id
  }
  trainsList.push(newTrain)
  trainsDict[id] = newTrain
}

input.on('createTrain', (m, data) => {
  createTrain(data)
}) 

// UX IPC
ipcMain.on('request', (event, arg) => { event.reply('fetch', { sel: trainsDict[selTrainId], trains: trainsList }) })
ipcMain.on('selectTrain', (event, arg) => { selTrainId = arg })

ipcMain.on('setSpeedCmd', (event, arg) => { trainsDict[selTrainId].intf.inputs.speedCmd = mphToMs(arg) })
ipcMain.on('setAuthority', (event, arg) => { trainsDict[selTrainId].intf.inputs.authorityCmd = arg })
ipcMain.on('setBeacon', (event, arg) => {
  trainsDict[selTrainId].intf.inputs.station = arg.station
  trainsDict[selTrainId].intf.inputs.leftPlatform = arg.leftPlatform
  trainsDict[selTrainId].intf.inputs.rightPlatform = arg.rightPlatform
  trainsDict[selTrainId].intf.inputs.underground = arg.underground
})
ipcMain.on('setPassengers', (event, arg) => {
  trainsDict[selTrainId].intf.inputs.boardingPax = Math.round(arg)
})
ipcMain.on('setGrade', (event, arg) => { trainsDict[selTrainId].intf.inputs.grade = arg / 100 })

input.on('clock1', (m, data) => {
  trainModel.shout('trackModel', trainsList.map((t) => t.intf.inputs))
  trainsList.forEach((t) => { t.intf.inputs.boardingPax = 0 })
})

input.on('trainModel', (m,data) => {
  data.forEach(t => {
    const id = t.id
    trainsDict[id].intf.outputs.distance = t['distance']
    trainsDict[id].intf.outputs.maxBoardingPax = t['maxBoardingPax']
    trainsDict[id].intf.outputs.deboardingPax = t['deboardingPax']
  })
})