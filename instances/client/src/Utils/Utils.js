/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import $ from 'jquery'
import {execution_approach} from 'pages/SideBarLeft/Algorithms'
import {execution_params_objects} from 'Utils/System'
import {active_server} from 'Utils/System'
import {available_metrics} from 'Utils/System'
import {evaluation_results} from 'Utils/System'
import {server_request} from 'Utils/Connection'

/******************************************************************************************************************
 * Send request to python server for evaluation which will be printed within the Evaluation tab.
 * Works only if the <comparison> and <output> objects are given.
 ******************************************************************************************************************/
export const evalPrint = () => {
    if(execution_params_objects["out"] == "") {
        consolePrint("WARNING", "Source, Reference and Output images have to be given.")
        return
    }

    consolePrint("INFO", "Start Evaluation ...")

    try {
        const xmlHttp = new XMLHttpRequest();
        const theUrl = pathjoin(active_server, "evaluation");
        xmlHttp.open( "POST", theUrl, true );

        xmlHttp.onload = function (e) {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    var stat = xmlHttp.responseText.replaceAll("\'", "\"");
                    var stat_obj = JSON.parse(stat);
                    var eval_values = stat_obj["data"]
                    console.log("EVAL")
                    console.log(stat_obj)

                    if(stat_obj["enabled"] == "false")
                    {
                        consolePrint("ERROR", "Evaluation only for images available...")
                    }
                    else 
                    {
                        // init evaluation
                        var console_eval = document.getElementById("Console_tab_console_evaluation")
                        console_eval.innerHTML = ""

                        const tbl = document.createElement("table");
                        const tblBody = document.createElement("tbody");

                        // create table header
                        const cell = document.createElement("th");
                        const cellText = document.createTextNode("Metric")
                        cell.appendChild(cellText);
                        const cell2 = document.createElement("th");
                        const cellText2 = document.createTextNode("Value")
                        cell2.appendChild(cellText2);

                        const row = document.createElement("tr");
                        row.appendChild(cell);
                        row.appendChild(cell2);
                        tblBody.appendChild(row)

                        for(let j = 0; j < available_metrics.length; j++) {
                            const cell = document.createElement("td");
                            const cellText = document.createTextNode(available_metrics[j])
                            cell.appendChild(cellText);

                            const cell2 = document.createElement("td");
                            let cellText2
                            let eval_result
                            if (typeof eval_values[available_metrics[j]] !== 'undefined')
                                eval_result = eval_values[available_metrics[j]]
                            else
                                eval_result = -1
                            cellText2 = document.createTextNode(eval_result)
                            evaluation_results[available_metrics[j]] = eval_result

                            cell2.appendChild(cellText2);

                            const row = document.createElement("tr");
                            row.appendChild(cell);
                            row.appendChild(cell2);
                            tblBody.appendChild(row)
                        }

                        tbl.appendChild(tblBody);
                        tbl.setAttribute("tableLayout", "auto");
                        tbl.setAttribute("width", "100%");
                        console_eval.append(tbl)
                        consolePrint("INFO", "Evaluation done...")
                    }
                
                } else {
                    console.error(xmlHttp.statusText);
                }
            }
        };
        xmlHttp.onerror = function (e) {
            console.error(xmlHttp.statusText);
        };
        xmlHttp.onloadend = function (e) {
            // changeEnableupdate(Math.random())
        };

        var out_dat = {
            "source": execution_params_objects["src"],
            "reference": execution_params_objects["ref"],
            "output": execution_params_objects["out"],
        }

        xmlHttp.send(JSON.stringify(out_dat));
    } catch (e) {
        console.log(e)
    }
}

/******************************************************************************************************************
 * Request available color transfer metrics and create entries
 ******************************************************************************************************************/
export const request_available_metrics = (server_address) => {
    let stat_obj = server_request("GET", "available_metrics", server_address, null)
    
    // check if the request of available methods is fulfilled
    if (stat_obj["enabled"]) {
        consolePrint("INFO", "Color transfer metrics were found: "  + stat_obj["data"].length + " in total")
        createMetricEntries(stat_obj["data"])
        available_metrics = stat_obj["data"]
        createEmptyEvaluationResults(stat_obj["data"])
    } else {
        consolePrint("WARNING", "No color transfer metrics were found")
    }
}

