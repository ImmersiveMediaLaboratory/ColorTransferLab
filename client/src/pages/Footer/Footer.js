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
import Texts from "constants/Texts"


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Footer: contains copyright text
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Footer extends React.Component {
    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    constructor(props) {
      super(props);
      this.state = {render: true};
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- Render method
    -------------------------------------------------------------------------------------------------------------*/
    render() {
        return (
            <footer id='Footer_footer'>{Texts.copyright_footer}</footer>
        );
    }
  }

export default Footer;