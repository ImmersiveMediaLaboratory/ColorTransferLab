/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./GaussianSplatRenderer.scss"
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import * as THREE from 'three';
import React, { useRef, useEffect, useState } from 'react';
import $ from 'jquery';
import {updateHistogram, calculateColorHistograms, calculateMeanAndStdDev,loadTextureAndConvertToArray} from 'Utils/Utils';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Plane } from "@react-three/drei";
import OrbitControlNew from "rendering/OrbitControlNew";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
const GaussianSplatRenderer = (props) => {
    const [isFieldSettingVisible, setIsFieldSettingVisible] = useState(false);
    const [splatScale, setSplatScale] = useState(100.0);
    const [degree, setDegree] = useState(0);

    const containerRef = useRef(null);
    const renderer = useRef(null);
    const camera = useRef(null);
    const viewer = useRef(null);

    const button_settings_texture_icon = "assets/icons/icon_settings_grey.png";

    const showSettings = () => {
        console.log("showSettings")
        setIsFieldSettingVisible(!isFieldSettingVisible);
    };

    const handleDegreeChange = (e) => {
        setDegree(e.target.value);
        console.log(degree)
    };

    const handleSplatScaleChange = (e) => {
        setSplatScale(e.target.value);
        //console.log(splatScale)
    };

    useEffect(() => {
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Erstelle die Szene
        //const threeScene = new THREE.Scene();

        // Erstelle die Kamera
        camera.current = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
        camera.current.position.copy(new THREE.Vector3().fromArray([-3.15634, -0.16946, -0.51552]));
        camera.current.up = new THREE.Vector3().fromArray([0, -1, -0.54]).normalize();
        camera.current.lookAt(new THREE.Vector3().fromArray([1.52976, 2.27776, 1.65898]));

        // Erstelle den Renderer
        renderer.current = new THREE.WebGLRenderer({antialias: false});
        renderer.current.setSize(width, height);
        container.appendChild(renderer.current.domElement);


        // Erstelle den Viewer
        viewer.current = new GaussianSplats3D.Viewer({
            'renderer': renderer.current,
            "camera": camera.current,
            'sphericalHarmonicsDegree': 3,
            'sharedMemoryForWorkers': false,
            "useBuiltInControls": false,
        });

        // necessary to prevent the blocking of the wasd keys
        viewer.current.perspectiveControls = new OrbitControlNew(camera.current, renderer.current.domElement);



        // Bereinige den Renderer bei der Demontage der Komponente
        return () => {
            container.removeChild(renderer.current.domElement);
        };
    }, []);

    useEffect(() => {
        if (props.filePath !== null) {

            // file name should be in the format "filename-ksplat.gsp"
            // gsp has to be removed and the "-" has to be replaced by "."
            let filePath = props.filePath.split(".")[0].replace("-", ".");
            viewer.current.removeSplatScene(0);

            waitForViewerToBeReady(viewer, () => {
                viewer.current.addSplatScene(filePath, {
                    "showLoadingUI": false,
                    onProgress: (progress) => {
                        //console.log( Math.round(progress));
                        //setLoaded(progress)calc(100% - 2px)
                        $(`#${props.renderBarID}`).css("width", Math.round(progress).toString() + "%")
                    }})
                    .then(() => {
                        requestAnimationFrame(update);
                        console.log(viewer.current.splatMesh)
                        //viewer.current.splatMesh.setSplatScale(0.1);
                        props.setComplete(Math.random())
                        $(`#${props.renderBarID}`).css("width", "0%")


                        console.log(viewer.current.splatMesh.splatDataTextures.baseData.colors)
                        const pixelArray = viewer.current.splatMesh.splatDataTextures.baseData.colors
                        const histograms = calculateColorHistograms(pixelArray, false, 4)
                        const { mean, stdDev } = calculateMeanAndStdDev(pixelArray, false, 4);
                        updateHistogram(histograms[0], mean, stdDev, props.view)
                        console.log(histograms)
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

                //console.log(splatScale)

                renderer.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
                camera.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
                camera.current.updateProjectionMatrix();
                viewer.current.update();
                viewer.current.render();
            }
        }
    }, [props.filePath]);

    useEffect(() => {
        if (viewer.current !== null && viewer.current.splatMesh != undefined) {
            // the initial execution of this function will fail because the splatMesh is not yet created
            try {
                viewer.current.splatMesh.setSplatScale(splatScale / 100.0);
            }
            catch (e) {}
        }
    }, [splatScale]);



    function myFunction() {
        console.log('Display style has changed from none!');
        // Weitere Aktionen hier
    }
    

    return(
        <div id={props.id} className="gaussianSplatRenderer">
            <div className="gaussiansplat" ref={containerRef}/>

                        {/* Button for showing the settings for the mesh view */}
            <div className='gs_button_settings' onClick={showSettings}>
                <img className="gs_button_settings_texture_icon" src={button_settings_texture_icon}/>
            </div>     

            {/* Settings field */}
            <div className="gs_field_settings" style={{ display: isFieldSettingVisible ? 'block' : 'none' }}>
                <table style={{width:"100%"}}>
                    <tbody>
                        <tr>
                            <td className='gs_field_settings_table_cell'>Degree</td>
                            <td className='gs_field_settings_table_cell'>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="3" 
                                    value={degree}
                                    onChange={handleDegreeChange} 
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className='gs_field_settings_table_cell'>Splat Scale</td>
                            <td className='gs_field_settings_table_cell'>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={splatScale}
                                    onChange={handleSplatScaleChange} 
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
    )

};

export default GaussianSplatRenderer;