/******************************************************************************************************************
 * 
 ******************************************************************************************************************/
const createEmptyEvaluationResults = (data) => {
    for(let item of data) {
        evaluation_results[item] = null
    }
    console.log(evaluation_results)
}

/******************************************************************************************************************
 * 
 ******************************************************************************************************************/
export const exportMetrics = () => {
    if(Object.keys(evaluation_results).length == 0) {
        consolePrint("WARNING", "Server has to be selected for exporting evaluation results...")
    } else {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(evaluation_results, null, 4));
        var dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href",     dataStr     );
        dlAnchorElem.setAttribute("download", "evaluation_results.json");
        dlAnchorElem.click();
    }
}

/******************************************************************************************************************
 * Request available color transfer metrics and create entries
 ******************************************************************************************************************/
const createMetricEntries = (metrics) => {
    // init evaluation
    var console_eval = document.getElementById("Console_tab_console_evaluation")
    console_eval.innerHTML = ""

    const tbl = document.createElement("table");
    const tblBody = document.createElement("tbody");

    // create table header
    const cell = document.createElement("th");
    const cellText = document.createTextNode("Metric")
    cell.appendChild(cellText);
    const cell2 = document.createElement("th");
    const cellText2 = document.createTextNode("Value")
    cell2.appendChild(cellText2);

    const row = document.createElement("tr");
    row.appendChild(cell);
    row.appendChild(cell2);
    tblBody.appendChild(row)

    for(let j = 0; j < metrics.length; j++) {
        const cell = document.createElement("td");
        const cellText = document.createTextNode(metrics[j])
        cell.appendChild(cellText);

        const cell2 = document.createElement("td");
        const cellText2 = document.createTextNode(" ")
        cell2.appendChild(cellText2);

        const row = document.createElement("tr");
        row.appendChild(cell);
        row.appendChild(cell2);
        tblBody.appendChild(row)
    }

    tbl.appendChild(tblBody);
    tbl.setAttribute("tableLayout", "auto");
    tbl.setAttribute("width", "100%");
    console_eval.append(tbl)
}

/******************************************************************************************************************
 * Prints the given output with timestamp and type.
 * Available types: (1) INFO, (2) WARNING, (3) ERROR (4) UNDEFINED 
 ******************************************************************************************************************/
export const consolePrint = (type, output) => {
    if(type == "INFO")
        var sClass = "server_info"
    else if(type == "WARNING")
        var sClass = "server_warning"
    else if(type == "ERROR")
        var sClass = "server_error"
    else
        var sClass = "server_undefined"

    var today = new Date()
    var time = today.getHours().toString().padStart(2, '0') + ":" +
               today.getMinutes().toString().padStart(2, '0') + ":" +
               today.getSeconds().toString().padStart(2, '0');
    var output = "<span class='" + sClass + "'>[" + type + " - " + time +"]</span>" + " " + output + "...<br>"

    var objDiv = document.getElementById("console_terminal")
    objDiv.innerHTML += output 
    
    // Scroll to the bottom
    objDiv.scrollTop = objDiv.scrollHeight;
}

/******************************************************************************************************************
 * 
 ******************************************************************************************************************/
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

/******************************************************************************************************************
 * 
 ******************************************************************************************************************/
export const getRandomID = () => {
    var rid = Math.random().toString().replace(".", "-")
    return rid
}

/******************************************************************************************************************
 * Set color transfer data in the configuration tab.
 ******************************************************************************************************************/
