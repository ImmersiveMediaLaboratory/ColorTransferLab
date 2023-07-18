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


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Server extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
        <div id="server_main">
            <div id="server_header">
                <img id='server_header_logo' src={Images.icon_server}/>
                <div id='server_header_name'>{Texts.sidebar_server}</div>
            </div>
            <div id="server_body">

            </div>
        </div>
        );
    }
}

export default Server;