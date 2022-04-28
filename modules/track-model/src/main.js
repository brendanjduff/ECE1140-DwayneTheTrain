const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs');
const { parse } = require('fast-csv');

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
    this.stations = {}
    this.crossings = {}
    
    this.heaterStatus = false;
    this.envTemp = 72

    this.totalPax = 0;
  }
  
  toggleHeater(){
    this.heaterStatus = !this.heaterStatus;
  }
  setTemp(num){
    this.envTemp = num
  }
}

class Block{
  constructor(blockNum,length,grade,isBidirectional,nextBlock,prevBlock,op2,
                speedLimit,hasSwitch,hasStation,hasCrossing,isUnderground){
    this.blockNum = blockNum;
    this.length = length;
    this.grade = grade;
    this.isBidirecitonal = isBidirectional;
    this.nextBlock = nextBlock
    this.op2 = op2
    this.prevBlock = prevBlock
    this.speedLimit = speedLimit
    this.hasSwitch = hasSwitch
    this.hasStation = hasStation
    this.hasCrossing = hasCrossing
    this.isUnderground = isUnderground


    this.isOpen = true;
    this.isOccupied = false;
    this.railBroken = false;
    this.circuitBroken = false;
    this.hasPower = true;

    this.speedCmd = 0
    this.authCmd = 0
    
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
    console.log('toggling rail status')
    this.railBroken = !this.railBroken;
  }
  toggleCircuit(){
    this.circuitBroken = !this.circuitBroken;
  }
  togglePower(){
    this.hasPower = !this.hasPower;
  }

}

class Switch {
  constructor(position,edir,source,sdir,op1,dir1,op2,dir2){
    this.position = position;
    this.source = source;
    this.edir = edir
    this.sdir = sdir
    this.op1 = op1;
    this.dir1 = dir1
    this.op2 = op2;
    this,dir2 = dir2
  }

  getNextBlock(b) {
    if (!this.position) {
      if(this.op1 === b) {
        return this.source
      }
      return this.op1
    }
    else {
      if(this.op2 === b) {
        return this.source
      }
      return this.op2
    }
  }

  getNextDir(b) {
    if (!this.position) {
      if(this.op1 === b) {
        return this.sdir
      }
      return this.dir1
    }
    else {
      if(this.op1 === b) {
        return this.sdir
      }
      return this.dir2
    }
  }

  togglePosition(){
    this.position = !this.position;
  }
}

class Station {
  constructor(blockNum,name,lDoor,rDoor){
    this.blockNum = blockNum
    this.name = name
    this.lDoor = lDoor
    this.rDoor = rDoor
    this.boardingPax = 0
  }

  sellTix(){
    this.boardingPax = Math.floor(Math.random()*20)
    return this.boardingPax
  }
}

class Crossing {
  constructor(blockNum,pos){
    this.blockNum = blockNum
    this.pos = pos
  }

  changePos(){
    this.pos = !this.pos
  }
}

class Beacon {
  constructor(station,leftPlatform,rightPlatform,underground){
    this.station = station
    this.leftPlatform = leftPlatform
    this.rightPlatform = rightPlatform
    this.underground = underground
  }
}


var greenLine = new TrackLine('Green Line')
    fs.createReadStream(path.resolve(__dirname, 'GreenLine.csv'))
      .pipe(parse({ headers: true }))
      .on('error', error => console.error(error))
      .on('data', row => {
        //console.log(row);
        //each row can be written to db
        let i = row.BlockNumber
        greenLine.blocks[i-1] = new Block(i, row.BlockLength,row.BlockGrade,row.isBidirecitonal,row.NextBlock, row.PrevBlock,row.Op2,row.SpeedLimit,row.switchF,row.stationF,row.crossingF,row.underground)
        if(row.switchF === 'TRUE'){
          greenLine.blocks[i-1].hasSwitch = true
          greenLine.switches[i-1] = new Switch(false,true,i,true,row.NextBlock,true,row.Op2,true)
        }
        if(row.stationF === 'TRUE'){
          greenLine.blocks[i-1].hasStation = true
          greenLine.stations[i-1] = new Station(i-1,row.station,row.lDoor,row.rDoor)
        }
        if(row.crossingF === 'TRUE'){
          greenLine.blocks[i-1].hasCrossing = true
        }
      })
      .on('end', rowCount => {
          console.log(`Parsed ${rowCount} rows`);
      });
var redLine = new TrackLine('Red Line')
    fs.createReadStream(path.resolve(__dirname, 'RedLine.csv'))
    .pipe(parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => {
        //console.log(row);
        //each row can be written to db
        let i = row.BlockNumber
        redLine.blocks[i-1] = new Block(i, row.BlockLength,row.BlockGrade,row.isBidirecitonal,row.NextBlock,row.PrevBlock,row.Op2,row.SpeedLimit,row.switchF,row.stationF,row.crossingF,row.underground)
        if(row.switchF === 'TRUE'){
          redLine.blocks[i-1].hasSwitch = true
          redLine.switches[i-1] = new Switch(false,false,i,false,i+1,false,i+1,false,'')
        }
        if(row.stationF === 'TRUE'){
          redLine.blocks[i-1].hasStation = true
          redLine.stations[i-1] = new Station(i-1,row.station,row.lDoor,row.rDoor)
        }
        if(row.crossingF === 'TRUE'){
          redLine.blocks[i-1].hasCrossing = true
        }
    })
    .on('end', rowCount => {
        console.log(`Parsed ${rowCount} rows`);
    });

//=====================================================================================================

