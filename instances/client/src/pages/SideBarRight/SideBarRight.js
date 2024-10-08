/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import { useState, useEffect } from "react";
import Settings from './Settings'
import Database from './Database'
import Items from './Items'
import Objects from './Objects'

import './SideBarRight.scss';


/* ----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function SideBarRight(props) {
    const [mobileMaxWidth, setMobileMaxWidth] = useState(null);

    useEffect(() => {
        const styles = getComputedStyle(document.documentElement);
        setMobileMaxWidth(String(styles.getPropertyValue('--mobile-max-width')).trim());
    }, []);

    let sidebarrightStyle = {};
    if (window.innerWidth < mobileMaxWidth) {
        sidebarrightStyle = {width: "calc(100%)", height: "calc(100% - 300px)", left: "0px"};
    }

    return (
        <div id="SideBarRight_sidebarright" style={sidebarrightStyle}>  
            <Database/> 
            <Items/> 
            {/* <Objects/>  */}
            <Settings setSingleView={props.setSingleView}/>
        </div>
    );
  }

export default SideBarRight;