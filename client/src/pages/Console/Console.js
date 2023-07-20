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
import SysConf from "settings/SystemConfiguration"
import { server_request_post_CT } from 'utils/utils_http';
import ColorHistogram from './ColorHistogram';
import Requests from 'utils/utils_http';
import Evaluation from './Evaluation';
import Terminal from './Terminal';
import Configuration from './Configuration';
import Information from './Information';

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

    componentDidMount() {
    }

    /*---------------------------------------------------------------------------------------------------------------
    -- Allows the upload of local images and point clouds.
    -- The items can be accessed via the <Uploads> button within the <DATABASE> window.
    ---------------------------------------------------------------------------------------------------------------*/
    chooseFile() {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = _this => {
                let files =   Array.from(input.files);
                console.log(input.files);

                try {
                    const xmlHttp = new XMLHttpRequest();
                    const theUrl = SysConf.address + "upload";
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
    render() {
        return (
            <div id='console_main'>
                <Tabs id="console">
                    <div id="Console_tab_console" label="Terminal" >
                        <Terminal id="Console_tab_console_ta"/>
                    </div>
                    <div label="Evaluation">
                        <Evaluation id="Console_tab_console_evaluation"/>
                    </div>
                    <div label="Configuration">
                        <Configuration id="Console_tab_console_configuration"/>
                    </div>
                    <div label="Color Statistics">
                        <div id="Console_tab_console_test4">
                            <ColorHistogram id="src_histogram" rendererID="renderer_src" TITLE="Source"/>
                            <ColorHistogram id="ref_histogram" rendererID="renderer_ref" TITLE="Reference"/>
                            <ColorHistogram id="out_histogram" rendererID="renderer_out" TITLE="Output"/>
                        </div>
                    </div>
                    <div label="Information">
                        <Information id="Console_tab_console_test5"/>
                    </div>
                </Tabs>
                <div id="console_play_button">
                    <img id="console_play_button_logo" src={Images.icon_play_button}/>
                </div>
                <div id="console_upload_button">
                    <img id="console_upload_button_logo" onClick={this.chooseFile} src={Images.icon_upload_button} title={"Upload a local file to the chosen Server."}/>
                </div>
                <div id="console_eval_button">
                    <img id="console_eval_button_logo" onClick={this.evalPrint} src={Images.icon_eval_button}/>
                </div>
                <div id="console_export_metric_button">
                    <img id="console_export_metric_button_logo" onClick={Evaluation.exportMetrics} src={Images.icon_export_metric_button}/>
                </div>
            </div>
        );
    }
}

export default Console;