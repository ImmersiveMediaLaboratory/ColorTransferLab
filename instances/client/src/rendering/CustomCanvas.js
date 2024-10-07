/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {Suspense, useState, useEffect, useRef} from 'react';
import {Canvas} from "@react-three/fiber";
import $ from 'jquery';

function CustomCanvas(props) {    
    const [currentIndex, setCurrentIndex] = useState(0);
    //const meshLength = useRef( props.rendering.length)

    //meshLength.current = props.rendering.length

    useEffect(() => {
        console.log("CustomCanvas useEffect")
        if (Array.isArray(props.rendering)) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    const nu = props.rendering.length;
                    // check if the rendering array is empty to prevent currentIndex to be nan
                    if (nu === 0) {
                        return 0;
                    } else {
                        const newIndex = (prevIndex + 1) % nu;
                        $("#" + props.textureMapID).attr("src", props.activeTextureMap[newIndex]);
                        return newIndex;
                    }
                });
            }, 1.0 / props.fps * 1000);
            return () => clearInterval(interval);
        }
    }, [props.fps]);

    return (
        <Canvas id={props.id} className={props.className}>
            {props.children}
            <Suspense fallback={null}>
                {/* {<group>{props.rendering[currentIndex]}</group>} */}
                {/* {<group>{props.rendering}</group>} */}
                {props.rendering.map((mesh, index) => (
                    <group key={index} visible={index === currentIndex}>
                        {mesh}
                    </group>
                ))}
            </Suspense>
        </Canvas>
    )
}

export default CustomCanvas;