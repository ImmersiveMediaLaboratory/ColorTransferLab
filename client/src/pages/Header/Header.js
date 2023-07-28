/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import { useState, useEffect, useRef } from "react";
import './Header.scss';
import $ from 'jquery';



/* ----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Renders website logo, name and app version.
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Header(props) {
    // HP logo in the top left corner of the Header 
    const logo_header = "assets/logo.png";
    const icon_darkmode_button = "assets/icons/icon_darkmode.png";
    // Title of the webpage in the header component
    const title_header = "ColorTransferLab";
    // Version number of the app
    const version_header = "v 2.0.0"
    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- STATES
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/
    const [darkmode, setDarkmode] = useState(true)
    const didMount = useRef(false)

    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- HOOKS
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    /*-------------------------------------------------------------------------------------------------------------
    -- ...
    -------------------------------------------------------------------------------------------------------------*/
    useEffect(() => {
        $("#Header_darkmode").on("click", toggleDarkmode)
    }, []);

    /*-------------------------------------------------------------------------------------------------------------
    -- ...
    -------------------------------------------------------------------------------------------------------------*/
    useEffect(() => {
        console.log(darkmode)
        if (didMount.current) {
            if(darkmode) {
                document.body.style.setProperty('--backgroundcolor', "#2B2C34");
                document.body.style.setProperty('--headercolor', "#1F2124");
                document.body.style.setProperty('--fontcolor', "#B4B4B8");
            } else {
                document.body.style.setProperty('--backgroundcolor', "#FFFFFF");
                document.body.style.setProperty('--headercolor', "#B4B4B8");
                document.body.style.setProperty('--fontcolor', "#2B2C34");
            }
        } else {
            didMount.current = true;
        }
    }, [darkmode]);

    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- FUNCTIONS
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/
    const toggleDarkmode = () => {
        setDarkmode(darkmode => !darkmode)
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- Render method
    -------------------------------------------------------------------------------------------------------------*/

    return (
        <header id='Header_header'>
            <img id="Header_logo" src={logo_header}/>
            <div id="Header_text" >{title_header}</div>
            <div id="header_version">{version_header}</div>
            <img id="Header_darkmode" src={icon_darkmode_button}/>
        </header>
    );

  }

export default Header;