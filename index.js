const { app, BrowserWindow,dialog } = require('electron');
const path = require("path");
const fs = require("fs");;
const path_config = path.join(__dirname,"default_config.json");
const config = require(path_config);
let checkinWin,configWin;
const { fork } = require('child_process');
function configWindow () {
    //load config.html
    configWin = new BrowserWindow({
        width: 550,
        height: 650,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preloadConfig.js')
        }
    })
    configWin.loadFile('config.html');
    configWin.webContents.send('config', config)
}
function checkinWindow () {
    //load checkin url
    checkinWin = new BrowserWindow({
        width: 1050,
        height: 650,
        fullscreen:config.fullscreen,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preloadCheckin.js')
        }
    })
    checkinWin.loadURL(config.link);
    checkinWin.webContents.on("did-fail-load", function() {
        configWindow();
        checkinWin.close();
    });
    checkinWin.webContents.on("did-finish-load", function() {
        //connect to devices
        console.log("connecting...")
        let worker = path.join(__dirname,"worker.js");
        const child = fork(worker);
        child.on('error', (err) => {
            console.error(err)
        });
        child.on('message', function(response) {
            if(response.state){
                checkinWin.webContents.send('state', response);
            }
            if(response.error){
                dialog.showMessageBox({
                    message:"Can't connect to device." + response.error,
                    buttons:[
                        "Try connect again",
                        "Cancel",
                    ]
                }).then(res=>{
                    switch(res.response){
                        case 0:
                            app.relaunch();
                            app.quit();
                            break;
                    }  
                })
            }
        });
    });
}
//event
const { ipcMain,shell } = require('electron');
ipcMain.on('save_config', (event, arg) => {
  fs.writeFileSync(path_config,JSON.stringify(arg));
  app.relaunch()
  app.exit()
})
ipcMain.on('restart', (event, arg) => {
    app.relaunch()
    app.quit()
})
ipcMain.on('showConfig', (event, arg) => {
    configWindow();
})
ipcMain.on('closeConfig', (event, arg) => {
    if(configWin){
        configWin.close();
    }
})
ipcMain.on('exit', (event, arg) => {
    app.quit()
})
app.whenReady().then(() => {
    checkinWindow();
})
app.on('window-all-closed', () => {
    app.quit()
})