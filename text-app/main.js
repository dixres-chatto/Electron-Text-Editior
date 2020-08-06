const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");

const fs = require("fs");

let win;
let filePath = undefined; // use this variable to check if a file path is undefined

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  //   win.webContents.openDevTools()
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("save", (event, text) => {
  if (filePath === undefined) {
    let fullpath = dialog.showSaveDialogSync(win, {
      defaultPath: "filename.txt",
    });

    if (fullpath) {
      filePath = fullpath;
      writeToFile(text);
    }
  } else {
    writeToFile(text);
  }
});

function writeToFile(data) {
  fs.writeFile(filePath, data, (err) => {
    if (err) console.log("Something went wrong while saving the file", err);

    win.webContents.send("saved", "success");
  });
}

const menuTemplate = [
  // process.platform == 'darwin' ? {
  //     label: app.getName(),
  //     submenu: [
  //         { role: 'about' }
  //     ]
  // } : {},
  {
    label: "File",
    submenu: [
      {
        label: "Save",
        accelerator: "CmdOrCtrl+S",
        click() {
          win.webContents.send("save-clicked");
        },
      },
      {
        label: "Save As",
        accelerator: "CmdOrCtrl+Shift+S",
        click() {
          filePath = undefined;
          win.webContents.send("save-clicked");
        },
      },
    ],
  },

  { role: "editMenu" },

  //   { role: "viewMenu" },
];
