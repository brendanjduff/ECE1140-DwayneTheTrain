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
    this.corssings = {}
  }
}

class Block{
  constructor(blockNum,length,grade,isBidirectional,nextBlockF,nextDirF,nextBlockR,nextDirR,speedLimit,hasBeacon){
    this.blockNum = blockNum;
    this.length = length;
    this.grade = grade;
    this.isBidirecitonal = isBidirectional;
    this.nextBlockF = nextBlockF
    this.nextDirF = nextDirF
    this.nextBlockR = nextBlockR
    this.nextDirR = nextDirR
    this.speedLimit = speedLimit
    this.hasBeacon = hasBeacon

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

    this.speedCmd = 0
    this.authCmd = 0
    
  }
  setBeacon(beacon){
    this.beacon = beacon
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
  constructor(position,edir,source,sdir,op1,dir1,op2,dir2,beaconM){
    this.position = position;
    this.source = source;
    this.edir = edir
    this.sdir = sdir
    this.op1 = op1;
    this.dir1 = dir1
    this.op2 = op2;
    this,dir2 = dir2
    this.beaconM = beaconM
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
  constructor(blockNum,name,lDoor,rDoor,beaconM){
    this.blockNum = blockNum
    this.name = name
    this.lDoor = lDoor
    this.rDoor = rDoor
    this.becaonM = becaonM

    this.boardingPax = 0

    stationBeac = new Beacon(this.name,this.lDoor,this.rDoor,beaconM[3])
  }

  sellTix(){
    this.boardingPax = Math.floor(Math.random()*20)
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

function readInTrack(){
  let rows = [];

  fs.createReadStream(path.resolve(__dirname, 'GreenLine.csv'))
    .pipe(parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => {
        //console.log(row);
        //each row can be written to db
        rows.push(row);
    })
    .on('end', rowCount => {
        console.log(`Parsed ${rowCount} rows`);
    });
  let testLine = new TrackLine("Green Line")
  for(let i = 1; i<rows.length;i++){
    testLine.blocks[i-1] = new Block(rows[i].BlockNumber,
                                    rows[i].blockLength,
                                    rows[i].BlockGrade,
                                    rows[i].isBidirecitonal,
                                    rows[i].NextBlock,
                                    true,
                                    rows[i].NextBlock,
                                    true,
                                    rows[i].SpeedLimit,
                                    false)
    if(rows[i].switch === 'TRUE'){
      testLine.blocks[i-1].hasSwitch = true
      testLine.switches[i-1] = new Switch(false,false,i,false,i+1,false,i+1,false,'')
    }
    if(rows[i].station !== ''){
      testLine.blocks[i-1].hasStation = true
      testline.stations[i-1] = new Station(i-1,rows[i].station,rows[i].lDoor,rows[i].rDoor,)
    }
    if(rows[i].crossing === 'TRUE'){
      testLine.blocks[i-1].hasCrossing = true
    }
  }
  return testLine
}

var greenLine = readInTrack()

/*var greenLine = new TrackLine('Green Line');

  greenLine.blocks[0] = new Block(0,10000000,0,true,0,true,0,true,20)
  greenLine.blocks[1] = new Block(1,100,0.5,false,13,false,13,false,45)
  greenLine.blocks[2] = new Block(2,100,1,false,1,true,1,true,45)
  greenLine.blocks[3] = new Block(3,100,1.5,false,2,true,2,true,45)
  greenLine.blocks[4] = new Block(4,100,2,false,3,true,3,true,45)
  greenLine.blocks[5] = new Block(5,100,3,false,4,true,4,true,45)
  greenLine.blocks[6] = new Block(6,100,4,false,5,true,5,true,45)
  greenLine.blocks[7] = new Block(7,100,5,false,6,true,6,true,45)
  greenLine.blocks[8] = new Block(8,100,0,false,7,true,7,true,45)
  greenLine.blocks[9] = new Block(9,100,-5,false,8,true,8,true,45)
  greenLine.blocks[10] = new Block(10,100,-4.5,false,9,true,9,true,45)

  greenLine.blocks[11] = new Block(11,100,-4,false,10,true,10,true,45)
  greenLine.blocks[12] = new Block(12,100,-3,false,11,true,11,true,45)
  greenLine.blocks[13] = new Block(13,150,0,true,12,true,14,false,70)//
  greenLine.blocks[14] = new Block(14,150,0,true,13,true,15,false,70)//
  greenLine.blocks[15] = new Block(15,150,0,true,14,true,16,false,70)//
  greenLine.blocks[16] = new Block(16,150,0,true,15,true,17,false,70)//
  greenLine.blocks[17] = new Block(17,150,0,true,16,true,18,false,60)//
  greenLine.blocks[18] = new Block(18,150,0,true,17,true,19,false,60)//
  greenLine.blocks[19] = new Block(19,150,0,true,18,true,20,false,60)//
  greenLine.blocks[20] = new Block(20,150,0,true,19,true,21,false,60)//

  greenLine.blocks[21] = new Block(21,300,0,true,20,true,22,false,70)//
  greenLine.blocks[22] = new Block(22,300,0,true,21,true,23,false,70)//
  greenLine.blocks[23] = new Block(23,300,0,true,22,true,24,false,70)//
  greenLine.blocks[24] = new Block(24,300,0,true,23,true,25,false,70)//
  greenLine.blocks[25] = new Block(25,200,0,true,24,true,26,false,70)//
  greenLine.blocks[26] = new Block(26,100,0,true,25,true,27,false,70)//
  greenLine.blocks[27] = new Block(27,50,0,true,26,true,28,false,30)//
  greenLine.blocks[28] = new Block(28,50,0,true,27,true,29,false,30)//
  greenLine.blocks[29] = new Block(29,50,0,false,30,true,30,true,30)
  greenLine.blocks[30] = new Block(30,50,0,false,31,true,31,true,30)

  greenLine.blocks[31] = new Block(31,50,0,true,32,true,32,true,30)
  greenLine.blocks[32] = new Block(32,50,0,true,33,true,33,true,30)
  greenLine.blocks[33] = new Block(33,50,0,true,34,true,34,true,30)
  greenLine.blocks[34] = new Block(34,50,0,true,35,true,35,true,30)
  greenLine.blocks[35] = new Block(35,50,0,true,36,true,36,true,30)
  greenLine.blocks[36] = new Block(36,50,0,true,37,true,37,true,30)
  greenLine.blocks[37] = new Block(37,50,0,true,38,true,38,true,30)
  greenLine.blocks[38] = new Block(38,50,0,true,39,true,39,true,30)
  greenLine.blocks[39] = new Block(39,50,0,true,40,true,40,true,30)
  greenLine.blocks[40] = new Block(40,50,0,true,41,true,41,true,30)

  greenLine.blocks[41] = new Block(41,50,0,false,42,true,42,true,30)
  greenLine.blocks[42] = new Block(42,50,0,false,43,true,43,true,30)
  greenLine.blocks[43] = new Block(43,50,0,false,44,true,44,true,30)
  greenLine.blocks[44] = new Block(44,50,0,false,45,true,45,true,30)
  greenLine.blocks[45] = new Block(45,50,0,false,46,true,46,true,30)
  greenLine.blocks[46] = new Block(46,50,0,false,47,true,47,true,30)
  greenLine.blocks[47] = new Block(47,50,0,false,48,true,48,true,30)
  greenLine.blocks[48] = new Block(48,50,0,false,49,true,49,true,30)
  greenLine.blocks[49] = new Block(49,50,0,false,50,true,50,true,30)
  greenLine.blocks[50] = new Block(50,50,0,false,51,true,51,true,30)

  greenLine.blocks[51] = new Block(51,50,0,false,52,true,52,true,30)
  greenLine.blocks[52] = new Block(52,50,0,false,53,true,53,true,30)
  greenLine.blocks[53] = new Block(53,50,0,false,54,true,54,true,30)
  greenLine.blocks[54] = new Block(54,50,0,false,55,true,55,true,30)
  greenLine.blocks[55] = new Block(55,50,0,false,56,true,56,true,30)
  greenLine.blocks[56] = new Block(56,50,0,false,57,true,57,true,30)
  greenLine.blocks[57] = new Block(57,50,0,false,58,true,58,true,30)
  greenLine.blocks[58] = new Block(58,50,0,false,59,true,59,true,30)//
  greenLine.blocks[59] = new Block(59,50,0,false,60,true,60,true,30)
  greenLine.blocks[60] = new Block(60,50,0,false,61,true,61,true,30)

  greenLine.blocks[61] = new Block(61,50,0,false,62,true,62,true,30)
  greenLine.blocks[62] = new Block(62,50,0,false,63,true,63,true,30)
  greenLine.blocks[63] = new Block(63,100,0,false,64,true,64,true,70)
  greenLine.blocks[64] = new Block(64,100,0,true,65,true,65,true,70)
  greenLine.blocks[65] = new Block(65,200,0,false,66,true,66,true,70)
  greenLine.blocks[66] = new Block(66,200,0,false,67,true,67,true,70)
  greenLine.blocks[67] = new Block(67,100,0,false,68,true,68,true,40)
  greenLine.blocks[68] = new Block(68,100,0,false,69,true,69,true,40)
  greenLine.blocks[69] = new Block(69,100,0,false,70,true,70,true,40)
  greenLine.blocks[70] = new Block(70,100,0,false,71,true,71,true,40)

  greenLine.blocks[71] = new Block(71,100,0,false,72,true,72,true,40)
  greenLine.blocks[72] = new Block(72,100,0,false,73,true,73,true,40)
  greenLine.blocks[73] = new Block(73,100,0,false,74,true,74,true,40)
  greenLine.blocks[74] = new Block(74,100,0,false,75,true,75,true,40)
  greenLine.blocks[75] = new Block(75,100,0,false,76,true,76,true,40)
  greenLine.blocks[76] = new Block(76,100,0,false,77,true,77,true,40)
  greenLine.blocks[77] = new Block(77,300,0,true,78,true,101,false,70)//
  greenLine.blocks[78] = new Block(78,300,0,true,79,true,77,false,70)//
  greenLine.blocks[79] = new Block(79,300,0,true,80,true,78,false,70)//
  greenLine.blocks[80] = new Block(80,300,0,true,81,true,79,false,70)//

  greenLine.blocks[81] = new Block(81,300,0,true,82,true,80,false,70)//
  greenLine.blocks[82] = new Block(82,300,0,true,83,true,81,false,70)//
  greenLine.blocks[83] = new Block(83,300,0,true,84,true,82,false,70)//
  greenLine.blocks[84] = new Block(84,300,0,true,85,true,83,false,70)//
  greenLine.blocks[85] = new Block(85,300,0,true,86,true,84,false,70)//
  greenLine.blocks[86] = new Block(86,100,0,false,87,true,87,true,25)
  greenLine.blocks[87] = new Block(87,86.6,0,false,88,true,88,true,25)
  greenLine.blocks[88] = new Block(88,100,0,false,89,true,89,true,25)
  greenLine.blocks[89] = new Block(89,75,-0.5,false,90,true,90,true,25)
  greenLine.blocks[90] = new Block(90,75,-1,false,91,true,91,true,25)

  greenLine.blocks[91] = new Block(91,75,-2,false,92,true,92,true,25)
  greenLine.blocks[92] = new Block(92,75,0,false,93,true,93,true,25)
  greenLine.blocks[93] = new Block(93,75,2,false,94,true,94,true,25)
  greenLine.blocks[94] = new Block(94,75,1,false,95,true,95,true,25)
  greenLine.blocks[95] = new Block(95,75,0.5,false,96,true,96,true,25)
  greenLine.blocks[96] = new Block(96,75,0,false,97,true,97,true,25)
  greenLine.blocks[97] = new Block(97,75,0,false,98,true,98,true,25)
  greenLine.blocks[98] = new Block(98,75,0,false,99,true,99,true,25)
  greenLine.blocks[99] = new Block(99,75,0,false,100,true,100,true,25)
  greenLine.blocks[100] = new Block(100,75,0,false,85,false,85,false,25)

  greenLine.blocks[101] = new Block(101,35,0,false,102,true,102,true,26)
  greenLine.blocks[102] = new Block(102,100,0,false,103,true,103,true,28)
  greenLine.blocks[103] = new Block(103,100,0,false,104,true,104,true,28)
  greenLine.blocks[104] = new Block(104,80,0,false,105,true,105,true,28)
  greenLine.blocks[105] = new Block(105,100,0,false,106,true,106,true,28)
  greenLine.blocks[106] = new Block(106,100,0,false,107,true,107,true,28)
  greenLine.blocks[107] = new Block(107,90,0,false,108,true,108,true,28)
  greenLine.blocks[108] = new Block(108,100,0,false,109,true,109,true,28)
  greenLine.blocks[109] = new Block(109,100,0,false,110,true,110,true,28)
  greenLine.blocks[110] = new Block(110,100,0,false,111,true,111,true,30)

  greenLine.blocks[111] = new Block(111,100,0,false,112,true,112,true,30)
  greenLine.blocks[112] = new Block(112,100,0,false,113,true,113,true,30)
  greenLine.blocks[113] = new Block(113,100,0,false,114,true,114,true,30)
  greenLine.blocks[114] = new Block(114,162,0,false,115,true,115,true,30)
  greenLine.blocks[115] = new Block(115,100,0,false,116,true,116,true,30)
  greenLine.blocks[116] = new Block(116,100,0,false,117,true,117,true,30)
  greenLine.blocks[117] = new Block(117,50,0,false,118,true,118,true,15)
  greenLine.blocks[118] = new Block(118,50,0,false,119,true,119,true,15)
  greenLine.blocks[119] = new Block(119,40,0,false,120,true,120,true,15)
  greenLine.blocks[120] = new Block(120,50,0,false,121,true,121,true,15)

  greenLine.blocks[121] = new Block(121,50,0,false,122,true,122,true,15)
  greenLine.blocks[122] = new Block(122,50,0,false,123,true,123,true,20)
  greenLine.blocks[123] = new Block(123,50,0,false,124,true,124,true,20)
  greenLine.blocks[124] = new Block(124,50,0,false,125,true,125,true,20)
  greenLine.blocks[125] = new Block(125,50,0,false,126,true,126,true,20)
  greenLine.blocks[126] = new Block(126,50,0,false,127,true,127,true,20)
  greenLine.blocks[127] = new Block(127,50,0,false,128,true,128,true,20)
  greenLine.blocks[128] = new Block(128,50,0,false,129,true,129,true,20)
  greenLine.blocks[129] = new Block(129,50,0,false,130,true,130,true,20)
  greenLine.blocks[130] = new Block(130,50,0,false,131,true,131,true,20)

  greenLine.blocks[131] = new Block(131,50,0,false,132,true,132,true,20)
  greenLine.blocks[132] = new Block(132,50,0,false,133,true,133,true,20)
  greenLine.blocks[133] = new Block(133,50,0,false,134,true,134,true,20)
  greenLine.blocks[134] = new Block(134,50,0,false,135,true,135,true,20)
  greenLine.blocks[135] = new Block(135,50,0,false,136,true,136,true,20)
  greenLine.blocks[136] = new Block(136,50,0,false,137,true,137,true,20)
  greenLine.blocks[137] = new Block(137,50,0,false,138,true,138,true,20)
  greenLine.blocks[138] = new Block(138,50,0,false,139,true,139,true,20)
  greenLine.blocks[139] = new Block(139,50,0,false,140,true,140,true,20)
  greenLine.blocks[140] = new Block(140,50,0,false,141,true,141,true,20)

  greenLine.blocks[141] = new Block(141,50,0,false,142,true,142,true,20)
  greenLine.blocks[142] = new Block(142,50,0,false,143,true,143,true,20)
  greenLine.blocks[143] = new Block(143,50,0,false,144,true,144,true,20)
  greenLine.blocks[144] = new Block(144,50,0,false,145,true,145,true,20)
  greenLine.blocks[145] = new Block(145,50,0,false,146,true,146,true,20)
  greenLine.blocks[146] = new Block(146,50,0,false,147,true,147,true,20)
  greenLine.blocks[147] = new Block(147,50,0,false,148,true,148,true,20)
  greenLine.blocks[148] = new Block(148,184,0,false,149,true,149,true,20)
  greenLine.blocks[149] = new Block(149,40,0,false,150,true,150,true,20)
  greenLine.blocks[150] = new Block(150,35,0,false,28,true,28,true,20)
  
  //special blocks
  greenLine.blocks[13].hasSwitch = true
  greenLine.switches[13] = new Switch(false,true,13,false,1,true,12,true)
  greenLine.blocks[29].hasSwitch = true
  greenLine.switches[29] = new Switch(false,true,29,true,30,false,150,true)
  greenLine.blocks[58].hasSwitch = true
  greenLine.switches[58] = new Switch(false,true,57,true,0,true,62,true)
  greenLine.blocks[62].hasSwitch = true
  greenLine.switches[62] = new Switch(false,false,62,true,0,true,63,true)
  greenLine.blocks[76].hasSwitch = true
  greenLine.switches[76] = new Switch(false,false,76,true,77,true,101,true)
  greenLine.blocks[85].hasSwitch = true
  greenLine.switches[85] = new Switch(false,true,85,false,86,true,100,true)

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

  greenLine.blocks[19].hasCrossing = true
  */
  
//=====================================================================================================

const messenger = require('messenger')
const input = messenger.createListener(8004)
const watchdog = messenger.createSpeaker(8000)
const trainModel = messenger.createSpeaker(8005)
const wayside = messenger.createSpeaker(8002)

trainsList = []
trainsDict = []

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

      if (greenLine.blocks[this.block].hasBeacon) {
        this.station = greenLine.block[this.block].beacon.station
        this.underground = greenLine.block[this.block].beacon.underground
        this.leftPlatform = greenLine.block[this.block].beacon.leftPlatform
        this.rightPlatform = greenLine.block[this.block].beacon.rightPlatform
      }
    }
    else {
      this.station = ''
      this.leftPlatform = false
      this.rightPlatform = false
      this.underground = false
    }
  }

  getMessage() {
    return {
      id: this.trainId,
      boardingPax: 0,
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
    b.speedCmd = data.cmdSpeed[b.blockNum]
    b.authCmd = data.cmdAuth[b.blockNum]
    greenLine.switches[13] = data.switches[4]
    greenLine.switches[29] = data.switches[3]
    greenLine.switches[58] = data.switches[5]
    greenLine.switches[62] = data.switches[0]
    greenLine.switches[76] = data.switches[1]
    greenLine.switches[85] = data.switches[2]
  })

trainModel.shout("trackModel", trainsList.map((t) => t.getMessage()))
})

input.on('trainModel', (m, data) => {
  greenLine.blocks.forEach((b) => {
    b.isOccupied = false
  })
  data.forEach((t) => {
    const id = t.id
    trainsDict[id].updatePosition(t['distance'])
  })
  trainsList.forEach((t) => {
    greenLine.blocks[t.block].isOccupied = true
  })
  wayside.shout("trackModel", greenLine.blocks)
})

input.on('createTrain', (m, data) => {
  const newTrain = new Train(data)
  trainsList.push(newTrain)
  trainsDict[newTrain.trainId] = newTrain
})

ipcMain.on('requestData', (event, arg) => { event.reply('fetchData', { ready: true, greenLine: greenLine }) })
setInterval(() => { watchdog.shout('trackModel', true) }, 100)
