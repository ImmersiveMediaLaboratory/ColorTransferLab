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
import Images from "constants/Images"
import Texts from 'constants/Texts';


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Objects extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
        return (

            <div id="objects_main">
                <div id="objects_header">
                    <img id='objects_header_logo' src={Images.icon_objects}/>
                    <div id='objects_header_name'>{Texts.sidebar_objects}</div>
                </div>
                <div id="objects_body">
                    <div className="objects_elem">
                            <img className="objects_elem_icon" src={Images.icon_objects_elem} />
                            <div className="objects_elem_text">PLACEHOLDER</div>
                    </div>
                </div>
            </div>
        );
  }
  }

export default Objects;