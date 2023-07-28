/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {useEffect} from 'react';
import './Console.scss';


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- STATIC METHODS
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------------------------------------------
-- Prints the given output with timestamp and type.
-- Available types: (1) INFO, (2) WARNING, (3) ERROR (4) UNDEFINED 
---------------------------------------------------------------------------------------------------------------*/
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
    document.getElementById("Console_tab_console_ta").innerHTML += output
}

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Terminal(props) {
    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- HOOKS
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    /*-------------------------------------------------------------------------------------------------------------
    -- ...
    -------------------------------------------------------------------------------------------------------------*/
    // useEffect(() => {
    //     initTerminal()
    // }, []);

    /*-------------------------------------------------------------------------------------------------------------
    -- set empty tables for console tabs
    -------------------------------------------------------------------------------------------------------------*/
    // function initTerminal() {
    //     // init information tab
    //     var console_info = document.getElementById("Console_tab_console_test5")
    //     console_info.innerHTML = "<b>Title</b>:<br>" + "-" + "<br><br>" + 
    //                             "<b>Year</b>:<br>" + "-" + "<br><br>" + 
    //                             "<b>Abstract</b>:<br>" + "-";
        
    //     // init configuration tab
    //     var console_config = document.getElementById("Console_tab_console_configuration")
    //     console_config.innerHTML = ""

    //     const tblC = document.createElement("table");
    //     const tblBodyC = document.createElement("tbody");
    //     const headerValC = ["Parameter", "Value", "Type", "Choices"]

    //     // create table header
    //     const rowC = document.createElement("tr");
    //     for(let j = 0; j < headerValC.length; j++) {
    //         const cell = document.createElement("th");
    //         const cellText = document.createTextNode(headerValC[j])
    //         cell.appendChild(cellText);
    //         rowC.appendChild(cell);
    //     }
    //     tblBodyC.appendChild(rowC)
    //     tblC.appendChild(tblBodyC);
    //     tblC.setAttribute("tableLayout", "auto");
    //     tblC.setAttribute("width", "100%");
    //     console_config.append(tblC)

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
    // }

    /*---------------------------------------------------------------------------------------------------------------
    --
    ---------------------------------------------------------------------------------------------------------------*/
    return (
        <div id={props.id}/>
    );
}

export default Terminal;