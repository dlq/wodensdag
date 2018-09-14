const { app, BrowserWindow } = require('electron')
const windowStateKeeper = require('electron-window-state')

let mainWindow

function createWindow () {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 990,
    defaultHeight: 1024
  })

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    titleBarStyle: 'hiddenInset',
    transparent: true
  })

  mainWindowState.manage(mainWindow)

  mainWindow.loadFile('index.html')

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