const messenger = require('messenger')
const input = messenger.createListener(8004)
const watchdog = messenger.createSpeaker(8000)
const trainModel = messenger.createSpeaker(8005)
const wayside = messenger.createSpeaker(8002)
const ctc = messenger.createSpeaker(8001)

trainsListRed = []
trainsDictRed = []
trainsListGreen = []
trainsListGreen = []

class Train {
  constructor(id) {
    this.trainId = id
    this.position = 0
    this.block = 63
    this.direction = true
    this.station = ''
    this.underground = false
    this.leftPlatform = false
    this.rightPlatform = false
    this.boardingPax = 0
  }

  updatePosition(dx) {
    this.position += dx
    if (this.position > greenLine.blocks[this.block].length) {
      this.position -= greenLine.blocks[this.block].length
      //check switch
      if(greenLine.blocks[this.block].hasSwitch) {
        if(this.direction = greenLine.switches[this.block].edir) {
          this.direction = greenLine.switches[this.block].getNextDir(this.block)
          this.block = greenLine.switches[this.block].getNextBlock(this.block)
        }
        else if (this.direction) {
          this.direction = greenLine.blocks[this.block].nextDirF
          this.block = greenLine.blocks[this.block].nextBlockF
        }
        else {
          this.direction = greenLine.blocks[this.block].nextDirR
          this.block = greenLine.blocks[this.block].nextBlockR
        }
      }
      else if (this.direction) {
        this.direction = greenLine.blocks[this.block].nextDirF
        this.block = greenLine.blocks[this.block].nextBlockF
      }
      else {
        this.direction = greenLine.blocks[this.block].nextDirR
        this.block = greenLine.blocks[this.block].nextBlockR
      }
    }
    if (greenLine.blocks[this.block].hasBeacon) {
      this.station = greenLine.blocks[this.block].beacon.station
      this.underground = greenLine.blocks[this.block].beacon.underground
      this.leftPlatform = greenLine.blocks[this.block].beacon.leftPlatform
      this.rightPlatform = greenLine.blocks[this.block].beacon.rightPlatform
    } else {
      this.station = ''
      this.leftPlatform = false
      this.rightPlatform = false
      this.underground = false
    }
  }
  updatePassengers(pax, max, deboard) {
    if(max > 0) {
      this.boardingPax = Math.min(greenLine.stations[this.block].sellTix(), max);
    } else {
      this.boardingPax = 0;
    }
  }

  getMessage() {
    return {
      id: this.trainId,
      boardingPax: this.boardingPax,
      speedCmd: greenLine.blocks[this.block].speedCmd,
      authorityCmd: greenLine.blocks[this.block].authCmd,
      station: this.station, 
      rightPlatform: this.rightPlatform,
      leftPlatform: this.leftPlatform,
      underground: this.underground,
      grade: greenLine.blocks[this.block].grade
    }
  }
}


input.on('wayside', (m, data) => { 
  greenLine.blocks.forEach((b) => {
    b.speedCmd = data.greenLineSpeed[b.blockNum]
    b.authCmd = data.greenLineAuth[b.blockNum]
    b.switches = data.greenLineSwitches
    b.lights = data.greenLineLights
    b.crossing = data.greenLineCrossings
  })
  redLine.blocks.forEach((b) => {
    b.speedCmd = data.redLineSpeed[b.blockNum]
    b.authCmd = data.redLineAuth[b.blockNum]
    b.switches = data.redLineSwitches
    b.lights = data.redLineLights
    b.crossing = data.redLineCrossings
  }) // switch data is not yet sent from wayside

trainModel.shout("trackModel", trainsList.map((t) => t.getMessage()))
})

input.on('trainModel', (m, data) => {
  greenLine.blocks.forEach((b) => {
    b.isOccupied = false
  })
  redLine.blocks.forEach((b) => {
    b.isOccupied = false
  })
  data.forEach((t) => {
    const id = t.id
    trainsDictRed[id].updatePosition(t['distance'])
    trainsDictRed[id].updatePassengers(t['passengers'], t['maxBoardingPax'], t['deboardingPax'])
    trainsDictGreen[id].updatePosition(t['distance'])
    trainsDictGreen[id].updatePassengers(t['passengers'], t['maxBoardingPax'], t['deboardingPax'])
  })
  trainsList.forEach((t) => {
    greenLine.blocks[t.block].isOccupied = true
    redLine.blocks[t.block].isOccupied = true
  })
  wayside.shout("trackModel", { greenLine: greenLine.blocks, redLine: redLine.blocks})
  ctc.shout("trackModel",{greenLine: greenLine.totalPax, redLine: redLine.totalPax})
})

input.on('createTrain', (m, data) => {
  const newTrain = new Train(data.id)
  if(data.line){
    trainsListGreen.push(newTrain)
    trainsDictGreen[newTrain.trainId] = newTrain
  }
  else{
    trainsListRed.push(newTrain)
    trainsDictRed[newTrain.trainId] = newTrain
  }
})

ipcMain.on('requestData', (event, arg) => { event.reply('fetchData', { ready: true, greenLine: greenLine, redLine: redLine }) })
ipcMain.on('EnvironmentTemp',(event,arg) => {greenLine.setTemp(arg);redLine.setTemp(arg)})
ipcMain.on('toggleRail',(event,arg)=>{greenLine.blocks[arg-1].toggleRail()})
ipcMain.on('toggleCircuit',(event,arg)=>{greenLine.blocks[arg-1].toggleCircuit()})
ipcMain.on('togglePower',(event,arg)=>{greenLine.blocks[arg-1].togglePower()})
setInterval(() => { watchdog.shout('trackModel', true) }, 100)
