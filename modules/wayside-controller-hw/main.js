const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
//import { bap } from 'test.js'
const { SerialPort } = require('serialport')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: "#ccc",
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit()
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const messenger = require('messenger')
const input = messenger.createListener(8003)
const watchdog = messenger.createSpeaker(8000)
const toCtc = messenger.createSpeaker(8001)     //ctc
const toSwws = messenger.createSpeaker(8002)    //software wayside controller
const toTrack = messenger.createSpeaker(8004)   //track model

setInterval(() => { watchdog.shout('waysideHW', true) }, 100)

input.on('blockOccupancyA', (m, data) => {
    arduino.write(data)
})

SerialPort.list((err, ports) => {
    console.log(ports)
})

const arduino = new SerialPort({
    path: 'COM3',
    baudRate: 9600
})

arduino.setEncoding('binary')

var switches = new Array(6).fill(false);
var byteCount = 0;

arduino.on('readable', () => {
    var data = arduino.read(length => 1)

    if(byteCount === 0) {
        for(var i = 0; i < 6; i++) {
            switches[i] = (((data >> i) & 1) === 1)
        }

        toSwws.shout('hwWayside', switches)
    }

    byteCount++;
    if(byteCount >= 4) byteCount %= 4;
})