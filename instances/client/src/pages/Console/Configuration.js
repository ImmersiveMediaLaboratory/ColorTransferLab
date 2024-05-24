/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {useEffect} from 'react';
import $ from 'jquery'

import './Configuration.scss';
import 'settings/Global.scss'
import {execution_approach} from 'pages/SideBarLeft/Algorithms'

export const execution_params_options = []

/*-------------------------------------------------------------------------------------------------------------
-- Set color transfer data in the configuration tab
-------------------------------------------------------------------------------------------------------------*/
export const setConfiguration = (param) => {
    // set options in configuration tab of console
    const configurationview = $("#Console_tab_console_configuration").html("")

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
                // if(type == "int" || type == "float")
                //     execution_params_options[num]["default"] = Number(event.currentTarget.value)
                // else if(type == "bool")
                //     execution_params_options[num]["default"] = (event.currentTarget.value === "true")
                // else
                //     execution_params_options[num]["default"] = event.currentTarget.value
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

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Configuration(props) {
    useEffect(() => {
        initConfiguration();
    }, []);

    /*-------------------------------------------------------------------------------------------------------------
    -- set empty tables for console tabs
    -------------------------------------------------------------------------------------------------------------*/
    function initConfiguration() {
        // init configuration tab
        const headerValC = ["Parameter", "Value", "Type", "Choices"]
        const configurationview = $("#Console_tab_console_configuration").html("")
        const rowC = $("<tr/>");

        for(let j = 0; j < headerValC.length; j++) {
            const cellcontent = document.createTextNode(headerValC[j]);
            const cell = $("<th/>").attr('class', 'cell_config');
            $(rowC).append($(cell).append($(cellcontent)));
        }
        $(configurationview).append($("<table/>").append($("<tbody/>").append($(rowC))));
    }
 
     /*---------------------------------------------------------------------------------------------------------------
     --
     ---------------------------------------------------------------------------------------------------------------*/

    return (
        <div id={props.id}></div>
    );

 }
 
 export default Configuration;
