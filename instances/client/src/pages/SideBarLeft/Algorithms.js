/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from "react";
import { useState, useEffect } from "react";
import $ from 'jquery';
import {consolePrint} from 'Utils/Utils'
import {setConfiguration} from "Utils/Utils"
import {setInformation} from "Utils/Utils"
import {server_request} from 'Utils/Connection'
import './Algorithms.scss';


let icon_availability_yes = "assets/icons/icon_availability_yes.png";
let icon_availability_no = "assets/icons/icon_availability_no.png";

const icon_availability_image_yes = "assets/icons/icon_image_available.png";
const icon_availability_image_no = "assets/icons/icon_image_available_no.png";
const icon_availability_cloud_yes = "assets/icons/icon_cloud_available_yes.png";
const icon_availability_cloud_no = "assets/icons/icon_cloud_available_no.png";
const icon_availability_mesh_yes = "assets/icons/icon_mesh_available_yes.png";
const icon_availability_mesh_no = "assets/icons/icon_mesh_available_no.png";
const icon_availability_video_yes = "assets/icons/icon_video_available_yes.png";
const icon_availability_video_no = "assets/icons/icon_video_available_no.png";
const icon_availability_voluvideo_yes = "assets/icons/icon_voluvideo_available_yes.png";
const icon_availability_voluvideo_no = "assets/icons/icon_voluvideo_available_no.png";


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
        let icon_pos_right = 5;
        for(let type of ["Image", "Mesh", "PointCloud", "Video", "VolumetricVideo"]){
            let icon_available;

            if(type === "Image") {
                icon_availability_yes = icon_availability_image_yes
                icon_availability_no = icon_availability_image_no
            }
            else if (type === "PointCloud") {
                icon_availability_yes = icon_availability_cloud_yes
                icon_availability_no = icon_availability_cloud_no
            }
            else if (type === "Mesh") {
                icon_availability_yes = icon_availability_mesh_yes
                icon_availability_no = icon_availability_mesh_no
            }
            else if (type === "Video") {
                icon_availability_yes = icon_availability_video_yes
                icon_availability_no = icon_availability_video_no
            }
            else if (type === "VolumetricVideo") {
                icon_availability_yes = icon_availability_voluvideo_yes
                icon_availability_no = icon_availability_voluvideo_no
            }
            else {
                icon_availability_yes = "assets/icons/icon_availability_yes.png"
                icon_availability_no = "assets/icons/icon_availability_no.png"
            }

            if(elem["types"].includes(type))
                icon_available = icon_availability_yes
            else
                icon_available = icon_availability_no
            
            var d_icon = document.createElement('img');
            $(d_icon).addClass("algorithms_item_icon").attr("src", icon_available).appendTo($(d)).css("right", icon_pos_right.toString() + "px")
            icon_pos_right += 15
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

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
function Algorithms(props) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    const [mobileMaxWidth, setMobileMaxWidth] = useState(null);
    const [componentStyle, setComponentStyle] = useState({});
    const icon_algorithms = "assets/icons/icon_algorithm_grey.png";
    const icon_colortransfer_button = "assets/icons/icon_colortransfer.png";
    const icon_segmentation_button = "assets/icons/icon_segmentation.png";
    const icon_classification_button = "assets/icons/icon_classification.png";
    const sidebar_algorithms = "ALGORITHMS"

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Update the style of the console component depending on the window width.
     **************************************************************************************************************/
    useEffect(() => {
        const styles = getComputedStyle(document.documentElement);
        const mobileMaxWidth2 = String(styles.getPropertyValue('--mobile-max-width')).trim();
        setMobileMaxWidth(mobileMaxWidth2);
        const updateComponentStyle = () => {
            if (window.innerWidth < mobileMaxWidth2) {
                setComponentStyle({display: "none", width: "calc(100% - 6px)", top: "0px", height: "calc(100% - 6px)"});
            } else {
                setComponentStyle({});
            }
        };

        updateComponentStyle();
        window.addEventListener('resize', updateComponentStyle);

        // Create Button for color transfer algorithms which run on the client side
        const stat_obj = {
            "data": [
                {
                    "title": "Global Color Transfer",
                    "name": "GLO",
                    "types": ["Image", "PointCloud", "Mesh", "Video", "VolumetricVideo"],
                }
            ]
            
        }
        createCTButtons(stat_obj)

        return () => {
            window.removeEventListener('resize', updateComponentStyle);
        };
    }, []);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    function showMenus(active_menus, event) {
        const menu_list = ["#algorithms_content_colorTransfer", "#algorithms_content_segmentation", "#algorithms_content_classification", "#algorithms_content_reconstruction", "#algorithms_content_registration"]

        for(let i = 0; i < menu_list.length; i++)
            $(menu_list[i]).css("display", "none")
        for(let i = 0; i < active_menus.length; i++)
            $(active_menus[i]).css("display", "block")

        // 
        $("#SideBarLeft_sidebarleft").css("display", "block")
        
        $(".algorithms_menu_item").css("background-color", getComputedStyle(document.documentElement).getPropertyValue('--headercolor'))
        $(event.currentTarget).css("background-color", getComputedStyle(document.documentElement).getPropertyValue('--backgroundcolor'));
    }
    
    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div id="algorithms_main" style={componentStyle}>
            <div id="algorithms_header">
                <img id="algorithms_header_logo" src={icon_algorithms} alt=""/>
                <div id="algorithms_header_name">{sidebar_algorithms}</div>
            </div>

            <div id="algorithms_menu">
                <div className="algorithms_menu_item" id="algorithms_menu_colorTransfer" onClick={(event) => showMenus(["#algorithms_content_colorTransfer"], event)} style={{backgroundColor:getComputedStyle(document.documentElement).getPropertyValue('--backgroundcolor')}}>
                    {window.innerWidth < mobileMaxWidth ? <img className="algorithms_icons" alt="" src={icon_colortransfer_button}/> : <div className="algorithms_menu_item_text">Color Transfer</div>}
                </div>

                <div className="algorithms_menu_item" id="algorithms_menu_segmentation" onClick={(event) => showMenus(["#algorithms_content_segmentation"], event)}>
                {window.innerWidth < mobileMaxWidth ? <img className="algorithms_icons" alt="" src={icon_segmentation_button}/> : <div className="algorithms_menu_item_text">Style Transfer</div>}
                </div>

                <div className="algorithms_menu_item" id="algorithms_menu_classification" onClick={(event) => showMenus(["#algorithms_content_classification"], event)}>
                {window.innerWidth < mobileMaxWidth ? <img className="algorithms_icons" alt="" src={icon_classification_button}/> : <div className="algorithms_menu_item_text">Colorization</div>}
                </div>
            </div>

            <div className="algorithms_list" id="algorithms_content_colorTransfer"/>
            <div className="algorithms_list" id="algorithms_content_segmentation">
                <span style={{"color":"grey"}} className="temp_algos">Please select a server instance to enable this service.</span>
            </div>
            <div className="algorithms_list" id="algorithms_content_classification">
                <span style={{"color":"grey"}} className="temp_algos">Please select a server instance to enable this service.</span>
            </div>
        </div>
    );
}

export default Algorithms;