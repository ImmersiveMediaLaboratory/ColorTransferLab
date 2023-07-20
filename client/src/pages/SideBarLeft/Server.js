/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from "react";
import './Server.scss';
import Images from "constants/Images"
import Texts from "constants/Texts";
import Requests from 'utils/utils_http';
import $ from 'jquery';
import Algorithms from "./Algorithms";
import Database from "pages/SideBarRight/Database";
import Evaluation from "pages/Console/Evaluation";
import Terminal from "pages/Console/Terminal";

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Server extends React.Component {
    static active_server = null
    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- Public methods
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    // NONE

    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- Private methods
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    /*-------------------------------------------------------------------------------------------------------------
    -- ...
    -------------------------------------------------------------------------------------------------------------*/
    static #request_server_status(server_address) {
        var stat_obj = Requests.server_request("server_status", server_address)

        if (stat_obj["enabled"]) {
            Terminal.consolePrint("INFO", "Server is running at " + stat_obj["data"])
        }
        else {
            Terminal.consolePrint("WARNING", "No server instance is running")
        }
    }


    /*-------------------------------------------------------------------------------------------------------------
    -- Request available color transfer methods and create buttons to apply these algorithms
    -------------------------------------------------------------------------------------------------------------*/
    static #request_available_servers() {
        let stat_obj = Requests.server_request("available_servers", "http://localhost:8003/")

        // check if the request of available servers is fulfilled
        if (stat_obj["enabled"]) {
            Server.#createServerButtons(stat_obj)
        } else {
            $("#server_body").html("")
        }
    }
    /*-------------------------------------------------------------------------------------------------------------
    -- create the color transfer methods based on the request sent to the python server
    -------------------------------------------------------------------------------------------------------------*/
    static #createServerButtons(stat_obj) {
        $("#server_body").html("")
        for (let elem of stat_obj["data"]){
            var d = document.createElement('div');

            $(d).addClass("tooltip server_item").attr("title", elem["address"] + ":" + elem["port"]).appendTo($("#server_body"))

            var d_icon = document.createElement('img');
            if(elem["visibility"] == "public") {
                $(d_icon).addClass("server_item_icon").attr("src", Images.icon_availability_yes).appendTo($(d))
            } else {
                $(d_icon).addClass("server_item_icon").attr("src", Images.icon_availability_no).appendTo($(d))
            }
            

            var d_text = document.createElement('div');
            $(d_text).addClass("server_item_text").html(elem["name"]).appendTo($(d))

            $(d).on("click", function(){
                var url = "http://" + elem["address"] + ":" + elem["port"] + "/"
                Server.active_server = url
                Server.#request_server_status(url)
                Algorithms.request_available_methods(url)
                Database.request_database_content(url)
                Evaluation.request_available_metrics(url)
            });
        }
    }

    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- Mounting and Updating methods
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    constructor(props) {
        super(props);
        this.state = {
            mounted: false
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.setState({ time: Date.now() }), 1000);
        this.state.mounted = true
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }


    render() {
        if(this.state.mounted == true){
            Server.#request_available_servers()
        }
        console.log("FUUU")
        return (
        <div id="server_main">
            <div id="server_header">
                <img id='server_header_logo' src={Images.icon_server}/>
                <div id='server_header_name'>{Texts.sidebar_server}</div>
            </div>
            <div id="server_body">
                <div className="database_elem">
                        <img className="database_elem_icon" src={Images.icon_database_elem} />
                        <div className="database_elem_text">PLACEHOLDER</div>
                </div>
            </div>
        </div>
        );
    }
}

export default Server;