/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, { useState, useEffect } from "react";
import $ from 'jquery';
import Histogram from './Histogram';
import Evaluation from './Evaluation';
import Terminal from './Terminal';
import Configuration from './Configuration';
import Information from './Information';
import {consolePrint} from 'Utils/Utils'
import {evalPrint, exportMetrics} from 'Utils/Utils'
import {execution_approach} from 'pages/SideBarLeft/Algorithms'
import {server_post_request2} from 'Utils/Connection';
import {pathjoin, getRandomID} from 'Utils/Utils';
import {active_server} from 'Utils/System'
import {showView} from 'pages/Body/Renderer'
import {active_reference} from "pages/Body/Body"
import {color_palette} from "pages/Body/ColorTheme"
import {request_database_content} from "pages/SideBarRight/Database"
import TabButton from './TabButton';
import './Console.scss';
import ExecutionButton from "./ExecutionButton";
import {execution_params_objects} from 'Utils/System'


/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
function Console() {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    const [componentStyle, setComponentStyle] = useState({});
    const [mobileMaxWidth, setMobileMaxWidth] = useState(null);

    const icon_play_button = "assets/icons/icon_play.png";
    const icon_eval_button = "assets/icons/icon_eval.png";
    const icon_camera_button = "assets/icons/icon_camera.png";
    const icon_export_metric_button = "assets/icons/icon_export_metric.png";
    const icon_terminal_button = "assets/icons/icon_terminal.png";
    const icon_evaluation_button = "assets/icons/icon_evaluation.png";
    const icon_configuration_button = "assets/icons/icon_configuration.png";
    const icon_colorstats_button = "assets/icons/icon_colorstats.png";
    const icon_information_button = "assets/icons/icon_information.png";

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
        setMobileMaxWidth(mobileMaxWidth);
        const updateComponentStyle = () => {
            if (window.innerWidth < mobileMaxWidth2) {
                setComponentStyle({ left: "0px", width: "calc(100% - 6px)"});
            } else {
                setComponentStyle({});
            }
        };

        updateComponentStyle();
        window.addEventListener('resize', updateComponentStyle);

        $("#console_play_button").on("click", function(){handleClickPlay()})

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

    /**************************************************************************************************************
     * Sends a request to the server to apply the selected color transfer algorithm.
     **************************************************************************************************************/
    function handleClickPlay() {
        // check if a Single Input Reference or a Color Theme Reference is selected
        let ref_val
        if(active_reference === "Single Input")
            ref_val = execution_params_objects["ref"]
        else if(active_reference === "Color Theme")
            ref_val = color_palette

        // check if source object, reference object and approach are selected
        if(execution_params_objects["src"] !== "" && ref_val !== "" && execution_approach["method"] !== "") {
            consolePrint("INFO", "Apply " + execution_approach["method"])

            // shows a loading screen while executing the selected algorithm
            var renderer_image_inner = document.getElementById("renderer_image_innerrenderer_out")
            showView("renderer_imagerenderer_out", "renderer_canvasrenderer_out", "2D")
            const gif_loading = "assets/gifs/loading3.gif"
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
        } else {
            consolePrint("WARNING", "Input selection incomplete or no color transfer approach selected")
        }
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div id='console_main' style={componentStyle}>
            {/* The console header contains clickable fields to switch between the terminal, evaluation, configuration, color histograms, and information. */}
            <div id="console_header">
                <TabButton 
                    iconPath={icon_terminal_button} 
                    defaultActive={true}
                    menuID={"console_terminal"}
                    title="Shows status messages and errors."
                >
                    Terminal
                </TabButton>
                <TabButton 
                    iconPath={icon_evaluation_button} 
                    menuID={"console_evaluation"}
                    title="Shows the evaluation results of the selected algorithm."
                >
                    Evaluation
                </TabButton>
                <TabButton 
                    iconPath={icon_configuration_button} 
                    menuID={"console_configuration"}
                    title='Set the parameters for the selected algorithm, such as color space and more'
                >
                    Configuration
                </TabButton>
                <TabButton 
                    iconPath={icon_colorstats_button} 
                    menuID={"console_histogram"}
                    title='Display the color histograms of the source, reference, and output images.'
                >
                    Histogram
                </TabButton>
                <TabButton 
                    iconPath={icon_information_button} 
                    menuID={"console_information"}
                    title='Display details about the selected algorithm, such as the year of publication, abstract, and more.'
                >
                    Information
                </TabButton>
            </div>

            {/* The console body contains the terminal, evaluation, configuration, color histograms, and information. */}
            <div id="console_body">
                <Terminal id="console_terminal"/>
                <Evaluation id="console_evaluation"/>
                <Configuration id="console_configuration"/>
                <Histogram id="console_histogram"/>
                <Information id="console_information"/>
            </div>

            {/* Buttons for uploading a photo, executing the color transfer and the evaluation. */}
            <div className="button-container">
                <ExecutionButton 
                    iconPath={icon_export_metric_button} 
                    onClick={exportMetrics}
                    title={"Export the evaluation results."}
                />
                <ExecutionButton 
                    iconPath={icon_eval_button} 
                    onClick={evalPrint}
                    title={"Apply multiple evaluaiton metrics on source, reference and output."}
                />
                <ExecutionButton 
                    iconPath={icon_play_button} 
                    onClick={handleClickPlay}
                    title={"Apply the selected algorithm."}
                />
            </div>
        </div>
    );
}

export default Console;
