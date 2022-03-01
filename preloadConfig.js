const { ipcRenderer } = require('electron');
window.addEventListener('DOMContentLoaded', () => {
    const btnSave = document.getElementById('btn-save');
    const btnRestart = document.getElementById('btn-restart');
    const btnClose = document.getElementById('btn-close');

    const textServer = document.getElementById('text-server');
    const textLink = document.getElementById('text-link');
    const textToken = document.getElementById('text-token');
    const textApp = document.getElementById('text-app');
    const textIP = document.getElementById('text-ip');
    const textPort = document.getElementById('text-port');
    const textType = document.getElementById('text-type');
    const textTimeout = document.getElementById('text-timeout');

    const checkRealtimelog = document.getElementById('check-realtimelog');
    const checkFullscreen = document.getElementById('check-fullscreen');
    //
    ipcRenderer.on('config', function (event, arg) {
        textServer.value = arg.server_url;
        textLink.value = arg.link;
        textToken.value = arg.token;
        textApp.value = arg.id_app;
        checkFullscreen.checked = arg.fullscreen;

        textIP.value = arg.devices[0].ip;
        textPort.value = arg.devices[0].port;
        textType.value = arg.devices[0].trang_thai;
        textTimeout.value = arg.devices[0].timeout;
        checkRealtimelog.checked = arg.devices[0].realtimelog;
        
    })
    //
    btnSave.addEventListener('click', function () {
        let config ={
            server_url:textServer.value,
            link:textLink.value,
            token:textToken.value,
            id_app:textApp.value,
            fullscreen:checkFullscreen.checked,
            devices:[{
                ip:textIP.value,
                port:textPort.value,
                trang_thai:textType.value,
                timeout:textTimeout.value,
                realtimelog:checkRealtimelog.checked
            }]
        }
        ipcRenderer.send("save_config",config)
    })
    btnRestart.addEventListener('click', function () {
        ipcRenderer.send("restart","restart")
    })
    btnClose.addEventListener('click', function () {
        ipcRenderer.send("closeConfig","closeConfig")
    })

})