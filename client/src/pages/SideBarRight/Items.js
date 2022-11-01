/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import './Items.scss';
import Images from "constants/Images"
import Texts from 'constants/Texts';


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Items extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
        return (

            <div id="items_main">
                <div id="items_header">
                    <img id='items_header_logo' src={Images.icon_items}/>
                    <div id='items_header_name'>{Texts.sidebar_items}</div>
                </div>
                <div id="items_body">
                <div className="items_elem">
                        <img className="items_elem_icon" src={Images.icon_items_elem} />
                        <div className="items_elem_text">PLACEHOLDER</div>
                    </div>
                </div>
            </div>
        );
  }
  }

export default Items;