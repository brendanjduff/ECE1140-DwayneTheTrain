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

class TrackLine {
  constructor(name){
    this.name = name
    this.blocks = []
    this.switches = {}
  }
}

class Block{
  constructor(blockNum,length,grade,elevation,isBidirectional,speedLimit){
    this.blockNum = blockNum;
    this.length = length;
    this.grade = grade;
    this.elevation = elevation;
    this.isBidirecitonal = isBidirectional;
    this.speedLimit = speedLimit;

    this.isOpen = true;
    this.isOccupied = false;
    this.hasSwitch = false;
    this.hasStation = false;
    this.hasCrossing = false;
    this.hasTrafficLight = false;
    this.railBroken = false;
    this.circuitBroken = false;
    this.hasPower = true;
    this.heaterStatus = false;
  }
  toggleStatus(){
    this.isOpen = !this.isOpen;
  }
  toggleOccupation(){
    this.isOccupied = !this.isOccupied;
  }
  resetOccupation(){
    this.isOccupied = false;
  }
  toggleRail(){
    this.railBroken = !this.railBroken;
  }
  toggleCircuit(){
    this.circuitBroken = !this.circuitBroken;
  }
  togglePower(){
    this.hasPower = !this.hasPower;
  }
  toggleHeater(){
    this.heaterStatus = !this.heaterStatus;
  }
}


class Switch {
  constructor(position,source,op1,op2,beaconM){
    this.position = position;
    this.source = source;
    this.op1 = op1;
    this.op2 = op2;
    this.beaconM = beaconM
  }

  getNextBlock() {
    if (!this.position) {
      return this.op1
    }
    else {
      return this.op2
    }
  }

  togglePosition(){
    this.position = !this.position;
  }
}

function sendBeacon(blockI){
  return blockI.beaconM
}
/*
function resetBlocks(){
  for(let i = 0; i < greenBlocks.size(); i++){
    greenBlocks[i].resetOccupation();
  }
}*/

function parseCSV(input) {
  var rows = input.split(/\r?\n/);
  var keys = rows.shift().split(",");
  return rows.map(function(row) {
      return row.split(",").reduce(function(map, val, i) {
          map[keys[i]] = val;
          return map;
      }, {});
  });
}
//=====================================================================================================
//console.log(parseCSV('D:/Documents/CodingPortfolio/electron-project-setup/my-app/csvtester.csv'))

var greenLine = new TrackLine('Green Line');

for(let i = 0; i<151; i++){
  greenLine.blocks[i] = new Block(i,50,0,0,true,30)
}

greenLine.blocks[12].hasSwitch = true
greenLine.switches[12] = new Switch(false,12,1,13)
greenLine.blocks[29].hasSwitch = true
greenLine.switches[29] = new Switch(false,29,30,150)
greenLine.blocks[58].hasSwitch = true
greenLine.switches[58] = new Switch(false,57,0,62)
greenLine.blocks[62].hasSwitch = true
greenLine.switches[62] = new Switch(false,62,0,63)
greenLine.blocks[76].hasSwitch = true
greenLine.switches[76] = new Switch(false,76,77,101)
greenLine.blocks[85].hasSwitch = true
greenLine.switches[85] = new Switch(false,85,86,100)

greenLine.blocks[2].hasStation = true
greenLine.blocks[9].hasStation = true
greenLine.blocks[22].hasStation = true
greenLine.blocks[31].hasStation = true
greenLine.blocks[39].hasStation = true
greenLine.blocks[48].hasStation = true
greenLine.blocks[57].hasStation = true
greenLine.blocks[65].hasStation = true
greenLine.blocks[73].hasStation = true
greenLine.blocks[77].hasStation = true
greenLine.blocks[88].hasStation = true
greenLine.blocks[96].hasStation = true
greenLine.blocks[105].hasStation = true
greenLine.blocks[114].hasStation = true
greenLine.blocks[123].hasStation = true
greenLine.blocks[132].hasStation = true
greenLine.blocks[141].hasStation = true
// for(let i = 0; i<16; i++){
//   greenLine.blocks[i] = new Block(i,50,0,0,true,50);
//   if(i === 5){
//     greenLine.blocks[i].hasSwitch = true;
//   }
//   if(i === 10 || i === 15){
//     greenLine.blocks[i].hasStation = true;
//   }
// }

const messenger = require('messenger')
const input = messenger.createListener(8004)
const watchdog = messenger.createSpeaker(8000)
const trainModel = messenger.createSpeaker(8005)

trainsList = []
trainsDict = []

class Train {
  constructor(id) {
    this.trainId = id
    this.position = 0
    this.block = 0
  }

  updatePosition(dx) {
    this.position += dx
    if (this.position > greenLine.blocks[this.block].length) {
      this.position -= greenLine.blocks[this.block].length
      this.block++
    }
  }

  getMessage() {
    return {
      id: this.trainId,
      boardingPax: 0,
      speedCmd: 45, //temp
      authorityCmd: 10, //temp
      station: '', 
      rightPlatform: false,
      leftPlatform: false,
      underground: false,
      grade: 0
    }
  }
}

input.on('clock1', (m, data) => { // change to when received from wayside
  trainModel.shout("trackModel", trainsList.map((t) => t.getMessage()))
})

input.on('trainModel', (m, data) => {
  greenLine.blocks.forEach((b) => {
    b.isOccupied = false
  })
  data.forEach((t) => {
    const id = t.id
    trainsDict[id].updatePosition(t['distance'])
    console.log(id + " moved "+t['distance'])
  })
  trainsList.forEach((t) => {
    greenLine.blocks[t.block].isOccupied = true
  })
  // send to wayside
})

input.on('createTrain', (m, data) => {
  const newTrain = new Train(data)
  trainsList.push(newTrain)
  trainsDict[newTrain.trainId] = newTrain
})

ipcMain.on('requestData', (event, arg) => { event.reply('fetchData', { ready: true, greenLine: greenLine }) })
setInterval(() => { watchdog.shout('trackModel', true) }, 100)
