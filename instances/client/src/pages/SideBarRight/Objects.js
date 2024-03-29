/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import './Objects.scss';


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Objects(props) {
    const icon_objects = "assets/icons/icon_layer_grey.png";
    const sidebar_objects = "OBJECTS"

    return (
        <div id="objects_main">
            <div id="objects_header">
                <img id='objects_header_logo' src={icon_objects}/>
                <div id='objects_header_name'>{sidebar_objects}</div>
            </div>
            <div id="objects_body"/>
        </div>
    );
}

export default Objects;