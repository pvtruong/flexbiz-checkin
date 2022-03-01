const { ipcRenderer } = require('electron');
var statusLabel;
ipcRenderer.on('state', function (event, arg) {
    if(statusLabel){
        statusLabel.innerHTML = arg.state;
        statusLabel.style.color=arg.color || "black"
    }
})

window.addEventListener('DOMContentLoaded', () => {
    var div = document.createElement("DIV");
    div.style.position ="absolute";
    div.style.top = "10px";
    div.style.right="10px";
    div.style.display="flex";
    div.style.alignItems="center";
    div.style.justifyContent="flex-end";
    document.body.appendChild(div);
    //status
    statusLabel = document.createElement("LABEL");
    statusLabel.style.color="blue"
    statusLabel.innerHTML="...";
    div.appendChild(statusLabel);
    //logout button
    var btnLogout = document.createElement("BUTTON"); 
    btnLogout.innerHTML = "Log out";
    btnLogout.style.marginLeft ="10px";
    btnLogout.addEventListener("click",function(){
        window.localStorage.clear();
        ipcRenderer.send("restart","restart")
    })
    div.appendChild(btnLogout)
    //config button
    var btnConfig = document.createElement("BUTTON"); 
    btnConfig.innerHTML = "Setting";
    btnConfig.style.marginLeft ="10px";
    btnConfig.addEventListener("click",function(){
        ipcRenderer.send("showConfig","showConfig")
    })
    div.appendChild(btnConfig)
    //exit button
    var btnExit = document.createElement("BUTTON"); 
    btnExit.innerHTML = "Exit";
    btnExit.style.marginLeft ="10px";
    btnExit.addEventListener("click",function(){
        ipcRenderer.send("exit","exit")
    })
    div.appendChild(btnExit)
})