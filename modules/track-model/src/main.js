const { app, BrowserWindow } = require('electron')
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

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  // Open the DevTools.
  if (isDev) {
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// class TrackLine {
//   constructor (name) {
//     this.name = name
//   }
// }

// class Block {
//   constructor (blockNum, length, grade, elevation, isBidirectional, speedLimit) {
//     this.blockNum = blockNum
//     this.length = length
//     this.grade = grade
//     this.elevation = elevation
//     this.isBidirecitonal = isBidirectional
//     this.speedLimit = speedLimit

//     this.isOpen = true
//     this.isOccupied = false
//     this.hasSwitch = false
//     this.hasStation = false
//     this.hasCrossing = false
//     this.hasTrafficLight = false
//     this.railBroken = false
//     this.circuitBroken = false
//     this.hasPower = true
//     this.heaterStatus = false
//   }

//   toggleStatus () {
//     this.isOpen = !this.isOpen
//   }

//   toggleOccupation () {
//     this.isOccupied = !this.isOccupied()
//   }

//   toggleRail () {
//     this.railBroken = !this.railBroken
//   }

//   toggleCircuit () {
//     this.circuitBroken = !this.circuitBroken
//   }

//   togglePower () {
//     this.hasPower = !this.hasPower
//   }

//   toggleHeater () {
//     this.heaterStatus = !this.heaterStatus
//   }
// }

// class Switch {
//   constructor (position, source, op1, op2) {
//     this.position = position
//     this.source = source
//     this.op1 = op1
//     this.op2 = op2
//   }

//   togglePosition () {
//     this.position = !this.position
//     // if(position = false){
//     //   return this.op1;
//     // }
//     // else{
//     //   return this.op2;
//     // }
//   }
// }

// function sleep (ms) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }

// function demo () {
//   // create the blue line with a switch at blocks 5-6/5-11
//   const blueLine = new TrackLine('Blue Line')
//   const blueBlocks = []
//   const blueSwitch = new Switch(false, 5, 6, 11)

//   for (let i = 0; i < 16; i++) {
//     blueBlocks[i] = new Block(i, 50, 0, 0, true, 50)
//     if (i == 5) {
//       blueBlocks[i].hasSwitch = true
//     }
//   }

//   // yard to station B and back
//   blueBlocks[0].toggleOccupation
//   for (let i = 1; i < 11; i++) {
//     blueBlocks[i].toggleOccupation()
//     blueBlocks[i - 1].toggleOccupation()
//     sleep(1000)
//   }
//   for (let i = 11; i > 0; i--) {
//     blueBlocks[i].toggleOccupation()
//     blueBlocks[i - 1].toggleOccupation()
//     sleep(1000)
//   }

//   // yard to station c and back
//   blueSwitch.togglePosition()
//   blueBlocks[0].toggleOccupation
//   for (let i = 1; i < 11; i++) {
//     if (i == blueSwitch.source) {
//       blueBlocks[blueSwitch.source].toggleOccupation
//       blueBlocks[blueSwithc.op2].toggleOccupation
//       sleep(1000)
//     } else {
//       blueBlocks[i].toggleOccupation()
//       blueBlocks[i - 1].toggleOccupation()
//       sleep(1000)
//     }
//   }
//   for (let i = 11; i > 0; i--) {
//     if (i == blueSwitch.op2) {
//       blueBlocks[blueSwitch.source].toggleOccupation
//       blueBlocks[blueSwithc.op2].toggleOccupation
//       sleep(1000)
//     } else {
//       blueBlocks[i].toggleOccupation()
//       blueBlocks[i - 1].toggleOccupation()
//       sleep(1000)
//     }
//   }
// }
