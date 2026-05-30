/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, { useRef, useState, useEffect } from "react";
import TriangleMesh from "./TriangleMesh"

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Class for creating volumetric video objects.
 ** A volumetric video consists of a sequence of TriangleMesh objects.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function VolumetricVideo({rid, fps, filepath, setObjInfo, setMeshTexture, showFaceNormals, showWireframe,setFrameCounter, playing, forward, backward}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [currentIndex, setCurrentIndex] = useState(0);

    /*------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const currentMeshRef = useRef()
    const numberFrames = useRef(0);
    const meshesData = useRef([]);


    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Setup of the interval for playing the volumetric video.
     **************************************************************************************************************/
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                if(!playing.current) {
                    if (forward.current) {
                        forward.current = false;
                        return (prevIndex + 1) % numberFrames.current;
                    }
                    if (backward.current) {
                        backward.current = false;
                        return (prevIndex - 1 + numberFrames.current) % numberFrames.current;
                    }
                    return prevIndex;
                }

                setFrameCounter(`${prevIndex + 1}/${numberFrames.current}`);

                return (prevIndex + 1) % numberFrames.current;
            });
        }, 1.0 / fps * 1000);
        return () => clearInterval(interval);
    }, [fps]);

   /**************************************************************************************************************
     * Setup of the volumetric video when the filepath changes.
     **************************************************************************************************************/
    useEffect(() => {
        createVolumetricVideo(filepath)

        if(currentMeshRef.current) {
            console.debug("Current mesh ref: ", currentMeshRef.current)
        }
    }, []);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

   /**************************************************************************************************************
    * Function for creating the volumetric video by loading the corresponding files.
    **************************************************************************************************************/
    async function createVolumetricVideo(filepath) {
        const json_path = filepath[0]
        const activeTextureMap = [];

        try {
            const response = await fetch(json_path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // filepath contains of the following information:
            // [0] = path to the json file
            // [1] = path to jpg file with index 0
            // [2] = path to jpg file with index 1
            // [3] = path to mtl file with index 0
            // [4] = path to mtl file with index 1
            // [5] = path to obj file with index 0
            // [6] = path to obj file with index 1
            // ...
   
            numberFrames.current = data["num_frames"];

            const jpgStart = 1;
            const mtlStart = jpgStart + numberFrames.current;
            const objStart = mtlStart + numberFrames.current;

            for (let i = 0; i < numberFrames.current; i++) {

                const texture_path = filepath[jpgStart + i];
                activeTextureMap.push(texture_path);

                const jpg = filepath[jpgStart + i];
                const mtl = filepath[mtlStart + i];
                const obj = filepath[objStart + i];

                const subpath = [jpg, mtl, obj];

                const meshRef = React.createRef();

                meshesData.current.push({
                    idx : i,
                    files : subpath,
                });

                currentMeshRef.current = meshRef;
            }
        } catch (error) {
            console.error("Error loading JSON:", error);
        }
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <>
            {meshesData.current.map((data, index) => (
                <group key={index} visible={index === currentIndex}>
                    <TriangleMesh
                        rid={rid}
                        fileBlobURL={data.files}
                        index={data.idx}
                        currentIndex={currentIndex}
                        setObjInfo={setObjInfo}
                        setMeshTexture={setMeshTexture}
                        showFaceNormals={showFaceNormals}
                        showWireframe={showWireframe}
                    />
                </group>
            ))}
        </>
    )
}