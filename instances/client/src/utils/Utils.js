/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/


import ColorHistogram from "rendering/ColorHistogram"
import VoxelGrid from "rendering/VoxelGrid";

/*-------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------*/
export const server_request = (method, path, address, data) => {
    try {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        const xmlHttp = new XMLHttpRequest();
        const theUrl = pathjoin(address, path)
        xmlHttp.open(method, theUrl, false ); // false for synchronous request

        if(method == "GET")
            xmlHttp.send(null);
        else if(method == "POST")
            xmlHttp.send(data);

        // javascript receives json string from python with single quotes which have to be transferred to double quotes
        var stat = xmlHttp.responseText.replaceAll("\'", "\"");
        var stat = stat.replaceAll("True", "true");
        var stat = stat.replaceAll("False", "false");
        var stat = stat.replaceAll("None", "null");
        var stat_obj = JSON.parse(stat);
        stat_obj["enabled"] = (stat_obj["enabled"] === "true")
        return(stat_obj);
    }
    catch (e) {
        var out = {
            "service": path,
            "enabled": false,
            "data": null
        }
        return(out)
    }
}
/*-------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------*/
export const server_post_request = (address, path, data, method, parameters) => {
    try {
        const xmlHttp = new XMLHttpRequest();
        const theUrl = pathjoin(address, path);

        // TEMP: Shouldn't be inside of this method
        var settings_voxellevel = document.getElementById('settings_voxellevel')
        var voxellevel = 0.02
        if(settings_voxellevel.value == 1)
            voxellevel = 0.02
        if(settings_voxellevel.value == 2)
            voxellevel = 0.09
        if(settings_voxellevel.value == 3)
            voxellevel = 0.15

        var out_dat = { "object_path": data,
                        "voxel_level": voxellevel}

        xmlHttp.open("POST", theUrl, true );
        xmlHttp.send(JSON.stringify(out_dat));

        xmlHttp.onload = function (e) {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    var stat = xmlHttp.responseText.replaceAll("\'", "\"");
                    var stat = stat.replaceAll("True", "true");
                    var stat = stat.replaceAll("False", "false");
                    var stat = stat.replaceAll("None", "null");
                    console.log(stat)
                    try {
                        var stat_obj = JSON.parse(stat);
                        console.log(stat_obj)
                        method(stat_obj, parameters)
                    } catch (e) {
                        console.error("JSON parsing error: ", e);
                    }
                } else {
                    console.error(xmlHttp.statusText);
                }
            }
        };
        xmlHttp.onerror = function (e) {
            console.error(xmlHttp.statusText);
        };
    } catch (e) {
        console.log(e)
    }
}

/*-------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------*/
export const server_post_request2 = (address, path, data, method, parameters) => {
    // try {
        const xmlHttp = new XMLHttpRequest();
        const theUrl = pathjoin(address, path);

        var out_dat = data

        xmlHttp.open("POST", theUrl, true );
        xmlHttp.send(JSON.stringify(out_dat));

        xmlHttp.onload = function (e) {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    var stat = xmlHttp.responseText.replaceAll("\'", "\"");
                    var stat = stat.replaceAll("True", "true");
                    var stat = stat.replaceAll("False", "false");
                    var stat = stat.replaceAll("None", "null");
                    var stat_obj = JSON.parse(stat);
                    method(stat_obj, parameters)
                } else {
                    console.error(xmlHttp.statusText);
                }
            }
        };
        xmlHttp.onerror = function (e) {
            console.error(xmlHttp.statusText);
        };
    // } catch (e) {
    //     console.log(e)
    // }
}

/*-------------------------------------------------------------------------------------------------------------
-- check if file exists
-------------------------------------------------------------------------------------------------------------*/
export const request_file_existence = (method, url) => {
    var http = new XMLHttpRequest()
    http.open(method, url, false)
    http.send()
    if (http.status === 200) {
        return true
    } else {
        return false
    } 
}

/*-------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------*/
export const pathjoin = (...vals) => {
    let joinedpath = "";
    let init = true;
    for (let val of vals) {
        let seperator = "/"
        // ignore empty strings
        if(val == "")
            continue
        // prevent adding a seperator at the beginning
        if(init)
            seperator = ""
        joinedpath  += seperator + val;
        init = false
    }
    return joinedpath;
}

export const getRandomID = () => {
    var rid = Math.random().toString().replace(".", "-")
    return rid
}

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Utils {


}

export default Utils