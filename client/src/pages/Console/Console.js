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
import Tabs from "./../Tabs/Tabs";
import Images from "constants/Images"
import SystemConfiguration from "settings/SystemConfiguration"
import { server_request_post_CT } from 'connection/utils_http';
import PointCloud from 'rendering/PointCloud';
import ColorHistogram from './ColorHistogram';
import Requests from 'connection/utils_http';

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Console extends React.Component {
    constructor(props) {
        super(props);
        this.state = {render: true};
    }

    /*---------------------------------------------------------------------------------------------------------------
    --
    ---------------------------------------------------------------------------------------------------------------*/
    chooseFile() {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = _this => {
                let files =   Array.from(input.files);
                console.log(input.files);

                try {
                    const xmlHttp = new XMLHttpRequest();
                    const theUrl = "http://localhost:8001/upload";
                    xmlHttp.open( "POST", theUrl, false );
                    
                    let formData = new FormData()
                    formData.append("file", files[0]);

                    xmlHttp.send(formData);
                    Console.consolePrint("INFO", "File uploaded")
                    Requests.request_database_content()
                }
                catch (e) {
                    console.log(e)
                }



            };
        input.click();
    }

    /*---------------------------------------------------------------------------------------------------------------
    --
    ---------------------------------------------------------------------------------------------------------------*/
    static consolePrint(type, output) {
        if(type == "INFO")
            var sClass = "server_info"
        else if(type == "WARNING")
            var sClass = "server_warning"
        else
            var sClass = "server_error"

        var today = new Date()
        var time = today.getHours().toString().padStart(2, '0') + ":" +
                   today.getMinutes().toString().padStart(2, '0') + ":" +
                   today.getSeconds().toString().padStart(2, '0');
        var output = "<span class='" + sClass + "'>[" + type + " - " + time +"]</span>" + " " + output + "...<br>"
        document.getElementById("Console_tab_console_ta").innerHTML += output
    }

    /*---------------------------------------------------------------------------------------------------------------
    --
    ---------------------------------------------------------------------------------------------------------------*/
    render() {
        return (
            <div id='console_main'>
                <Tabs id="console">
                    <div id="Console_tab_console" label="Console" >
                    <div id="Console_tab_console_ta"></div>
                    </div>
                    <div label="Evaluation">
                        <div id="Console_tab_console_test2">test2</div>
                    </div>
                    <div label="Configuration">
                        <div id="Console_tab_console_test3">test3</div>
                    </div>
                    <div label="Color Statistics">
                        <div id="Console_tab_console_test4">
                            <ColorHistogram id="src_histogram" rendererID="renderer_src"/>
                            <ColorHistogram id="ref_histogram" rendererID="renderer_ref"/>
                            <ColorHistogram id="out_histogram" rendererID="renderer_out"/>
                        </div>
                    </div>
                    <div label="Information">
                        <div id="Console_tab_console_test5">test5</div>
                    </div>
                </Tabs>
                <div id="console_play_button">
                    <img id="console_play_button_logo" src={Images.icon_play_button}/>
                </div>
                <div id="console_upload_button">
                    <img id="console_upload_button_logo" onClick={this.chooseFile} src={Images.icon_upload_button}/>
                </div>
                <div id="console_eval_button">
                    <img id="console_eval_button_logo"  src={Images.icon_eval_button}/>
                </div>
            </div>
        );
    }
}

export default Console;