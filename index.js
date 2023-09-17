const { app, BrowserWindow, session, ipcMain, dialog, shell } = require('electron');
const fs = require("fs")

const contextMenu = require('electron-context-menu');

let win;
let database;
function createWindow() {
    win = new BrowserWindow({
        height: 700,
        width: 900,
        frame: false,
        autoHideMenuBar: true,
        icon: "assets/logo.png",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            webviewTag: true,
            contextIsolation: false,
            spellcheck: true
        },
    });
    win.center()
    win.maximize();
    win.loadFile("index.html")

    if(app.isPackaged){
      fs.writeFileSync(__dirname+"/cache/database.txt", process.argv[1])
      database = process.argv[1]
    }
    else{
      fs.writeFileSync(__dirname+"/cache/database.txt", __dirname+'/'+process.argv[2])
      database = __dirname+"/"+process.argv[2]
    }

    let data = JSON.parse(fs.readFileSync(database+"/cookies.json", "utf8"));
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
        fs.writeFileSync(database+"/cookies.json", JSON.stringify(cookies))
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
        fs.writeFile(database+"/cookies.json", JSON.stringify(cookies), () => win.close())
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