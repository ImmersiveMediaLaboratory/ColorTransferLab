/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from "react";
import './Algorithms.scss';
import Images from "constants/Images"
import Texts from "constants/Texts";
import Tabs from "./../Tabs/Tabs";
import Requests from 'utils/utils_http';
import $ from 'jquery';
import Terminal from "pages/Console/Terminal";
import SysConf from "settings/SystemConfiguration";
import Configuration from "pages/Console/Configuration"
import Information from "pages/Console/Information"

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Algorithms extends React.Component {


    /*-------------------------------------------------------------------------------------------------------------
    -- Request available color transfer methods and create buttons to apply these algorithms
    -------------------------------------------------------------------------------------------------------------*/
    static request_available_methods(server_address) {
        let stat_obj = Requests.server_request("available_methods", server_address)

        // check if the request of available methods is fulfilled
        if (stat_obj["enabled"]) {
            Terminal.consolePrint("INFO", "Color transfer methods were found: "  + stat_obj["data"].length + " in total")
            Algorithms.#createCTButtons(stat_obj)
        } else {
            Terminal.consolePrint("WARNING", "No color transfer methods were found")
        }
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- create the color transfer methods based on the request sent to the python server
    -------------------------------------------------------------------------------------------------------------*/
    static #createCTButtons(stat_obj) {
        $("#algorithms_content_colorTransfer").html("")
        for (let elem of stat_obj["data"]){
            var d = document.createElement('div');
            $(d).addClass("algorithms_approach").html(elem["name"]).attr("title", elem["title"]).appendTo($("#algorithms_content_colorTransfer"))
            $(d).on("click", function(){Algorithms.#activate_color_transfer(elem)});
        }
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- By clicking on one color transfer button, the correpsonding approach will be activated by calling the
    -- #activate_color_transfer()-method
    -------------------------------------------------------------------------------------------------------------*/
    static #activate_color_transfer(param) {
        SysConf.execution_params["approach"] = param["name"]
        SysConf.execution_params["options"] = param["options"]
        Terminal.consolePrint("INFO", "Set Color Transfer Algorithm to: " + param["name"] )

        Information.setInformation(param);
        Configuration.setConfiguration(param);
    }


    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div id="algorithms_main">
                <div id="algorithms_header">
                    <img id="algorithms_header_logo" src={Images.icon_algorithms}/>
                    <div id="algorithms_header_name">{Texts.sidebar_algorithms}</div>
                </div>
                <Tabs id="algorithms">
                    <div label="Color Transfer" >
                        <div id="algorithms_content_colorTransfer">
                        </div>
                    </div>
                    <div label="Segmentation">
                        <div id="algorithms_content_classification">
                        </div>
                    </div>
                    <div label="Classification">
                        <div id="algorithms_content_reconstruction">
                        </div>
                    </div>
                    <div label="Generation">
                        <div id="algorithms_content_registration">
                        </div>
                    </div>
                </Tabs>
            </div>
        );
    }
}

export default Algorithms;