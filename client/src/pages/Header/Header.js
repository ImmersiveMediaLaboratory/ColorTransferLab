/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import './Header.scss';
import Images from "constants/Images";
import Texts from "constants/Texts"


/* ----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Renders website logo, name and app version.
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Header extends React.Component {
    constructor(props) {
      super(props);
      this.state = {render: true};
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- Render method
    -------------------------------------------------------------------------------------------------------------*/
    render() {
        return (
            <header id='Header_header'>
                <img id="Header_logo" src={Images.logo_header}/>
                <div id="Header_text" >{Texts.title_header}</div>
                <div id="header_version">{Texts.version_header}</div>
            </header>
        );
    }
  }

export default Header;