export const setConfiguration = (param) => {
    // set options in configuration tab of console
    const configurationview = $("#console_configuration").html("")

    // const tbl = document.createElement("table");
    const tblBody = $("<tbody/>");
    const headerVal = ["Parameter", "Value", "Type", "Choices"]
    const optionsVal = ["name", "default", "type", "values"]

    // create table header
    const row = $("<tr/>")
    for(let j = 0; j < 4; j++) {
        const cell = $("<th/>").attr("class", "cell_config")
        const cellText = document.createTextNode(headerVal[j])
        row.append($(cell).append($(cellText)));
    }
    tblBody.append($(row))

    // creating all cells
    for (let i = 0; i < param["options"].length; i++) {
        // if flag "changeable" is set to false the parameter shouldn't be listed
        if(!param["options"][i]["changeable"])
            continue;

        // creates a table row
        const row = document.createElement("tr");

        for (let j = 0; j < 4; j++) {
            // Create a <td> element and a text node, make the text
            // node the contents of the <td>, and put the <td> at
            // the end of the table row
            const cell = document.createElement("td");
            let cellcontent = null

            function set_option(event, num, type) {
                if(type === "int" || type === "float")
                    execution_approach["options"][num]["default"] = Number(event.currentTarget.value)
                else if(type === "bool")
                    execution_approach["options"][num]["default"] = (event.currentTarget.value === "true")
                else
                    execution_approach["options"][num]["default"] = event.currentTarget.value
            }

            if (optionsVal[j] === "default") {
                // create select node if a finit number of options are available for a parameter
                if( param["options"][i]["values"].length > 0 ) {
                    cellcontent = document.createElement("select");
                    cellcontent.addEventListener("change", event => {set_option(event, i, param["options"][i]["type"])})

                    for(let x = 0; x < param["options"][i]["values"].length; x++){
                        let va = param["options"][i]["values"][x]
                        const cellVal = document.createElement("option");
                        cellVal.setAttribute("value", va);
                        if(va === param["options"][i]["default"])
                            cellVal.selected = true
            
                        cellVal.innerHTML = va
                        cellcontent.appendChild(cellVal);
                    }
                }
                else if( param["options"][i]["type"] === "int" ) {
                    let va = param["options"][i]["default"]
                    cellcontent = document.createElement("input");
                    cellcontent.addEventListener("change", event => {set_option(event, i, param["options"][i]["type"])})
                    cellcontent.setAttribute("value", va);
                    cellcontent.type = "number"
                    cellcontent.min = "-99999"
                    cellcontent.max = "99999"
                }
                else if( param["options"][i]["type"] === "float" ) {
                    let va = param["options"][i]["default"]
                    cellcontent = document.createElement("input");
                    cellcontent.addEventListener("change", event => {set_option(event, i, param["options"][i]["type"])})
                    cellcontent.setAttribute("value", va);
                    cellcontent.type = "number"
                    cellcontent.step = "0.1"
                    cellcontent.min = "0"
                    cellcontent.max = "99999"
                }
                else {
                    cellcontent = document.createElement("div");
                    cellcontent.innerHTML = "Placeholder"
                    cellcontent.classList.add("cell_config");
                }
            } 
            else if (optionsVal[j] === "name") {
                cellcontent = document.createTextNode(param["options"][i][optionsVal[j]]);
                cell.title = param["options"][i]["tooltip"]
            }
            else if (optionsVal[j] === "values") {
                let out_str = ""
                for(let val of param["options"][i][optionsVal[j]])
                    out_str += val + ",\n"
                cellcontent = document.createTextNode(out_str);
            }
            else {
                cellcontent = document.createTextNode(param["options"][i][optionsVal[j]]);
            }

            cell.className = "cell_config"
            cell.appendChild(cellcontent);
            row.appendChild(cell);
        }
        // add the row to the end of the table body
        tblBody.append($(row))
    }

    $(configurationview).append($("<table/>").append($(tblBody)))
}

/******************************************************************************************************************
 * Set color transfer data, i.e. abstract, title, etc., in the information tab
 ******************************************************************************************************************/
export const setInformation = (param) => {
    // set abstract in information tab of console
    var console_info = document.getElementById("console_information")
    console_info.innerHTML = "<b>Title</b>:<br>" + param["title"] + "<br><br>" + 
                            "<b>Year</b>:<br>" + param["year"] + "<br><br>" + 
                            "<b>Abstract</b>:<br>" + param["abstract"]
}

/******************************************************************************************************************
 * 
 ******************************************************************************************************************/
