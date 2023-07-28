/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import './Console.scss';
import SysConf from "settings/SystemConfiguration"
import Terminal from './Terminal';
import {consolePrint} from 'pages/Console/Terminal'
import {server_request} from 'utils/Utils'
import {execution_params_objects} from 'pages/Console/Console'
import {active_server} from 'pages/SideBarLeft/Server'
import { pathjoin } from 'utils/Utils';

export let evaluation_results = {}

export let available_metrics = []

/*---------------------------------------------------------------------------------------------------------------
-- Send request to python server for evaluation which will be printed within the Evaluation tab.
-- Works only if the <comparison> and <output> objects are given.
---------------------------------------------------------------------------------------------------------------*/
export const evalPrint = () => {
    // if(SysConf.execution_params["comparison"] == "" || SysConf.execution_params["output"] == ""){
    //     Console.consolePrint("WARNING", "Both comparison and output image has to be given.")
    //     return
    // }
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
                    console.log(eval_values)

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
            // "comparison": SysConf.execution_params["comparison"],
            "source": execution_params_objects["src"],
            "reference": execution_params_objects["ref"],
            "output": execution_params_objects["out"],
        }

        xmlHttp.send(JSON.stringify(out_dat));
    } catch (e) {
        console.log(e)
    }
}

/*-------------------------------------------------------------------------------------------------------------
-- Request available color transfer metrics and create entries
-------------------------------------------------------------------------------------------------------------*/
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

/*---------------------------------------------------------------------------------------------------------------
--
---------------------------------------------------------------------------------------------------------------*/
const createEmptyEvaluationResults = (data) => {
    for(let item of data) {
        evaluation_results[item] = null
    }
    console.log(evaluation_results)
}

/*---------------------------------------------------------------------------------------------------------------
--
---------------------------------------------------------------------------------------------------------------*/
export const exportMetrics = () => {
    console.log("EX")
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

/*-------------------------------------------------------------------------------------------------------------
-- Request available color transfer metrics and create entries
-------------------------------------------------------------------------------------------------------------*/
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

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Evaluation(props) {
    

    /*---------------------------------------------------------------------------------------------------------------
    --
    ---------------------------------------------------------------------------------------------------------------*/
    return (
        <div id={props.id}></div>
    );
}

export default Evaluation;