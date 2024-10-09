/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {useEffect} from 'react';
import './Console.scss';

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
    //document.getElementById("Console_tab_console_ta").innerHTML += output

    var objDiv = document.getElementById("Console_tab_console_ta")
    objDiv.innerHTML += output 
    
    // Scroll to the bottom
    objDiv.scrollTop = objDiv.scrollHeight;
}

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
function Terminal(props) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Prints the initial information message.
     **************************************************************************************************************/
    useEffect(() => {
        consolePrint("INFO", "To reveal the available Compute Engines (CE), simply press the button located within the SERVER section. To set up and make your server visible here, please follow the instructions provided on out GitHub page at https://github.com/ImmersiveMediaLaboratory/ColorTransferLab ...")
    }, []);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div id={props.id}/>
    );
}

export default Terminal;