export const updateHistogram_old = (stat_obj, window) => {
    const setPixel = (x, y, w, h, image, r, g, b, val) => {
        if(val == "all") {
            image[(x + (h-y) * w) * 4 + 0] = r;
            image[(x + (h-y) * w) * 4 + 1] = g;
            image[(x + (h-y) * w) * 4 + 2] = b;
        } else if (val == "red")
            image[(x + (h-y) * w) * 4 + 0] = r; 
        else if (val == "green")
            image[(x + (h-y) * w) * 4 + 1] = r; 
        else if (val == "blue")
            image[(x + (h-y) * w) * 4 + 2] = r;
    
        image[(x + (h-y) * w) * 4 + 3] = 255;
    }

    let canvasid = "histogram_canvas_" + window
    let histostatsid = "histogram_stats_" + window

    var histogram = stat_obj["data"]["histogram"]
    var mean = stat_obj["data"]["mean"]
    var std = stat_obj["data"]["std"]

    var maxV = Math.max.apply(null, histogram.map(function(row){ return Math.max.apply(Math, row); }))

    var histogram_scaled = []
    for(var i = 0; i < histogram.length; i++)
        histogram_scaled[i] = [Math.floor(histogram[i][0]/maxV*100), Math.floor(histogram[i][1]/maxV*100), Math.floor(histogram[i][2]/maxV*100)];

    var c = document.getElementById(canvasid);
    var ctx = c.getContext("2d");
    c.height = 100

    var imageData = ctx.createImageData(256, 100);
    for (let x = 0; x < 256; x++) {
        if(x % 64 == 0 && x != 0){
            for (let y=0; y < 100; y++){
                setPixel(x, y, 256, 100, imageData.data, 128, 128, 128, "all")
            }
        }

        for (let y=0; y < histogram_scaled[x][0]; y++)
            setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "red")
        for (let y=0; y < histogram_scaled[x][1]; y++)
            setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "green")
        for (let y=0; y < histogram_scaled[x][2]; y++)
            setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "blue")
    }
    ctx.putImageData(imageData, 0, 0);

    var stats_color = document.getElementById(histostatsid);
    stats_color.innerHTML = "Mean: (" + mean[0] + ", " + mean[1] + ", " + mean[2] + ") - " +
                            "Std: (" + std[0] + ", " + std[1] + ", " + std[2] + ")"
}

/******************************************************************************************************************
 * 
 ******************************************************************************************************************/
export const updateHistogram = (stat_obj, mean, std, window) => {
    const setPixel = (x, y, w, h, image, r, g, b, val) => {
        if(val == "all") {
            image[(x + (h-y) * w) * 4 + 0] = r;
            image[(x + (h-y) * w) * 4 + 1] = g;
            image[(x + (h-y) * w) * 4 + 2] = b;
        } else if (val == "red")
            image[(x + (h-y) * w) * 4 + 0] = r; 
        else if (val == "green")
            image[(x + (h-y) * w) * 4 + 1] = r; 
        else if (val == "blue")
            image[(x + (h-y) * w) * 4 + 2] = r;
    
        image[(x + (h-y) * w) * 4 + 3] = 255;
    }

    let canvasid = "histogram_canvas_" + window
    let histostatsid = "histogram_stats_" + window


    var histogram = stat_obj
    //var mean = stat_obj["data"]["mean"]
    //var std = stat_obj["data"]["std"]

    function findMaxIn2DArray(array) {
        let max = -Infinity;
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array[i].length; j++) {
                if (array[i][j] > max) {
                    max = array[i][j];
                }
            }
        }
        return max;
    }

    const maxV = findMaxIn2DArray(histogram)
    //var maxV = Math.max.apply(null, histogram.map(function(row){ return Math.max.apply(Math, row); }))

    var histogram_scaled = []
    for(var i = 0; i < histogram.length; i++)
        histogram_scaled[i] = [Math.floor(histogram[i][0]/maxV*100), Math.floor(histogram[i][1]/maxV*100), Math.floor(histogram[i][2]/maxV*100)];

    var c = document.getElementById(canvasid);
    var ctx = c.getContext("2d");
    c.height = 100

    var imageData = ctx.createImageData(256, 100);
    for (let x = 0; x < 256; x++) {
        if(x % 64 == 0 && x != 0){
            for (let y=0; y < 100; y++){
                setPixel(x, y, 256, 100, imageData.data, 128, 128, 128, "all")
            }
        }

        for (let y=0; y < histogram_scaled[x][0]; y++)
            setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "red")
        for (let y=0; y < histogram_scaled[x][1]; y++)
            setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "green")
        for (let y=0; y < histogram_scaled[x][2]; y++)
            setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "blue")
    }
    ctx.putImageData(imageData, 0, 0);

    var stats_color = document.getElementById(histostatsid);
    stats_color.innerHTML = "Mean: (" + mean[0] + ", " + mean[1] + ", " + mean[2] + ") - " +
                            "Std: (" + std[0] + ", " + std[1] + ", " + std[2] + ")"
}