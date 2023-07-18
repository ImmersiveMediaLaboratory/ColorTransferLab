/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from "react";
import './Algorithms.scss';
import Images from "constants/Images"
import Texts from "constants/Texts";
import Tabs from "./../Tabs/Tabs";


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Algorithms extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div id="algorithms_main">
                <div id="algorithms_header">
                    <img id="algorithms_header_logo" src={Images.icon_algorithms}/>
                    <div id="algorithms_header_name">{Texts.sidebar_algorithms}</div>
                </div>
                <Tabs id="algorithms">
                    <div label="Color Transfer" >
                        <div id="algorithms_content_colorTransfer">
                        </div>
                    </div>
                    <div label="Segmentation">
                        <div id="algorithms_content_classification">
                        </div>
                    </div>
                    <div label="Reconstruction">
                        <div id="algorithms_content_reconstruction">
                        </div>
                    </div>
                    <div label="Registration">
                        <div id="algorithms_content_registration">
                        </div>
                    </div>
                </Tabs>
            </div>
        );
    }
}

export default Algorithms;