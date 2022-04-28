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

//===============================//
// WAYSIDE CONTROLLER (HARDWARE) //
//===============================//

const messenger = require('messenger')
const input = messenger.createListener(8003)
const watchdog = messenger.createSpeaker(8000)
const toSwws = messenger.createSpeaker(8002)    //software wayside controller

setInterval(() => { watchdog.shout('waysideHW', true) }, 100)

buffer = new Uint8Array(4)

input.on('waysideSW', (m, data) => {
    buffer.fill(0)
    for(var i = 0; i < 25; i++) {
        buffer[i/8] |= data[i] << (i%8)
    } 
})

setInterval(() => {
    arduino.write(buffer)
    console.log("WRITE: " + buffer)
}, 500)

SerialPort.list((err, ports) => {
    console.log(ports)
})

const arduino = new SerialPort({
    path: 'COM7',
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
            console.log("R: " + (((data >> i) & 1) === 1))
        }

        toSwws.shout('waysideHW', switches)
    }

    byteCount++;
    if(byteCount >= 4) byteCount %= 4;
})