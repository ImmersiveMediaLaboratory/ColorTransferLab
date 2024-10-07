/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import {useState, useEffect} from "react";
import './Header.scss';
import $ from 'jquery';
import { consolePrint } from 'pages/Console/Terminal';

/* ----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Renders website logo, name and app version.
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Header(props) {
    // HP logo in the top left corner of the Header 
    const logo_header = "assets/logo.png";
    const icon_darkmode_button = "assets/icons/icon_darkmode2.png";
    const icon_menu_button = "assets/icons/icon_menu.png";
    const icon_linkedin_button = "assets/icons/icon_linkedin.png";
    const icon_github_button = "assets/icons/icon_github.png";
    // Title of the webpage in the header component
    const title_header = "ColorTransferLab";
    // Version number of the app
    const version_header = "v 3.0.0"
    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- STATES
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/
    const [mobileMaxWidth, setMobileMaxWidth] = useState(null);

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
        const styles = getComputedStyle(document.documentElement);
        setMobileMaxWidth(String(styles.getPropertyValue('--mobile-max-width')).trim());
    }, []);

    let componentStyle = {};
    if (window.innerWidth < mobileMaxWidth) {
        componentStyle = { display: "block"};
    }

    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- FUNCTIONS
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/
    const toggleDarkmode = () => {
        consolePrint("WARNING", "Darkmode not supported ...")
        //props.toggleDarkmode(prevDarkmode => !prevDarkmode);
        // setDarkmode(darkmode => !darkmode)
    }

    function toogleMenu() {
        if ($("#body_menu").css("display") === "none") {
            $("#body_menu").css("display", "block")
        } else {
            $("#body_menu").css("display", "none")
        }
    }



    if (window.innerWidth < mobileMaxWidth) {
        $("#Header_darkmode").css("display", "none");
    }
    else 
    {
        $("#Header_darkmode").css("display", "block");
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- Render method
    -------------------------------------------------------------------------------------------------------------*/

    return (
        <header id='Header_header'>
            <a href="https://potechius.com" target="_blank" rel="noreferrer">
                <img id="Header_logo" src={logo_header} alt=""/>
            </a>
            <div id="Header_text" >{title_header}</div>
            <div id="header_version">{version_header}</div>
            <img id="Header_darkmode" src={icon_darkmode_button} alt=""/>
            <a href="https://github.com/ImmersiveMediaLaboratory/ColorTransferLab" target="_blank" rel="noreferrer">
                <img id="Header_github" src={icon_github_button} alt=""/>
            </a>
            {/* <a href="https://www.linkedin.com/in/herbert-p-2154a1216/" target="_blank" rel="noreferrer">
                <img id="Header_linkedin" src={icon_linkedin_button} alt=""/>
            </a> */}
            <img id="Header_menu" onClick={toogleMenu} src={icon_menu_button} alt="" style={componentStyle}/>
        </header>
    );

  }

export default Header;