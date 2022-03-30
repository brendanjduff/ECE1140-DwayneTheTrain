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
    width: 350,
    height: 200,
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

const trains = []
let id = 1

const messenger = require('messenger')
const watchdog = messenger.createSpeaker(8000)
const trackModel = messenger.createSpeaker(8004)
const trainModel = messenger.createSpeaker(8005)
const controllerSW = messenger.createSpeaker(8006)

setInterval(() => { watchdog.shout('ctc', true) }, 100)

ipcMain.on('request', (event, arg) => { event.reply('fetch', trains) })

ipcMain.on('setNewId', (event, arg) => { id = arg })

ipcMain.on('createTrain', (event, arg) => {
  if (!trains.includes(id)) {
    trackModel.shout('createTrain', id)
    trainModel.shout('createTrain', { id: id, hw: false })
    controllerSW.shout('createTrain', id)
    trains.push(id)
  }
})
