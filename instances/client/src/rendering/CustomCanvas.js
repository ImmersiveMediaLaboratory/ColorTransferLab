/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, { useState, useEffect, Suspense, useRef} from 'react';
import $ from 'jquery';
import { VRButton, VRCanvas, ARButton, XR, Hands, DefaultXRControllers, XRButton} from '@react-three/xr'
import { Canvas} from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from "@react-three/drei";
import MovementController from 'rendering/MovementController';

function CustomCanvas(props) {
    let canvas;
    // if(props.view == "Output") {
    if(props.view == "FUFUF") {
        canvas = <VRCanvas id={props.id}>
            {props.children}
            <Suspense fallback={null}>
                    {<group>{props.rendering}</group>}
                    {/* {<group>{SysConf.data_config[TITLE]["mesh"] = <PointCloud key={Math.random()} file_path="assets/objects/lamp.ply" id={TITLE}/>}</group>} */}
                    <MovementController
                        hand="left"
                        applyRotation={false}
                        applyHorizontal={true}
                        />
                        <DefaultXRControllers />
                        <Hands 
                    />
            </Suspense>
        </VRCanvas>
    } else {
        canvas = <Canvas id={props.id}>
            {props.children}
            <Suspense fallback={null}>
                    {<group>{props.rendering}</group>}
                    {/* {<group>{SysConf.data_config[TITLE]["mesh"] = <PointCloud key={Math.random()} file_path="assets/objects/lamp.ply" id={TITLE}/>}</group>} */}
            </Suspense>
        </Canvas>
    }
    return (
        canvas
    )
}

export default CustomCanvas;