/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {useState, useEffect} from 'react';
import $ from 'jquery';
import Header from './../Header/Header'
import Footer from './../Footer/Footer'
import SideBarLeft from '../SideBarLeft/SideBarLeft';
import SideBarRight from '../SideBarRight/SideBarRight';
import Console from '../Console/Console';
import Body from '../Body/Body';
import './Main.scss';


/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
function Main() {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    const [width, setWidth] = useState(window.innerWidth);
    const [darkmode, setDarkmode] = useState(true);
    const [mobileLandscape, setMobileLandscape] = useState(false);
    const [singleView, setSingleView] = useState(false)

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Resize the window and set the height of the app to the window height.
     * Check if the window is in landscape mode on mobile devices. Only portrait mode is supported.
     **************************************************************************************************************/
    useEffect(() => {
        function resize() {
            setWidth(window.innerWidth)
            const doc = document.documentElement
            doc.style.setProperty('--app-height', `${window.innerHeight}px`)
        }

        $( window ).on( "resize", function(){resize(); checkWindowSize();});

        const checkWindowSize = () => {
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);
            const isLandscape = window.innerWidth > window.innerHeight;
            setMobileLandscape(isMobile && isLandscape);
        };
        checkWindowSize();
    }, []);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div id="mainbody">
            <Header darkmode={darkmode} toggleDarkmode={setDarkmode}/>
            <Console/>
            <Body width={width} singleView={singleView}/>
            <SideBarLeft/>
            <SideBarRight setSingleView={setSingleView}/>
            {mobileLandscape ? <div id="landscapeOverlay">Landscape mode is not supported!</div> : <></>}
            <Footer/>
        </div>
    );
}

export default Main;
