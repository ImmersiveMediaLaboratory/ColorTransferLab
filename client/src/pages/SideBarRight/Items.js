/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import $ from 'jquery';
import './Items.scss';
import { consolePrint } from 'pages/Console/Terminal';

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains the items which will be shown after clicking an element in the DATABASE window
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Items(props) {
    const icon_items = "assets/icons/icon_frames_grey.png";

    const icon_preview_button = "assets/icons/icon_preview.png";
    const sidebar_items = "ITEMS"

    function showPreviews() {
        // only show the preview field if items are in the items list
        if($("#items_body").children().length == 0) {
            consolePrint("WARNING", "Itemslist is empty ...")
            return
        }
        
        if($("#body_preview").css("visibility") == "hidden")
            $("#body_preview").css("visibility", "visible")
        else
            $("#body_preview").css("visibility", "hidden")

    }
    
    return (
        <div id="items_main">
            <div id="items_header">
                <img id='items_header_logo' src={icon_items}/>
                <div id='items_header_name'>{sidebar_items}</div>
                <div className='items_preview_button' onClick={showPreviews}>
                    <img className="items_preview_icon" src={icon_preview_button}/>
                </div>
            </div>
            <div id="items_body"/>
        </div>
    );
}

export default Items;