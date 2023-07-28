/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';

import './Footer.scss';


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Footer: contains copyright text
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Footer(props) {
    const copyright_footer = "Copyright © 2023 Firstname Surname. All Rights Reserved"
    /*-------------------------------------------------------------------------------------------------------------
    -- Render method
    -------------------------------------------------------------------------------------------------------------*/
    return (
        <footer id='Footer_footer'>{copyright_footer}</footer>
    );
  }

export default Footer;