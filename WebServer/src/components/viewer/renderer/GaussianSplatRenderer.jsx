/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./GaussianSplatRenderer.scss"
import * as THREE from 'three';
import {BufferAttribute} from 'three';
import {useRef, useEffect, useState } from 'react';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import { calculateColorHistograms, calculateMeanAndStdDev} from '@/Utils/Utils';
import OrbitControlNew from "../elements/OrbitControlNew";
import SettingsFieldItem from '../../console/data/settings/SettingsFieldItem.jsx';
import { useSelection } from "@/contexts/SelectionContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Renderer for Gaussian Splats (.splat, .ksplat, .ply) files.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function GaussianSplatRenderer({id, activeDataType, filePath, fileName, fileExtension, view, setObjInfo, setSettings}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /* ------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [splatScale, setSplatScale] = useState(100.0);
    const [degree, setDegree] = useState(0);

    /* ------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const containerRef = useRef(null);
    const renderer = useRef(null);
    const camera = useRef(null);
    const viewer = useRef(null);

    /* ------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    // https://github.com/mkkellogg/GaussianSplats3D/blob/main/src/loaders/SceneFormat.js
    const SceneFormat = {
        'Splat': 0,
        'KSplat': 1,
        'Ply': 2,
        'Spz': 3
    };

    const { setSelectedColorDistribution, setSelectedHistogram3D, setSelectedHistogram2D } = useSelection();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Create the camera
        camera.current = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
        camera.current.position.copy(new THREE.Vector3().fromArray([-3.15634, -0.16946, -0.51552]));
        camera.current.up = new THREE.Vector3().fromArray([0, -1, -0.54]).normalize();
        camera.current.lookAt(new THREE.Vector3().fromArray([1.52976, 2.27776, 1.65898]));

        // Create the renderer
        renderer.current = new THREE.WebGLRenderer({antialias: false});
        renderer.current.setSize(width, height);
        container.appendChild(renderer.current.domElement);

        // Create the viewer
        viewer.current = new GaussianSplats3D.Viewer({
            'renderer': renderer.current,
            "camera": camera.current,
            'sphericalHarmonicsDegree': 3,
            'sharedMemoryForWorkers': false,
            "enableSIMDInSort": false,
            "useBuiltInControls": false,
        });

        // necessary to prevent the blocking of the wasd keys
        viewer.current.perspectiveControls = new OrbitControlNew(camera.current, renderer.current.domElement);

        // Event listener for key presses to rotate the splat mesh with the wasd and qe keys
        const handleKeyDown = (event) => {
            if (event.key === 'q' || event.key === 'Q') {
                viewer.current.splatMesh.rotation.y -= 0.1;
            } else if (event.key === 'e' || event.key === 'E') {
                viewer.current.splatMesh.rotation.y += 0.1;
            }
            else if (event.key === 'a' || event.key === 'A') {
                viewer.current.splatMesh.rotation.x -= 0.1;
            } else if (event.key === 'd' || event.key === 'D') {
                viewer.current.splatMesh.rotation.x += 0.1;
            }
            else if (event.key === 'w' || event.key === 'W') {
                viewer.current.splatMesh.rotation.z -= 0.1;
            } else if (event.key === 's' || event.key === 'S') {
                viewer.current.splatMesh.rotation.z += 0.1;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup function to remove the renderer and event listener when the component is unmounted
        return () => {
            container.removeChild(renderer.current.domElement);
        };
    }, []);

    /**************************************************************************************************************
     * Renders new object if a new file is loaded
     **************************************************************************************************************/
    useEffect(() => {
        if (filePath !== null) {
            let fileExt = fileExtension.toLowerCase();
            let format = null

            format = SceneFormat.Splat
            if (fileExt === "ksplat") {
                format = SceneFormat.KSplat
            } else if (fileExt === "splat") {
                format = SceneFormat.Splat
            } else if (fileExt === "ply") {
                format = SceneFormat.Ply
            } else {
                console.error("File format not supported: " + fileExt)
            }

            viewer.current.removeSplatScene(0);

            waitForViewerToBeReady(viewer, () => {
                viewer.current.addSplatScene(filePath, {
                    "showLoadingUI": false,
                    "format": format,
                    onProgress: (progress) => {
                        window.dispatchEvent(new CustomEvent("webrtc:loadingProgress", {
                            detail: {
                                rid: view,
                                status: "progress",
                                progress: progress
                            }
                        }));
                    }})
                    .then(() => {
                        requestAnimationFrame(update);

                        window.dispatchEvent(new CustomEvent("webrtc:loadingProgress", {
                            detail: {
                                rid: view,
                                status: "end",
                                progress: 0
                            }
                        }));

                        const pixelArray = viewer.current.splatMesh.splatDataTextures.baseData.colors

                        const histograms = calculateColorHistograms(pixelArray, false, 4)
                        const { mean, stdDev } = calculateMeanAndStdDev(pixelArray, false, 4);

                        setSelectedHistogram3D(prev => ({
                            ...(prev || {}),
                            [view]: histograms[1]
                        }));

                        let colors_buf = new Float32Array(pixelArray)
   
                        // Removal of every fourth value from colors_buf and division of the remaining values by 255
                        const filteredColorsBuf = colors_buf
                            .filter((_, index) => (index + 1) % 4 !== 0)
                            .map(value => value / 255);

                        setSelectedColorDistribution(prev => ({
                            ...(prev || {}),
                            [view]: new BufferAttribute(new Float32Array(filteredColorsBuf), 3)
                        }));

                        setSelectedHistogram2D(prev => ({
                            ...(prev || {}),
                            [view]: { histogram: histograms[0], mean, stdDev }
                        }));

                        setObjInfo({
                            "#Vertices": pixelArray.length / 4
                        })
                    });
            });

            function waitForViewerToBeReady(viewer, callback) {
                if (!viewer.current.isLoadingOrUnloading()) {
                    callback();
                } else {
                    setTimeout(() => waitForViewerToBeReady(viewer, callback), 100); // Überprüfe alle 100ms
                }
            }
    
            function update() {
                requestAnimationFrame(update);
                renderer.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
                camera.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
                camera.current.updateProjectionMatrix();
                viewer.current.update();
                viewer.current.render();
            }
        }

        if (setSettings && filePath !== null) {
            setSettings(prev => ({
                ...(prev || {}),
                [view]: [
                    <SettingsFieldItem type={"range"} min="0" max="3" defaultValue={degree} onChange={handleDegreeChange}>Degree</SettingsFieldItem>,
                    <SettingsFieldItem type={"range"} min="0" max="100" defaultValue={splatScale} onChange={handleSplatScaleChange}>Splat Scale</SettingsFieldItem>
                ]
            }));
        }
    }, [filePath]);

    /**************************************************************************************************************
     * Change Splatscale
     **************************************************************************************************************/
    useEffect(() => {
        if (viewer.current !== null && viewer.current.splatMesh !== undefined) {
            // the initial execution of this function will fail because the splatMesh is not yet created
            try {viewer.current.splatMesh.setSplatScale(splatScale / 100.0);}
            catch (e) {}
        }
    }, [splatScale]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Changes the degree of the spherical harmonics.
     * Values between 0 and 3 are allowed.
     **************************************************************************************************************/
    const handleDegreeChange = (e) => {
        setDegree(e.target.value);
    };

    /**************************************************************************************************************
     * Changes the splat scale.
     * Values between 0 and 100 are allowed.
     **************************************************************************************************************/
    const handleSplatScaleChange = (e) => {
        setSplatScale(e.target.value);
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return(
        <div
            className="gaussianSplatRenderer"    
            style={{ display: activeDataType === "GaussianSplatting" ? "block" : "none" }}
        >
            {/* Header of the renderer containing buttons for changing the output of the render view*/}
            <div className="rendererbutton-container"/>

            <div className="gaussiansplat" ref={containerRef} 
                style={{display: "block"}}>
            </div>
        </div>
    )
};