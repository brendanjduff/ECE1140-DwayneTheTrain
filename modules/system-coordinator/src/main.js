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
    width: 300,
    height: 500,
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
  mainWindow.setResizable(false)
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

const messenger = require('messenger')

// create speakers to broadcast clock signal to all modules
const ctcSpeaker = messenger.createSpeaker(8001)
const waysideSWSpeaker = messenger.createSpeaker(8002)
const waysideHWSpeaker = messenger.createSpeaker(8003)
const trackModelSpeaker = messenger.createSpeaker(8004)
const trainModelSpeaker = messenger.createSpeaker(8005)
const controllerSWSpeaker = messenger.createSpeaker(8006)
const controllerHWSpeaker = messenger.createSpeaker(8007)

// broadcasts the clock signal to each module
function broadcast (channel, data = {}) {
  ctcSpeaker.shout(channel, data)
  waysideSWSpeaker.shout(channel, data)
  waysideHWSpeaker.shout(channel, data)
  trackModelSpeaker.shout(channel, data)
  trainModelSpeaker.shout(channel, data)
  controllerSWSpeaker.shout(channel, data)
  controllerHWSpeaker.shout(channel, data)
}

// variables that track the current simulation time
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

// sends out the two cycle clock signal at half the given frequency
setInterval(() => {
  if (clockEnable) {
    if (input) {
      broadcast('clock1')
      input = false
    } else {
      now = Date.now() / 1000
      const dt = (now - last) * multiplier
      last = now
      simTime += dt
      broadcast('clock2', { dt: dt })
      input = true
    }
  }
}, 1000 / frequency)

// Set the time multiplier when set by the user
ipcMain.on('setMult', (event, arg) => { multiplier = arg })

// Sends timing information to the render process for display
ipcMain.on('requestTiming', (event, arg) => {
  event.reply('fetchTiming', { clock: clockEnable, mult: multiplier, time: simTime })
})

// create a listener to track module connectivity
const watchdog = messenger.createListener(8000)

// track the last time each module was updated and whether it is responding more frequency than the watchdog timeout
const moduleLastUpdate = { ctc: 0, waysideHW: 0, waysideSW: 0, trackModel: 0, trainModel: 0, controllerHW: 0, controllerSW: 0 }
const moduleState = { ctc: false, waysideHW: false, waysideSW: false, trackModel: false, trainModel: false, controllerHW: false, controllerSW: false }

// When the watchdog receives a message, update the last update time for the module it came from
watchdog.on('ctc', (m, data) => {
  moduleLastUpdate.ctc = Date.now()
})
watchdog.on('waysideSW', (m, data) => {
  moduleLastUpdate.waysideSW = Date.now()
})
watchdog.on('waysideHW', (m, data) => {
  moduleLastUpdate.waysideHW = Date.now()
})
watchdog.on('trackModel', (m, data) => {
  moduleLastUpdate.trackModel = Date.now()
})
watchdog.on('trainModel', (m, data) => {
  moduleLastUpdate.trainModel = Date.now()
})
watchdog.on('controllerSW', (m, data) => {
  moduleLastUpdate.controllerSW = Date.now()
})
watchdog.on('controllerHW', (m, data) => {
  moduleLastUpdate.controllerHW = Date.now()
})

// Constants for the timeout and update frequency of the watchdog
const watchdogTimeout = 250
const watchdogFrequency = 100

// Updates module status at the given frequency
setInterval(() => {
  now = Date.now()
  if (now - moduleLastUpdate.ctc > watchdogTimeout) { moduleState.ctc = false } else { moduleState.ctc = true }
  if (now - moduleLastUpdate.waysideSW > watchdogTimeout) { moduleState.waysideSW = false } else { moduleState.waysideSW = true }
  if (now - moduleLastUpdate.waysideHW > watchdogTimeout) { moduleState.waysideHW = false } else { moduleState.waysideHW = true }
  if (now - moduleLastUpdate.trackModel > watchdogTimeout) { moduleState.trackModel = false } else { moduleState.trackModel = true }
  if (now - moduleLastUpdate.trainModel > watchdogTimeout) { moduleState.trainModel = false } else { moduleState.trainModel = true }
  if (now - moduleLastUpdate.controllerSW > watchdogTimeout) { moduleState.controllerSW = false } else { moduleState.controllerSW = true }
  if (now - moduleLastUpdate.controllerHW > watchdogTimeout) { moduleState.controllerHW = false } else { moduleState.controllerHW = true }
}, 1000 / watchdogFrequency)

// Sends watchdog status to the renderer process upon request
ipcMain.on('requestWatchdog', (event, arg) => {
  event.reply('fetchWatchdog', moduleState)
})
