/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import './Database.scss';
import {server_request} from 'connection/utils_http'
import Images from "constants/Images"
import Texts from 'constants/Texts';
import SystemConfiguration from 'settings/SystemConfiguration';


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Database extends React.Component {
    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    constructor(props) {
      super(props);
      this.state = {render: true, database: {}};
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    render() {
        return (
            <div id="database_main">
                <div id="database_header">
                    <img id='database_header_logo' src={Images.icon_database}/>
                    <div id='database_header_name'>{Texts.sidebar_database}</div>
                </div>
                <div id="database_body">
                    <div className="database_elem">
                        <img className="database_elem_icon" src={Images.icon_database_elem} />
                        <div className="database_elem_text">PLACEHOLDER</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Database;