/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from "react";
import $ from 'jquery';

import Tabs from "./../Tabs/Tabs";
import {consolePrint} from 'pages/Console/Terminal'
import {setConfiguration} from "pages/Console/Configuration"
import {setInformation} from "pages/Console/Information"
import {server_request} from 'utils/Utils'

import './Algorithms.scss';


const icon_availability_yes = "assets/icons/icon_availability_yes.png";
const icon_availability_no = "assets/icons/icon_availability_no.png";


export let execution_approach = {
    "method": "",
    "options": ""
}

/*-------------------------------------------------------------------------------------------------------------
-- Request available color transfer methods and create buttons to apply these algorithms
-------------------------------------------------------------------------------------------------------------*/
export const request_available_methods = (server_address) => {
    let stat_obj = server_request("GET", "available_methods", server_address, null)

    console.log(stat_obj)

    // check if the request of available methods is fulfilled
    if (stat_obj["enabled"]) {
        consolePrint("INFO", "Color transfer methods were found: "  + stat_obj["data"].length + " in total")
        createCTButtons(stat_obj)
    } else {
        consolePrint("WARNING", "No color transfer methods were found")
    }
}

/*-------------------------------------------------------------------------------------------------------------
-- create the color transfer methods based on the request sent to the python server
-------------------------------------------------------------------------------------------------------------*/
export const createCTButtons = (stat_obj) => {
    $("#algorithms_content_colorTransfer").html("")
    for (let elem of stat_obj["data"]){
        var d = document.createElement('div');
        $(d).addClass("algorithms_approach").attr("title", elem["title"]).appendTo($("#algorithms_content_colorTransfer"))
        $(d).on("click", function(){activate_color_transfer(elem)});

        // create green dots for each available data type -> and red dots for unavailable data types
        let icon_pos_left = 100;
        for(let type of ["Image", "Mesh", "PointCloud"]){
            let icon_available;
            if(elem["types"].includes(type))
                icon_available = icon_availability_yes
            else
                icon_available = icon_availability_no
            
            var d_icon = document.createElement('img');
            $(d_icon).addClass("algorithms_item_icon").attr("src", icon_available).appendTo($(d)).css("left", icon_pos_left.toString() + "px")
            icon_pos_left += 10
        }



        var d_text = document.createElement('div');
        $(d_text).addClass("algorithms_item_text").html(elem["name"]).appendTo($(d))
    }
}

/*-------------------------------------------------------------------------------------------------------------
-- By clicking on one color transfer button, the correpsonding approach will be activated by calling the
-- #activate_color_transfer()-method
-------------------------------------------------------------------------------------------------------------*/
export const activate_color_transfer = (param) => {
    execution_approach["method"] = param["name"]
    execution_approach["options"] = param["options"]
    consolePrint("INFO", "Set Color Transfer Algorithm to: " + param["name"] )

    setInformation(param);
    setConfiguration(param);
}

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Algorithms(props) {
    const icon_algorithms = "assets/icons/icon_algorithm_grey.png";
    const sidebar_algorithms = "ALGORITHMS"

    return (
        <div id="algorithms_main">
            <div id="algorithms_header">
                <img id="algorithms_header_logo" src={icon_algorithms}/>
                <div id="algorithms_header_name">{sidebar_algorithms}</div>
            </div>
            <Tabs id="algorithms">
                <div label="Color Transfer">
                    <div className="algorithms_list" id="algorithms_content_colorTransfer">
                    </div>
                </div>
                <div label="Segmentation">
                    <div className="algorithms_list" id="algorithms_content_classification">
                    </div>
                </div>
                <div label="Classification">
                    <div className="algorithms_list" id="algorithms_content_reconstruction">
                    </div>
                </div>
                <div label="Generation">
                    <div className="algorithms_list" id="algorithms_content_registration">
                    </div>
                </div>
            </Tabs>
        </div>
    );
}

export default Algorithms;