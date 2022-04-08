const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 300,
        height: 500,
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

// Inter-module messaging setup
const messenger = require('messenger');
const input = messenger.createListener(8007);
const watchdog = messenger.createSpeaker(8000);
const trainModel = messenger.createSpeaker(8005);

// inputs
var actSpeed = 0
var cmdSpeed = 0
var authority = 0

// outputs
var powerCmd = 0
var emergencyBrake = true
var serviceBrake = false
var leftDoors = false
var rightDoors = false
var lights = false
var temperature = 70

// Serial communication setup
const { SerialPort } = require('serialport')
const port = new SerialPort({ path: 'COM6', baudRate: 9600 })
port.setEncoding('utf8')

buffer = ""
delimiter = /;/

input.on('trainModel', (m, data) => {
    actSpeed = data['velocity']
    cmdSpeed = data['speedCmd']
    authority = data['authorityCmd']

    trainModel.shout('controllerHW', {
        powerCmd: powerCmd,
        emergencyBrake: emergencyBrake,
        serviceBrake: serviceBrake,
        leftDoors: leftDoors,
        rightDoors: rightDoors,
        lights: lights,
        temperature: temperature
    })
})

port.on('readable', function() {
    buffer += port.read()
    if(delimiter.test(buffer)) {
        update = buffer.split(delimiter)
        update.forEach((u) => {
            //console.log(u)
            if (/:/.test(u)) {
                if(/Power/.test(u)) {
                    powerCmd = u.match(/\d+/)
                    console.log("POWER: " + powerCmd)
                }
                if(/Temp/.test(u)) {
                    temperature = u.match(/\d+/)
                    console.log("TEMP: " + temperature)
                }
                if(/eBrake/.test(u)) {
                    emergencyBrake = Boolean(parseInt(u.match(/\d+/)))
                    console.log("EBRAKE: " + emergencyBrake)
                }
                if(/sBrake/.test(u)) {
                    serviceBrake = Boolean(parseInt(u.match(/\d+/)))
                    console.log("SBRAKE: " + serviceBrake)
                }
                if(/lDoors/.test(u)) {
                    leftDoors = Boolean(parseInt(u.match(/\d+/)))
                    console.log("LDOORS: " + leftDoors)
                }
                if(/rDoors/.test(u)) {
                    rightDoors = Boolean(parseInt(u.match(/\d+/)))
                    console.log("RDOORS: " + rightDoors)
                }
                if(/Lights/.test(u)) {
                    lights = Boolean(parseInt(u.match(/\d+/)))
                    console.log("LIGHTS: " + lights)
                }
            }
        })
        buffer = delimiter.test(update[update.length - 1]) ? "" : update[update.length - 1]
    }
})

setInterval(() => {port.write(cmdSpeed.toFixed(0)+','+actSpeed.toFixed(0))
console.log("SENDING: " + cmdSpeed.toFixed(0)+','+actSpeed.toFixed(0))}, 5000)

setInterval(() => { watchdog.shout('controllerHW', true) }, 100)

