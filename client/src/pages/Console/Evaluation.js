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
import Terminal from './Terminal';

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Evaluation extends React.Component {
    static evaluation_results = {}

    /*-------------------------------------------------------------------------------------------------------------
    -- Request available color transfer metrics and create entries
    -------------------------------------------------------------------------------------------------------------*/
    static request_available_metrics(server_address) {
        let stat_obj = Requests.server_request("available_metrics", server_address)
        
        // check if the request of available methods is fulfilled
        if (stat_obj["enabled"]) {
            Terminal.consolePrint("INFO", "Color transfer metrics were found: "  + stat_obj["data"].length + " in total")
            Evaluation.#createMetricEntries(stat_obj["data"])
            SysConf.available_metrics = stat_obj["data"]
            Evaluation.createEmptyEvaluationResults(stat_obj["data"])
        } else {
            Terminal.consolePrint("WARNING", "No color transfer metrics were found")
        }
    }

    /*---------------------------------------------------------------------------------------------------------------
    --
    ---------------------------------------------------------------------------------------------------------------*/
    static createEmptyEvaluationResults(data) {
        for(let item of data) {
            Evaluation.evaluation_results[item] = null
        }
        console.log(Evaluation.evaluation_results)
    }

    /*---------------------------------------------------------------------------------------------------------------
    --
    ---------------------------------------------------------------------------------------------------------------*/
    static exportMetrics() {
        console.log("EX")
        if(Object.keys(Evaluation.evaluation_results).length == 0) {
            Terminal.consolePrint("WARNING", "Server has to be selected for exporting evaluation results...")
        } else {
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Evaluation.evaluation_results, null, 4));
            var dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href",     dataStr     );
            dlAnchorElem.setAttribute("download", "evaluation_results.json");
            dlAnchorElem.click();
        }
    }


    /*-------------------------------------------------------------------------------------------------------------
    -- Request available color transfer metrics and create entries
    -------------------------------------------------------------------------------------------------------------*/
    static #createMetricEntries(metrics) {
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

    constructor(props) {
        
        super(props);
        this.state = {render: true};
    }

    componentDidMount() {
    }


    /*---------------------------------------------------------------------------------------------------------------
    --
    ---------------------------------------------------------------------------------------------------------------*/
    render() {
        return (
            <div id={this.props.id}></div>
        );
    }
}

export default Evaluation;