/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, { useState, useRef, useEffect } from "react";
import {pathjoin} from 'utils/Utils';
import TriangleMesh from "rendering/TriangleMesh"

class VolumetricVideo {
    async createVolumetricVideo(filepath, setComplete) {
        const json_path = filepath + ".json";
        console.log(json_path)
        const activeObject = [];
        const activeTextureMap = [];

        try {
            const response = await fetch(json_path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            for (let i = 0; i < data["num_frames"]; i++) {
                let paddedNumber = String(i).padStart(5, '0');

                let texture_path = pathjoin(filepath + "_" + paddedNumber + ".jpg");
                activeTextureMap.push(texture_path);

                const subpath = pathjoin(filepath + "_" + paddedNumber);
                const obj3D = (
                    <TriangleMesh 
                        key={Math.random()} 
                        file_name={subpath} 
                        setGLOComplete={setComplete}
                    />
                );
                activeObject.push(obj3D);
            }
        } catch (error) {
            console.error("Error loading JSON:", error);
        }

        return [activeObject, activeTextureMap];
    }
}

export default VolumetricVideo;