/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';

import Algorithms from './Algorithms'
import Server from './Server'

// import './TabsSideBarLeft.scss';
import './SideBarLeft.scss';

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains tabs for the following module classes:
-- (1) Color Transfer
-- (2) Segementation (currently unsupported)
-- (3) Reconstruction (currently unsupported)
-- (4) Registration (currently unsupported)
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function SideBarLeft(props) {
    /*-------------------------------------------------------------------------------------------------------------
    --
    -------------------------------------------------------------------------------------------------------------*/
    return (
        <div id="SideBarLeft_sidebarleft">  
            <Algorithms/> 
            <Server/>
        </div>
    );
}

export default SideBarLeft;