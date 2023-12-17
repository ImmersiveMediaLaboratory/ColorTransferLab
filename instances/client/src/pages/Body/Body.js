/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, { useEffect, useRef } from 'react';
import './Body.scss';
import Renderer from './Renderer';
import ColorTheme from './ColorTheme';
import PreviewBoard from './PreviewBoard';

import Tabs from "../Tabs/Tabs";


export let active_reference = "Single Input"

export const setReferenceWindow = (tab) => {
    if(tab == "Single Input" || tab == "Color Theme") {
        active_reference = tab
        console.log(active_reference)
    }
}


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Body() {


    // function observer_updateReferenceWindow(mutations) {
    //     console.log("WWWW")
    // }


    // useEffect(() => {
    //     // for(let i = 0; i < 10; i++){
    //     //     createPreviewCard("http://10.90.37.213:8001/data/Images", "TheScream.jpg")
    //     // }
    //     let tab_window = document.getElementById("rendererref")
    //     console.log(tab_window)
    //     var observer = new MutationObserver(observer_updateReferenceWindow);
    //     let options = {
    //         attributes: true,
    //         // attributeFilter: ["state"]
    //     };
    //     observer.observe(tab_window, options);
    // }, []);

    return (
      <div id='Body_body'>
        <PreviewBoard id={"body_preview"}/>
        <Renderer id="renderer_src" title="Source" window="src" objInfo={{}}/>

        <div id='rendererref_main'>
            <Tabs id="rendererref" >
                <div label="Single Input" >
                    <div id="RendererRef_single_input">
                        <Renderer id="renderer_ref" title="Reference" window="ref" objInfo={{}}/>
                    </div>
                </div>
                <div label="Color Theme">
                    <ColorTheme id="colortheme"/>
                </div> 
            </Tabs>
        </div>

        <Renderer id="renderer_out" title="Output" window="out" droppable={false} objInfo={{}}/>
      </div>
    );
}

export default Body;