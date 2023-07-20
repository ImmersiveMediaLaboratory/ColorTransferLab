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
import SysConf from "settings/SystemConfiguration"

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Configuration extends React.Component {
   /*-------------------------------------------------------------------------------------------------------------
    -- Set color transfer data in the configuration tab
    -------------------------------------------------------------------------------------------------------------*/
    static setConfiguration(param) {
        // set options in configuration tab of console
        var console_config = document.getElementById("Console_tab_console_configuration")
        console_config.innerHTML = ""

        const tbl = document.createElement("table");
        const tblBody = document.createElement("tbody");
        const headerVal = ["Parameter", "Value", "Type", "Choices"]
        const optionsVal = ["name", "default", "type", "values"]

        // create table header
        const row = document.createElement("tr");
        for(let j = 0; j < 4; j++) {
            const cell = document.createElement("th");
            const cellText = document.createTextNode(headerVal[j])
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        tblBody.appendChild(row)


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

                function set_option(event, num, type) {
                    if(type == "int" || type == "float")
                        SysConf.execution_params["options"][num]["default"] = Number(event.currentTarget.value)
                    else if(type == "bool")
                        SysConf.execution_params["options"][num]["default"] = (event.currentTarget.value === "true")
                    else
                        SysConf.execution_params["options"][num]["default"] = event.currentTarget.value

                }

                if (optionsVal[j] == "default") {
                    // create select node if a finit number of options are available for a parameter
                    if( param["options"][i]["values"].length > 0 ) {
                        const cell = document.createElement("select");
                        cell.addEventListener("change", event => {set_option(event, i, param["options"][i]["type"])})
                        cell.style.width = "100%";
                        cell.style.backgroundColor = "#2B2C34";
                        cell.style.color = "white";

                        for(let x = 0; x < param["options"][i]["values"].length; x++){
                            let va = param["options"][i]["values"][x]
                            const cellVal = document.createElement("option");
                            cellVal.setAttribute("value", va);
                            if(va == param["options"][i]["default"]) {
                                cellVal.selected = true
                            }
                            cellVal.innerHTML = va
                            cell.appendChild(cellVal);
                        }

                        row.appendChild(cell);
                    }
                    else if( param["options"][i]["type"] == "int" ) {
                        let va = param["options"][i]["default"]
                        const cell = document.createElement("input");
                        cell.addEventListener("change", event => {set_option(event, i, param["options"][i]["type"])})
                        cell.setAttribute("value", va);
                        cell.style.width = "100%";
                        cell.style.backgroundColor = "#2B2C34";
                        cell.style.color = "white";
                        cell.type = "number"
                        cell.min = "-99999"
                        cell.max = "99999"
                        row.appendChild(cell);
                    }
                    else if( param["options"][i]["type"] == "float" ) {
                        let va = param["options"][i]["default"]
                        const cell = document.createElement("input");
                        cell.addEventListener("change", event => {set_option(event, i, param["options"][i]["type"])})
                        cell.setAttribute("value", va);
                        cell.style.width = "100%";
                        cell.style.backgroundColor = "#2B2C34";
                        cell.style.color = "white";
                        cell.type = "number"
                        cell.step = "0.1"
                        cell.min = "0"
                        cell.max = "99999"
                        row.appendChild(cell);
                    }
                    else {
                        const cell = document.createElement("div");
                        cell.innerHTML = "Placeholder"
                        row.appendChild(cell);
                    }


                } 
                else if (optionsVal[j] == "name") {
                    const cellText = document.createTextNode(param["options"][i][optionsVal[j]]);
                    cell.appendChild(cellText);
                    cell.title = param["options"][i]["tooltip"]
                    row.appendChild(cell);
                }
                else {
                    const cellText = document.createTextNode(param["options"][i][optionsVal[j]]);
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                }

            }

            // add the row to the end of the table body
            tblBody.appendChild(row);
        }

        // put the <tbody> in the <table>
        tbl.appendChild(tblBody);
        // sets the border attribute of tbl to '2'
        tbl.setAttribute("tableLayout", "auto");
        tbl.setAttribute("width", "100%");
        //tbl.setAttribute("border", "2");

        console_config.append(tbl)
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

export default Configuration;