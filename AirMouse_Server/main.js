const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

const Tray = electron.Tray;
const Menu = electron.Menu;
const iconPath = path.join(__dirname, "img/icon.png");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let tray = null;

let quitSource = "";

function CreateTray()
{
  tray = new Tray(iconPath);
  
  let menuTemplate = 
  [
    {
      label: "Server information",
      click()
      {
        mainWindow.show();
      }
    },
    {
      label: "Quit", 
      click() 
      {
        quitSource = "tray";
        app.quit();
      }
    }
  ];

  const contextMenu = Menu.buildFromTemplate(menuTemplate);
  tray.setContextMenu(contextMenu);
  tray.setToolTip("AirMouse");
}

function createWindow ()
{
  // Create the browser window.
  mainWindow = new BrowserWindow(
  {
    show: false,
    width: 260, 
    height: 260, 
    maximizable: false,
    resizable: false,
    icon: iconPath
  });
  mainWindow.setPosition(0,0);

  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format(
  {
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.

  mainWindow.on('minimize',function(event)
  {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', function (event) 
  {
    if(quitSource != "tray")
    {
      event.preventDefault();    
      mainWindow.hide();
    }
  });

  // mainWindow.on('closed', () =>
  // {
  //   // Dereference the window object, usually you would store windows
  //   // in an array if your app supports multi windows, this is the time
  //   // when you should delete the corresponding element.
  //   mainWindow = null;
  //   app.quit();
  // });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () =>
{
  CreateTray();
  createWindow();

});

// app.on('before-quit', function ()
// {
  
// });

// Quit when all windows are closed.
// app.on('window-all-closed', function ()
// {
  
//   // On OS X it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   if (process.platform !== 'darwin')
//   {
//     app.quit();
//   }
// });

app.on('activate', function ()
{
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null)
  {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
