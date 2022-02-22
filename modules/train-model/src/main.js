import { mphToMs } from './UnitConversion'
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

class Train {
  constructor () {
    // State of Train
    this.trainId = nextId
    this.authority = 0 // blocks
    this.velocity = 0 // m/s
    this.speedCmd = 0 // m/s
    this.acceleration = 0 // m/s^2
    this.power = 0 // Watts
    this.leftDoorsOpen = false
    this.rightDoorsOpen = false
    this.lightsOn = false
    this.temp = 68 // Fahrenheit
    this.stationName = ''
    this.rightPlatform = false
    this.leftPlatform = false
    this.underground = false
    this.crew = 0
    this.passengers = 0
    this.maxPassengers = 222
    this.engineFailure = false
    this.brakeFailure = false
    this.signalFailure = false
    this.length = 32.2 // m
    this.height = 3.42 // m
    this.width = 2.65 // m
    this.baseMass = 41550 // kg
    this.paxMass = 72.5 // kg

    // Inputs
    this.inputPower = 0
    this.inputTemp = 68
    this.inputRightDoors = false
    this.inputLeftDoors = false
    this.inputLights = false
    this.inputEBrake = false
    this.inputSBrake = false
    this.inputSpeedCmd = 0
    this.inputAuthority = 0
    this.inputStationName = ''
    this.inputRightPlatform = false
    this.inputLeftPlatform = false
    this.inputUnderground = false
    this.inputBoardingPax = 0
    this.inputEngineFailure = false
    this.inputBrakeFailure = false
    this.inputSignalFailure = false

    // Outputs
    this.outputSpeedCmd = 0
    this.outputAuthorityCmd = 0
    this.outputStationName = ''
    this.outputRightPlatform = false
    this.outputLeftPlatform = false
    this.outputUnderground = false
    this.outputDistanceTravelled = 0
    this.outputOpenPaxCap = 0
    this.outputDeboardingPax = 0
  }

  update (dt) {
    // Failure Modes
    this.engineFailure = this.inputEngineFailure
    this.brakeFailure = this.inputBrakeFailure
    this.signalFailure = this.inputSignalFailure

    // Inputs
    this.power = this.inputPower
    this.leftDoorsOpen = this.inputLeftDoors
    this.rightDoorsOpen = this.inputRightDoors
    this.lightsOn = this.inputLights
    this.temp = this.inputTemp
    this.speedCmd = this.inputSpeedCmd
    this.authority = this.inputAuthority
    this.stationName = this.inputStationName
    this.rightPlatform = this.inputRightPlatform
    this.leftPlatform = this.inputLeftPlatform
    this.underground = this.inputUnderground
    // boarding pax

    // Train Motion
    const lastA = this.acceleration
    const lastV = this.velocity
    const mass = this.baseMass + (this.paxMass * this.passengers)
    if (this.inputEBrake) {
      this.acceleration = -2.73
    } else if (this.inputSBrake) {
      this.acceleration = -1.2
    } else {
      this.acceleration = (lastV > 0 ? (this.power / lastV * mass) : 0.5)
    }
    this.acceleration = (this.acceleration > 0.5 ? 0.5 : this.acceleration)
    this.velocity = lastV + (dt / 2) * (this.acceleration + lastA)
    this.velocity = (this.velocity < 0 ? 0 : this.velocity)

    // Outputs
    this.outputSpeedCmd = this.outputSpeedCmd
    this.outputAuthorityCmd = this.authority
    this.outputStationName = this.stationName
    this.outputRightPlatform = this.rightPlatform
    this.outputLeftPlatform = this.leftPlatform
    this.outputUnderground = this.Underground
    this.outputDistanceTravelled = this.velocity * dt
    this.outputOpenPaxCap = this.maxPassengers - this.passengers
    // deboarding pax
  }
}

// System Management
let selectedTrain = 1
let enableClock = false
let simulationTime = 0
let timeMultiplier = 1
let lastTime = Date.now() / 1000

function updateTrains () {
  const now = Date.now() / 1000
  const dt = (now - lastTime) * timeMultiplier
  if(dt > 0.25) {
    if (enableClock) {
      simulationTime += dt
      trainsList.forEach(t => { t.update(dt) })
    }
    lastTime = now
  }
}

setInterval(() => { updateTrains() }, 10)

// General IPC
ipcMain.on('requestData', (event, arg) => {
  event.reply('fetchData', { sel: trainsDict[selectedTrain], trains: trainsList })
})

ipcMain.on('selectTrain', (event, arg) => {
  selectedTrain = arg
})

ipcMain.on('createTrain', (event, arg) => {
  const newTrain = new Train()
  nextId += 1
  trainsList.push(newTrain)
  trainsDict[newTrain.trainId] = newTrain
})

ipcMain.on('setClock', (event, arg) => { enableClock = arg })

ipcMain.on('setMult', (event, arg) => { timeMultiplier = arg })

ipcMain.on('requestTiming', (event, arg) => {
  event.reply('fetchTiming', { clock: enableClock, mult: timeMultiplier, time: simulationTime })
})

// Train Update IPC
ipcMain.on('setEngineFailure', (event, arg) => { trainsDict[selectedTrain].inputEngineFailure = arg })
ipcMain.on('setBrakeFailure', (event, arg) => { trainsDict[selectedTrain].inputBrakeFailure = arg })
ipcMain.on('setSignalFailure', (event, arg) => { trainsDict[selectedTrain].inputSignalFailure = arg })
ipcMain.on('setPower', (event, arg) => { trainsDict[selectedTrain].inputPower = arg / 1000000 })
ipcMain.on('setEmergencyBrake', (event, arg) => { trainsDict[selectedTrain].inputEBrake = arg })
ipcMain.on('setServiceBrake', (event, arg) => { trainsDict[selectedTrain].inputSBrake = arg })
ipcMain.on('setLeftDoors', (event, arg) => { trainsDict[selectedTrain].inputLeftDoors = arg })
ipcMain.on('setRightDoors', (event, arg) => { trainsDict[selectedTrain].inputRightDoors = arg })
ipcMain.on('setLights', (event, arg) => { trainsDict[selectedTrain].inputLights = arg })
ipcMain.on('setTemperature', (event, arg) => { trainsDict[selectedTrain].inputTemp = arg })
ipcMain.on('setSpeedCmd', (event, arg) => { trainsDict[selectedTrain].inputSpeedCmd = mphToMs(arg) })
ipcMain.on('setAuthority', (event, arg) => { trainsDict[selectedTrain].inputAuthority = arg })

// FOR DEBUGGING ONLY
ipcMain.on('null', (event, arg) => { console.log('A component is passing messages on the wrong channel') })
