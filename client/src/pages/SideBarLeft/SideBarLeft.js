/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import './TabsSideBarLeft.scss';
import Tabs from "./../Tabs/Tabs";
import './SideBarLeft.scss';
import Images from 'constants/Images';
import Texts from 'constants/Texts';


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class SideBarLeft extends React.Component {
    /*-------------------------------------------------------------------------------------------------------------
    --
    -------------------------------------------------------------------------------------------------------------*/
    constructor(props) {
        super(props);
        this.state = {render: true};
    }

    /*-------------------------------------------------------------------------------------------------------------
    --
    -------------------------------------------------------------------------------------------------------------*/
    render() {
        return (
            <div id="sidebarleft_main">
              <div id="sidebarleft_header">
                <img id="sidebarleft_header_logo" src={Images.icon_algorithms}/>
                <div id="sidebarleft_header_name">{Texts.sidebar_algorithms}</div>
              </div>

              <Tabs id="sidebarleft">
                <div label="Color Transfer" >
                  <div id="sidebarleft_content_colorTransfer">
                    {/* <div className="sidebarleft_approach">PLACEHOLDER</div> */}
                  </div>
                </div>
                
                <div label="Segmentation">
                  <div id="SidebarLeft_content_classification">
                    {/* <div className="sidebarleft_approach">PLACEHOLDER</div> */}
                  </div>
                </div>
                {/* 
                <div label="Reconstruction">
                  <div id="SidebarLeft_content_reconstruction">
                    <div className="sidebarleft_approach">PLACEHOLDER</div>
                  </div>
                </div>
                <div label="Registration">
                  <div id="SidebarLeft_content_registration">
                    <div className="sidebarleft_approach">PLACEHOLDER</div>
                  </div>
                </div>
                */}
              </Tabs>

            </div>
        );
    }
  }

export default SideBarLeft;