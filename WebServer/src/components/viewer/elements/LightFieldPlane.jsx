/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import { useRef, useEffect} from 'react';
import {useThree, useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {BufferAttribute} from 'three';
import LightFieldShader from "../shader/LightFieldShader.js";
import { calculateColorHistograms, calculateMeanAndStdDev } from '@/Utils/Utils';
import { useSelection } from "@/contexts/SelectionContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Plane for rendering the light field.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function LightFieldPlane({ camsX, camsY, width, height, cameraGap, fieldTexture, aperture, focus, stInput, cameraRef, view, setObjInfo, cameraMoved, setCameraMoved }){
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /* ------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const planeRef = useRef();
    const planePtsRef = useRef();
    const lastCaptureRef = useRef(0);

    /* ------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const { scene, gl} = useThree();
    const { setSelectedColorDistribution, setSelectedHistogram3D, setSelectedHistogram2D } = useSelection();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Capture shader output when the camera moves, but limit the capture rate to once every 5 seconds to 
     * avoid performance issues.
     **************************************************************************************************************/
    useFrame(() => {
        if (cameraMoved) {
            const now = Date.now();
            if (now - lastCaptureRef.current > 5000) {
                captureShaderOutput();
                lastCaptureRef.current = now;
            }
            setCameraMoved(false);
        }
    });

    /**************************************************************************************************************
     * Initialize the plane geometry and material when the field texture is available.
     **************************************************************************************************************/
    useEffect(() => {
        if(fieldTexture !== null) {
            const planeGeo = new THREE.PlaneGeometry(camsX * cameraGap, camsY * cameraGap, camsX, camsY);

            const planeMat = new THREE.ShaderMaterial({
                uniforms: {
                    aspect: { value: height / width },
                    field: { value: fieldTexture },
                    camArraySize: new THREE.Uniform(new THREE.Vector2(camsX, camsY)),
                    aperture: { value: aperture },
                    focus: { value: focus }
                },
                vertexShader: LightFieldShader.vertexShader,
                fragmentShader: LightFieldShader.fragmentShader,
            });

            const plane = new THREE.Mesh(planeGeo, planeMat);
            // the plane is square, so we need to scale it to the correct aspect ratio
            planeRef.current = plane;

            const ptsMat = new THREE.PointsMaterial({ size: 0.01, color: 0xeeccff });
            const planePts = new THREE.Points(planeGeo, ptsMat);
  
            planePts.visible = stInput;
            planePtsRef.current = planePts;

            plane.add(planePts);
            scene.add(plane);

            // Initial capture
            captureShaderOutput()

            setObjInfo({
                width: width,
                height: height,
                cameraGap: cameraGap,
                camsX: camsX,
                camsY: camsY,
                aperture: aperture,
                focus: focus
            });

            return () => {
                scene.remove(plane);
            };
        }
    }, [camsX, camsY, cameraGap, fieldTexture, aperture, focus, stInput, scene]);


    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    async function captureShaderOutput() {
        // // Render the scene to a render target
        const renderTarget = new THREE.WebGLRenderTarget(width, height);
        gl.setRenderTarget(renderTarget);
        gl.render(scene, cameraRef.current);

        // Read the pixel data from the render target
        const pixelBuffer = new Uint8Array(width * height * 4);
        gl.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixelBuffer);

        const { mean, stdDev } = calculateMeanAndStdDev(pixelBuffer, false, 4);
        // set the histogram data for 2D and 3D rendering
        const histograms = calculateColorHistograms(pixelBuffer, false, 4);

        let colors_buf = new Float32Array(pixelBuffer)
        // Remove every fourth value from colors_buf and divide the remaining values by 255
        const filteredColorsBuf = colors_buf
            .filter((_, index) => (index + 1) % 4 !== 0)
            .map(value => value / 255);

        setSelectedColorDistribution(prev => ({
            ...(prev || {}),
            [view]: new BufferAttribute(new Float32Array(filteredColorsBuf), 3)
        }));

        setSelectedHistogram3D(prev => ({
            ...(prev || {}),
            [view]: histograms[1]
        }));

        setSelectedHistogram2D(prev => ({
            ...(prev || {}),
            [view]: { histogram: histograms[0], mean, stdDev }
        }));

        // Reset the render target to null
        gl.setRenderTarget(null);
    }

}
