/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import { useState, useEffect } from "react";
import $ from 'jquery';

import ColorHistogram from './ColorHistogram';
import Evaluation from './Evaluation';
import Terminal from './Terminal';
import Configuration from './Configuration';
import Information from './Information';
import {consolePrint} from './Terminal'
import {evalPrint, exportMetrics} from 'pages/Console/Evaluation'
import {execution_approach} from 'pages/SideBarLeft/Algorithms'
import {pathjoin, server_post_request2, getRandomID} from 'utils/Utils';
import {active_server} from 'pages/SideBarLeft/Server'
import {showView} from 'pages/Body/Renderer'
import {active_reference} from "pages/Body/Body"
import {color_palette} from "pages/Body/ColorTheme"
import {request_database_content} from "pages/SideBarRight/Database"

import './Console.scss';


const gif_loading = "assets/gifs/loading3.gif"

// these parameters will be sent to the python server
export const execution_params_objects = {
    "src": "",
    "ref": "",
    "out": ""
}

/* ------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------*/
const apply_color_transfer = (data, parameters) => {
    let stat_obj = data
    let rankey = parameters
    console.log(stat_obj)

    var isTrueSet = (stat_obj["enabled"] === 'true');

    if(!isTrueSet) {
        showView("renderer_imagerenderer_out", "renderer_canvasrenderer_out", "3D")
        consolePrint("ERROR", stat_obj["data"]["message"])
    }
    else {
        var output_extension = stat_obj["data"]["extension"]
        let renderer_image_inner = $("#renderer_image_innerrenderer_out")
        if(output_extension === "ply" || output_extension === "png" || output_extension === "mp4")
            renderer_image_inner.attr("data-src", pathjoin(active_server,"data", "Output", rankey + "." + output_extension))
        else if(output_extension === "obj")
            renderer_image_inner.attr("data-src", pathjoin(active_server,"data", "Output", "$mesh$" + rankey , rankey + "." + output_extension))
        else if(output_extension === "volu")
            renderer_image_inner.attr("data-src", pathjoin(active_server,"data", "Output", "$volumetric$" + rankey , rankey + "." + output_extension))
        

        renderer_image_inner.attr("data-update", getRandomID())
    }
}


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Console(props) {
    const icon_play_button = "assets/icons/icon_play.png";
    const icon_upload_button = "assets/icons/icon_upload.png";
    const icon_eval_button = "assets/icons/icon_eval.png";
    const icon_camera_button = "assets/icons/icon_camera.png";
    const icon_export_metric_button = "assets/icons/icon_export_metric.png";

    const icon_terminal_button = "assets/icons/icon_terminal.png";
    const icon_evaluation_button = "assets/icons/icon_evaluation.png";
    const icon_configuration_button = "assets/icons/icon_configuration.png";
    const icon_colorstats_button = "assets/icons/icon_colorstats.png";
    const icon_information_button = "assets/icons/icon_information.png";

    const [mobileMaxWidth, setMobileMaxWidth] = useState(null);

    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- HOOKS
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    /*-------------------------------------------------------------------------------------------------------------
    -- ...
    -------------------------------------------------------------------------------------------------------------*/
    useEffect(() => {
        const styles = getComputedStyle(document.documentElement);
        setMobileMaxWidth(String(styles.getPropertyValue('--mobile-max-width')).trim());
        
        $("#console_play_button").on("click", function(){handleClickPlay()})

        // automatically scrolls the terminal content to the bottom
        let interval = setInterval(() => {
            // $("#Console_tab_console_ta").scrollTop($("#Console_tab_console_ta")[0].scrollHeight);
        }, 200);

        return () => {
            clearInterval(interval);
        };

    }, []);

    let componentStyle = {};
    if (window.innerWidth < mobileMaxWidth) {
        componentStyle = { left: "0px", width: "calc(100% - 6px)"};
    }


    /*---------------------------------------------------------------------------------------------------------------
    -- Allows the upload of local images and point clouds.
    -- The items can be accessed via the <Uploads> button within the <DATABASE> window.
    ---------------------------------------------------------------------------------------------------------------*/
    function chooseFile() {
        let input = document.createElement('input');
        input.type = 'file';
        //input.webkitdirectory = true
        // input.directory = true 
        // input.multiple = true
        input.onchange = _this => {
                let files =   Array.from(input.files);

                try {
                    const xmlHttp = new XMLHttpRequest();
                    const theUrl = pathjoin(active_server, "upload");
                    xmlHttp.open( "POST", theUrl, false );
                    
                    let formData = new FormData()
                    formData.append("file", files[0]);

                    // console.log(formData)

                    xmlHttp.send(formData);
                    consolePrint("INFO", "File uploaded")

                    // update databse content
                    request_database_content(active_server)
                    //request_database_content()
                }
                catch (e) {
                    console.log(e)
                }
            };
        input.click();
    }

    /*---------------------------------------------------------------------------------------------------------------
    -- ...
    ---------------------------------------------------------------------------------------------------------------*/
    function handleClickPlay() {
        // check if a Single Input Reference or a Color Theme Reference is selected
        let ref_val
        if(active_reference === "Single Input")
            ref_val = execution_params_objects["ref"]
        else if(active_reference === "Color Theme")
            ref_val = color_palette

        // check if source object, reference object and approach are selected
        console.log(execution_params_objects)
        if(execution_params_objects["src"] !== "" && ref_val !== "" && execution_approach["method"] !== "") {
            consolePrint("INFO", "Apply " + execution_approach["method"])

            // shows a loading screen while executing the selected algorithm
            var renderer_image_inner = document.getElementById("renderer_image_innerrenderer_out")
            showView("renderer_imagerenderer_out", "renderer_canvasrenderer_out", "2D")
            renderer_image_inner.src = gif_loading

            // output file has to be saved with a random name, otherwise the browser loads the cached object
            var rankey = getRandomID()
            // uses the generated key as output name
            execution_params_objects["out"] = pathjoin("Output", rankey)



            var out_dat = {
                "source": execution_params_objects["src"],
                "reference": ref_val,
                "output": execution_params_objects["out"],
                "approach": execution_approach["method"],
                "options": execution_approach["options"]
            }
            server_post_request2(active_server, "color_transfer", out_dat, apply_color_transfer, rankey)
            //apply_color_transfer()
        } else {
            consolePrint("WARNING", "Input selection incomplete or no color transfer approach selected")
        }
    }

    function showMenus(active_menus, event) {
        const menu_list = ["#Console_tab_console_ta", "#Console_tab_console_evaluation", "#Console_tab_console_configuration", "#Console_tab_console_test4", "#Console_tab_console_test5"]

        for(let i = 0; i < menu_list.length; i++)
            $(menu_list[i]).css("display", "none")
        for(let i = 0; i < active_menus.length; i++)
            $(active_menus[i]).css("display", "block")

        
        $(".console_header_element").css("background-color", getComputedStyle(document.documentElement).getPropertyValue('--headercolor'))
        $(event.currentTarget).css("background-color", getComputedStyle(document.documentElement).getPropertyValue('--backgroundcolor'));
    }

    
    /*---------------------------------------------------------------------------------------------------------------
    --
    ---------------------------------------------------------------------------------------------------------------*/
    return (
        <div id='console_main' style={componentStyle}>
            <div id="console_header">
                <div className="console_header_element" onClick={(event) => showMenus(["#Console_tab_console_ta"], event)} style={{backgroundColor:getComputedStyle(document.documentElement).getPropertyValue('--backgroundcolor')}}>
                    {window.innerWidth < mobileMaxWidth ? <img className="console_icons" alt="" src={icon_terminal_button}/> : "Terminal"}
                </div>
                <div className="console_header_element" onClick={(event) => showMenus(["#Console_tab_console_evaluation"], event)}>
                    {window.innerWidth < mobileMaxWidth ? <img className="console_icons" alt="" src={icon_evaluation_button}/> : "Evaluation"}
                </div>
                <div className="console_header_element" onClick={(event) => showMenus(["#Console_tab_console_configuration"], event)}>
                    {window.innerWidth < mobileMaxWidth ? <img className="console_icons" alt="" src={icon_configuration_button}/> : "Configuration"}
                </div>
                <div className="console_header_element" onClick={(event) => showMenus(["#Console_tab_console_test4"], event)}>
                    {window.innerWidth < mobileMaxWidth ? <img className="console_icons" alt="" src={icon_colorstats_button}/> : "Color Stats"}
                </div>
                <div 
                    className="console_header_element" 
                    onClick={(event) => showMenus(["#Console_tab_console_test5"], event)}
                    title='Display details about the selected algorithm, such as the year of publication, abstract, and more.'>
                    {window.innerWidth < mobileMaxWidth ? <img className="console_icons" alt="" src={icon_information_button}/> : "Information"}
                </div>
            </div>



            <div id="console_body">
                <Terminal id="Console_tab_console_ta"/>
                <Evaluation id="Console_tab_console_evaluation"/>
                <Configuration id="Console_tab_console_configuration"/>
                <div id="Console_tab_console_test4">
                    <ColorHistogram id="histogram_src" rendererID="renderer_src" TITLE="Source"/>
                    <ColorHistogram id="histogram_ref" rendererID="renderer_ref" TITLE="Reference"/>
                    <ColorHistogram id="histogram_out" rendererID="renderer_out" TITLE="Output"/>
                </div>
                <Information id="Console_tab_console_test5"/>
            </div>




            <div id="console_play_button">
                <img id="console_play_button_logo" src={icon_play_button} alt="" title={"Apply the selected algorithm."}/>
            </div>
            <div id="console_upload_button">
                <img id="console_upload_button_logo" onClick={chooseFile} src={icon_upload_button} alt="" title={"Upload a local file to the chosen Server."}/>
            </div>
            <div id="console_eval_button">
                <img id="console_eval_button_logo" onClick={evalPrint} src={icon_eval_button} alt="" title={"Apply multiple evaluaiton metrics on source, reference and output."}/>
            </div>
            <div id="console_export_metric_button">
                <img id="console_export_metric_button_logo" onClick={exportMetrics} src={icon_export_metric_button} alt="" title={"Export the evaluation results."}/>
            </div>
            <div id="console_camera_button">
                <img id="console_camera_button_logo" src={icon_camera_button} alt="" title={"Open camera to capture either a source or reference image."}/>
            </div>
        </div>
    );

}

export default Console;
