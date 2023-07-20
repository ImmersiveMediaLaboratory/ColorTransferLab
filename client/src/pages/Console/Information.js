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
import SysConf from "settings/SystemConfiguration"

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Information extends React.Component {
    /*-------------------------------------------------------------------------------------------------------------
    -- Set color transfer data, i.e. abstract, title, etc., in the information tab
    -------------------------------------------------------------------------------------------------------------*/
    static setInformation(param){
        // set abstract in information tab of console
        var console_info = document.getElementById("Console_tab_console_test5")
        console_info.innerHTML = "<b>Title</b>:<br>" + param["title"] + "<br><br>" + 
                                "<b>Year</b>:<br>" + param["year"] + "<br><br>" + 
                                "<b>Abstract</b>:<br>" + param["abstract"]
    }
    constructor(props) {
        
        super(props);
        this.state = {render: true};
    }

    componentDidMount() {
    }


    /*---------------------------------------------------------------------------------------------------------------
    --
    ---------------------------------------------------------------------------------------------------------------*/
    render() {
        return (
            <div id={this.props.id}></div>
        );
    }
}

export default Information;