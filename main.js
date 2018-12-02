const { app, BrowserWindow, Menu } = require('electron')
const windowStateKeeper = require('electron-window-state')
const Store = require('electron-store')
const store = new Store()

function checked (country) { return store.get('countries', []).includes(country) }

function check (country) {
  var countries = store.get('countries', [])
  if (countries.includes(country)) {
    countries = store.get('countries').filter(c => c !== country)
    store.set('countries', store.get('countries').filter(c => c !== country))
  } else {
    countries.push(country)
    store.set('countries', countries)
  }
}

const menuTemplate = [
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Torrents',
    submenu: [
      {
        label: '720p',
        type: 'radio',
        checked: store.get('resolution', '720p') === '720p',
        click: () => { store.set('resolution', '720p') }
      },
      {
        label: '1080p',
        type: 'radio',
        checked: store.get('resolution', '720p') === '1080p',
        click: () => { store.set('resolution', '1080p') }
      },
      {
        label: '2160p',
        type: 'radio',
        checked: store.get('resolution', '720p') === '2160p',
        click: () => { store.set('resolution', '2160p') }
      },
      { type: 'separator' },
      {
        label: 'United States',
        type: 'checkbox',
        checked: checked('US'),
        click: () => { check('US') }
      },
      {
        label: 'United Kingdom',
        type: 'checkbox',
        checked: checked('GB'),
        click: () => { check('GB') }
      },
      {
        label: 'Canada',
        type: 'checkbox',
        checked: checked('CA'),
        click: () => { check('CA') }
      },
      {
        label: 'Australia',
        type: 'checkbox',
        checked: checked('AU'),
        click: () => { check('AU') }
      },
      {
        label: 'Ireland',
        type: 'checkbox',
        checked: checked('IE'),
        click: () => { check('IE') }
      },
      {
        label: 'New Zealand',
        type: 'checkbox',
        checked: checked('NZ'),
        click: () => { check('NZ') }
      },
      /*
      {
        label: 'South Africa',
        type: 'checkbox',
        checked: checked('ZA'),
        click: () => { check('ZA') }
      },
      */
      { type: 'separator' },
      {
        label: 'Japan',
        type: 'checkbox',
        checked: checked('JP'),
        click: () => { check('JP') }
      },
      {
        label: 'South Korea',
        type: 'checkbox',
        checked: checked('KR'),
        click: () => { check('KR') }
      },
      {
        label: 'China',
        type: 'checkbox',
        checked: checked('CN'),
        click: () => { check('CN') }
      },
      {
        label: 'Thailand',
        type: 'checkbox',
        checked: checked('TH'),
        click: () => { check('TH') }
      },
      /*
      {
        label: 'Singapore',
        type: 'checkbox',
        checked: checked('SG'),
        click: () => { check('SG') }
      },
      {
        label: 'Hong Kong',
        type: 'checkbox',
        checked: checked('HK'),
        click: () => { check('HK') }
      },
      {
        label: 'Taiwan',
        type: 'checkbox',
        checked: checked('TW'),
        click: () => { check('TW') }
      },
      {
        label: 'Philippines',
        type: 'checkbox',
        checked: checked('PH'),
        click: () => { check('PH') }
      },
      */
      { type: 'separator' },
      {
        label: 'Russia',
        type: 'checkbox',
        checked: checked('RU'),
        click: () => { check('RU') }
      },
      {
        label: 'Ukraine',
        type: 'checkbox',
        checked: checked('UA'),
        click: () => { check('UA') }
      },
      {
        label: 'Poland',
        type: 'checkbox',
        checked: checked('PL'),
        click: () => { check('PL') }
      },
      {
        label: 'Hungary',
        type: 'checkbox',
        checked: checked('HU'),
        click: () => { check('HU') }
      },
      {
        label: 'Turkey',
        type: 'checkbox',
        checked: checked('TR'),
        click: () => { check('TR') }
      },
      /*
      {
        label: 'Romania',
        type: 'checkbox',
        checked: checked('RO'),
        click: () => { check('RO') }
      },
      {
        label: 'Czechia',
        type: 'checkbox',
        checked: checked('CZ'),
        click: () => { check('CZ') }
      },
      {
        label: 'Serbia',
        type: 'checkbox',
        checked: checked('RS'),
        click: () => { check('RS') }
      },
      {
        label: 'Kazakhstan',
        type: 'checkbox',
        checked: checked('KZ'),
        click: () => { check('KZ') }
      },
      {
        label: 'Armenia',
        type: 'checkbox',
        checked: checked('AM'),
        click: () => { check('AM') }
      },
      */
      { type: 'separator' },
      {
        label: 'France',
        type: 'checkbox',
        checked: checked('FR'),
        click: () => { check('FR') }
      },
      {
        label: 'Germany',
        type: 'checkbox',
        checked: checked('DE'),
        click: () => { check('DE') }
      },
      {
        label: 'Netherlands',
        type: 'checkbox',
        checked: checked('NL'),
        click: () => { check('NL') }
      },
      {
        label: 'Belgium',
        type: 'checkbox',
        checked: checked('BE'),
        click: () => { check('BE') }
      },
      {
        label: 'Italy',
        type: 'checkbox',
        checked: checked('IT'),
        click: () => { check('IT') }
      },
      {
        label: 'Spain',
        type: 'checkbox',
        checked: checked('ES'),
        click: () => { check('ES') }
      },
      {
        label: 'Portugal',
        type: 'checkbox',
        checked: checked('PT'),
        click: () => { check('PT') }
      },
      {
        label: 'Austria',
        type: 'checkbox',
        checked: checked('AT'),
        click: () => { check('AT') }
      },
      { type: 'separator' },
      {
        label: 'Sweden',
        type: 'checkbox',
        checked: checked('SE'),
        click: () => { check('SE') }
      },
      {
        label: 'Norway',
        type: 'checkbox',
        checked: checked('NO'),
        click: () => { check('NO') }
      },
      {
        label: 'Denmark',
        type: 'checkbox',
        checked: checked('DK'),
        click: () => { check('DK') }
      },
      {
        label: 'Finland',
        type: 'checkbox',
        checked: checked('FI'),
        click: () => { check('FI') }
      }
      /*
      { type: 'separator' },
      {
        label: 'Brazil',
        type: 'checkbox',
        checked: checked('BR'),
        click: () => { check('BR') }
      },
      {
        label: 'Mexico',
        type: 'checkbox',
        checked: checked('MX'),
        click: () => { check('MX') }
      },
      {
        label: 'Argentina',
        type: 'checkbox',
        checked: checked('AR'),
        click: () => { check('AR') }
      },
      {
        label: 'Chile',
        type: 'checkbox',
        checked: checked('CL'),
        click: () => { check('CL') }
      },
      { type: 'separator' },
      {
        label: 'India',
        type: 'checkbox',
        checked: checked('IN'),
        click: () => { check('IN') }
      },
      {
        label: 'Israel',
        type: 'checkbox',
        checked: checked('IL'),
        click: () => { check('IL') }
      },
      */
    ]
  },
  {
    label: 'Go',
    submenu: [
      {
        label: 'Next',
        accelerator: 'CmdOrCtrl+Right',
        click: () => { mainWindow.webContents.send('right') }
      },
      {
        label: 'Previous',
        accelerator: 'CmdOrCtrl+Left',
        click: () => { mainWindow.webContents.send('left') }
      },
      { type: 'separator' },
      {
        label: 'Search',
        accelerator: 'CmdOrCtrl+S',
        click: () => { mainWindow.webContents.send('search') }
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More About Electron',
        click () { require('electron').shell.openExternal('https://electronjs.org') }
      },
      {
        label: 'Learn More About the TVmaze API',
        click () { require('electron').shell.openExternal('https://www.tvmaze.com/api') }
      },
      {
        label: 'Learn More About torrent-search-api',
        click () { require('electron').shell.openExternal('https://www.npmjs.com/package/torrent-search-api') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  // App menu
  menuTemplate.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services', submenu: [] },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  })
  // add to Edit menu
  menuTemplate[1].submenu.push(
    { type: 'separator' },
    {
      label: 'Speech',
      submenu: [
        { role: 'startspeaking' },
        { role: 'stopspeaking' }
      ]
    }
  )
  // add to Window menu
  menuTemplate[5].submenu = [
    { role: 'close' },
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' }
  ]
}

let mainWindow

function createWindow () {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))

  let mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 900,
    file: 'main-window-state.json'
  })
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    titleBarStyle: 'hiddenInset'
  })
  mainWindowState.manage(mainWindow)
  mainWindow.loadFile('src/index.html')
  mainWindow.on('closed', () => { mainWindow = null })
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
