const path = require("path");
const ZKLib = require('node-zklib')
const async =require('async');
const axios = require("axios");
const path_config = path.join(__dirname,"default_config.json");
const {token,id_app,devices,server_url} = require(path_config);
const checkin = async (datas,trang_thai="1")=>{
    //trang thai: 3- checkin PT,2- check in member, 1- cham cong
    return Promise.all(datas.map(data=>{
        data.trang_thai = trang_thai;
        const url = `${server_url}/api/${id_app}/checkin?access_token=${token}`;
        return axios.post(url,data);
    }))
}
const testServer = async ()=>{
    const url = `${server_url}/api/${id_app}/checkin?limit=1&access_token=${token}`;
    return axios.get(url);
}
const waiting=async (s)=>{
    return new Promise((rs)=>{
        setTimeout(() => {
            rs();
        }, s*1000);
    })
}
const connect = async (device) => {
    try{
        process.send({
            state:"Testing server...",
            color:"black"
        });
        console.log("testing server...");
        await testServer();
    }catch(e){
        console.error(e.message || e);
        process.send({
            state:"Can't connect to server",
            color:"red"
        });
        return;
    }
    console.log("connecting to device");
    process.send({
        state:"Connecting to device...",
        color:"black"
    });
    let zkInstance = new ZKLib(device.ip, device.port, 1000, device.timeout||300);
    try {
        // Create socket to machine 
        await zkInstance.createSocket(error=>{
        },async _closed=>{
            process.send({
                state:"The program will automatically try to reconnect after 15 seconds",
                color:"red"
            });
            //try reconnect after 15s
            await waiting(15)
            connect(device);
        })
        //getinfo device
        console.log(await zkInstance.getInfo())
        console.log("Connected to device");
        process.send({
            state:"Connected to device",
            color:"green"
        });
    } catch (e) {
        console.error("Error connect to device",e);
        /*process.send({
			error: e.message||e,
            state:"Can't connect to device"
		});*/
        return;
    }
    if(device.realtimelog){
        zkInstance.getRealTimeLogs(async (data)=>{
            // do something when some checkin 
            console.log("check in",data)
            const datas = [data].map(data=>{
                return {
                    device_user_id:data.userId,
                    record_time:data.attTime
                }
            })
            try{
                let rs = await checkin(datas,device.trang_thai);
            }catch(e){
                console.error("Error checkin",e.message || e)
            }
        })
    }else{
        async.forever(
            async ()=>{
                try{
                    const logs = await zkInstance.getAttendances();
                    const datas = logs.data.map(data=>{
                        return {
                            device_user_id:data.deviceUserId,
                            record_time:data.recordTime
                        }
                    })
                    try{
                        let rs = await checkin(datas,device.trang_thai);
                        await zkInstance.clearAttendanceLog();
                    }catch(e){
                        console.error("Error checkin",e.message || e)
                    }
                }catch(e){
                    console.error("get logs",e.err)
                }
                return null;
            },(e)=> {
                console.error(e);
            }
        );
    }
    // Get users in machine 
    //const users = await zkInstance.getUsers()
   // console.log("users",users.data)
    /*const attendances = await zkInstance.getAttendances((percent, total)=>{
        // this callbacks take params is the percent of data downloaded and total data need to download 
    })*/

     // YOu can also read realtime log by getRealTimelogs function
    // console.log('check users', users)
    
    // delete the data in machine
    // You should do this when there are too many data in the machine, this issue can slow down machine 
    //zkInstance.clearAttendanceLog();
    
    // Disconnect the machine ( don't do this when you need realtime update :))) 
    //await zkInstance.disconnect()
    //send command
    //let time = await zkInstance.executeCmd(COMMANDS.CMD_GET_TIME)
}
//connect to devices
devices.forEach(device=>{
    connect(device);
});