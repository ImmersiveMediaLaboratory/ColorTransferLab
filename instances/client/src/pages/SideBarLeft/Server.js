/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, { useState, useEffect, useRef } from "react";
import $ from 'jquery';

import Algorithms from "./Algorithms";
import Database from "pages/SideBarRight/Database";
import {consolePrint} from 'pages/Console/Terminal'
import {request_available_metrics} from 'pages/Console/Evaluation'
import {request_available_methods} from 'pages/SideBarLeft/Algorithms'
import {request_database_content} from 'pages/SideBarRight/Database'
import {server_request} from 'utils/Utils'

import './Server.scss';

export let active_server = ""
export let SE1_server = "http://192.168.178.49:8002"
//export let SE1_server = "https://potechius.com:"

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Server(props) {
    const icon_availability_no = "assets/icons/icon_availability_no.png";
    const icon_availability_yes = "assets/icons/icon_availability_yes.png";
    const icon_server = "assets/icons/icon_server_grey.png";

    const icon_server_request_button = "assets/icons/icon_export_metric.png";

    const sidebar_server = "SERVER"

    
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
    function request_server_status(server_address) {
        var stat_obj = server_request("GET", "server_status", server_address, null)

        if (stat_obj["enabled"]) 
            consolePrint("INFO", "Server is running at " + stat_obj["data"])
        else 
            consolePrint("WARNING", "No server instance is running")
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- Request available color transfer methods and create buttons to apply these algorithms
    -------------------------------------------------------------------------------------------------------------*/
    function request_available_servers() {
        let stat_obj = server_request("GET", "available_servers", SE1_server, null)

        // check if the request of available servers is fulfilled
        if (stat_obj["enabled"]) 
            createServerButtons(stat_obj)
        else
            $("#server_body").html("")
    }
    /*-------------------------------------------------------------------------------------------------------------
    -- create the color transfer methods based on the request sent to the python server
    -------------------------------------------------------------------------------------------------------------*/
    function createServerButtons(stat_obj) {
        $("#server_body").html("")
        for (let elem of stat_obj["data"]){
            var d = document.createElement('div');

            $(d).addClass("tooltip server_item").attr("title", elem["address"] + ":" + elem["port"]).appendTo($("#server_body"))

            var d_icon = document.createElement('img');
            if(elem["visibility"] == "public") 
                $(d_icon).addClass("server_item_icon").attr("src", icon_availability_yes).appendTo($(d))
            else
                $(d_icon).addClass("server_item_icon").attr("src", icon_availability_yes).appendTo($(d))

            var d_text = document.createElement('div');
            $(d_text).addClass("server_item_text").html(elem["name"]).appendTo($(d))

            $(d).on("click", function(){
                active_server = elem["protocol"] +"://" + elem["address"] + ":" + elem["port"]
                request_server_status(active_server)
                request_available_methods(active_server)
                request_database_content(active_server)
                request_available_metrics(active_server)
            });
        }
    }

    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- STATES
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/
    // const [time, setTime] = useState(Date.now())
    const didMount = useRef(false)

    /*-------------------------------------------------------------------------------------------------------------
    -- ...
    -------------------------------------------------------------------------------------------------------------*/
    // useEffect(() => {
    //     let interval = setInterval(() => setTime(Date.now()), 1000);
    //     didMount.current = true

    //     return () => {
    //         clearInterval(interval);
    //     };
    // }, []);


    // if(didMount.current == true)
    //     request_available_servers()

    /*---------------------------------------------------------------------------------------------------------------
    -- ...
    ---------------------------------------------------------------------------------------------------------------*/
    function handleRequestServers() {
        request_available_servers()
    }

    return (
    <div id="server_main">
        <div id="server_header">
            <img id='server_header_logo' src={icon_server}/>
            <div id='server_header_name'>{sidebar_server}</div>
        </div>
        <div id="server_body">
            <div className="database_elem"/>
        </div>
        <div id="server_request_button">
            <img id="server_request_button_logo" onClick={handleRequestServers} src={icon_server_request_button} title={"Checks for new available servers."}/>
        </div>
    </div>
    );
}

export default Server;