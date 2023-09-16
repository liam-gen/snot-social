const { app, BrowserWindow, session, ipcMain, autoUpdater, dialog, shell } = require('electron');
const fs = require("fs")
const {exec} = require('child_process');

const contextMenu = require('electron-context-menu');

if(app.isPackaged){
  // app
}

let win;
function createWindow() {
    win = new BrowserWindow({
        height: 200,
        width: 350,
        frame: false,
        autoHideMenuBar: true,
        icon: "assets/logo.png",
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            webviewTag: true,
            contextIsolation: false,
            spellcheck: true
        },
    });

    win.loadFile("pages/loading.html")
    win.center()

    

    setTimeout(function() {
      win.maximize();
      win.loadFile("index.html")
      win.resizable = true;
    }, 3000)

    let data = JSON.parse(fs.readFileSync(__dirname+"/cache/cookies.json", "utf8"));
    data.forEach(cookie => {
        session.fromPartition('persist:webview').cookies.set(cookie) .then((cookies) => {
            console.log("SETTING COOKIE")
          }).catch((error) => {
            console.log(error)
          })
    })

    win.webContents.on("did-attach-webview", (_, contents) => {
        contents.setWindowOpenHandler(({url}) => {
          setImmediate(() => {
            shell.openExternal(url)
          })
          return { action: 'deny' }
        })
      })

      win.webContents.setWindowOpenHandler(({ url }) => {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: { // These options will be applied to the new BrowserWindow
            autoHideMenuBar: true
          }
        }
      })

}

ipcMain.on("store-cookies", (event, arg) => {
    
    session.fromPartition('persist:webview').cookies.get({}) .then((cookies) => {
        cookies.forEach((a, b) => {cookies[b]["url"] = "https://snot.fr"})
        fs.writeFileSync(__dirname+"/cache/cookies.json", JSON.stringify(cookies))
      }).catch((error) => {
        console.log(error)
      })
});
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on("web-contents-created", (e, contents) => {
    contextMenu({
       window: contents,
       showInspectElement: true,
       showCopyImage: false,
       showCopyLink: true,
       showCopyImageAddress: true,
        prepend: (defaultActions, parameters, browserWindow) => [
            {
                label: 'Rechercher “{selection}”',
                visible: parameters.selectionText.trim().length > 0,
                click: () => {
                    shell.openExternal(`https://google.com/search?q=${encodeURIComponent(parameters.selectionText)}`);
                }
            },
            {
                label: 'Retour',
                visible: true,
                click: () => {
                    win.webContents.send("back")
                }
            },
            {
                label: 'Prochain',
                visible: true,
                click: () => {
                    win.webContents.send("forward")
                }
            }
        ]
    });
 })

 ipcMain.on("close-window", (event, arg) => {
    session.fromPartition('persist:webview').cookies.get({}) .then((cookies) => {
        cookies.forEach((a, b) => {cookies[b]["url"] = "https://snot.fr"})
        fs.writeFile(__dirname+"/cache/cookies.json", JSON.stringify(cookies), () => win.close())
      }).catch((error) => {
        console.log(error)
      })
 })

 ipcMain.on("update-size", (event, arg) => {
    if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
 })

 ipcMain.on("minimize", (event, arg) => {
    win.minimize();
 })

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});