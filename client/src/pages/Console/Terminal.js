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
import './TabsConsole.scss';
import Tabs from "./../Tabs/Tabs";
import Images from "constants/Images"
import SysConf from "settings/SystemConfiguration"
import { server_request_post_CT } from 'utils/utils_http';
import ColorHistogram from './ColorHistogram';
import Requests from 'utils/utils_http';
import Evaluation from './Evaluation';

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Terminal extends React.Component {
    constructor(props) {
        
        super(props);
        this.state = {render: true};
    }

    componentDidMount() {
        Terminal.#initTerminal()
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- set empty tables for console tabs
    -------------------------------------------------------------------------------------------------------------*/
    static #initTerminal() {
        // init information tab
        var console_info = document.getElementById("Console_tab_console_test5")
        console_info.innerHTML = "<b>Title</b>:<br>" + "-" + "<br><br>" + 
                                "<b>Year</b>:<br>" + "-" + "<br><br>" + 
                                "<b>Abstract</b>:<br>" + "-";
        
        // init configuration tab
        var console_config = document.getElementById("Console_tab_console_configuration")
        console_config.innerHTML = ""

        const tblC = document.createElement("table");
        const tblBodyC = document.createElement("tbody");
        const headerValC = ["Parameter", "Value", "Type", "Choices"]

        // create table header
        const rowC = document.createElement("tr");
        for(let j = 0; j < headerValC.length; j++) {
            const cell = document.createElement("th");
            const cellText = document.createTextNode(headerValC[j])
            cell.appendChild(cellText);
            rowC.appendChild(cell);
        }
        tblBodyC.appendChild(rowC)
        tblC.appendChild(tblBodyC);
        tblC.setAttribute("tableLayout", "auto");
        tblC.setAttribute("width", "100%");
        console_config.append(tblC)

        // // init evaluation
        // var console_eval = document.getElementById("Console_tab_console_evaluation")
        // console_eval.innerHTML = ""

        // const tbl = document.createElement("table");
        // const tblBody = document.createElement("tbody");
        // const headerVal = ["SSIM", "PSNR", "Bhattacharya", "GSSIM", "HistogramIntersection"]

        // // create table header
        // const row = document.createElement("tr");
        // for(let j = 0; j < headerVal.length; j++) {
        //     const cell = document.createElement("th");
        //     const cellText = document.createTextNode(headerVal[j])
        //     cell.appendChild(cellText);
        //     row.appendChild(cell);
        // }
        // tblBody.appendChild(row)
        // tbl.appendChild(tblBody);
        // tbl.setAttribute("tableLayout", "auto");
        // tbl.setAttribute("width", "100%");
        // console_eval.append(tbl)
    }


    /*---------------------------------------------------------------------------------------------------------------
    -- Prints the given output with timestamp and type.
    -- Available types: (1) INFO, (2) WARNING, (3) ERROR (4) UNDEFINED 
    ---------------------------------------------------------------------------------------------------------------*/
    static consolePrint(type, output) {
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
        document.getElementById("Console_tab_console_ta").innerHTML += output
    }

    /*---------------------------------------------------------------------------------------------------------------
    -- Send request to python server for evaluation which will be printed within the Evaluation tab.
    -- Works only if the <comparison> and <output> objects are given.
    ---------------------------------------------------------------------------------------------------------------*/
    evalPrint() {
        // if(SysConf.execution_params["comparison"] == "" || SysConf.execution_params["output"] == ""){
        //     Console.consolePrint("WARNING", "Both comparison and output image has to be given.")
        //     return
        // }
        if(SysConf.execution_params["output"] == "" || SysConf.execution_params["source"] == "" || SysConf.execution_params["reference"] == ""){
            Terminal.consolePrint("WARNING", "Source, Referemce and Output images have to be given.")
            return
        }

        Terminal.consolePrint("INFO", "Start Evaluation ...")

        try {
            const xmlHttp = new XMLHttpRequest();
            const theUrl = SysConf.address + "evaluation";
            xmlHttp.open( "POST", theUrl, true );

            xmlHttp.onload = function (e) {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {
                        var stat = xmlHttp.responseText.replaceAll("\'", "\"");
                        var stat_obj = JSON.parse(stat);
                        var eval_values = stat_obj["data"]

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

                        for(let j = 0; j < SysConf.available_metrics.length; j++) {
                            const cell = document.createElement("td");
                            const cellText = document.createTextNode(SysConf.available_metrics[j])
                            cell.appendChild(cellText);

                            const cell2 = document.createElement("td");
                            const cellText2 = document.createTextNode(eval_values[SysConf.available_metrics[j]])
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

                        Terminal.consolePrint("INFO", "Evaluation done...")
                    
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
                "source": SysConf.execution_params["source"],
                "reference": SysConf.execution_params["reference"],
                "output": SysConf.execution_params["output"],
            }

            xmlHttp.send(JSON.stringify(out_dat));
        } catch (e) {
            console.log(e)
        }
    }

    /*---------------------------------------------------------------------------------------------------------------
    --
    ---------------------------------------------------------------------------------------------------------------*/
    render() {
        return (
            <div id={this.props.id}>

            </div>
        );
    }
}

export default Terminal;