/*
Copyright 2024 by Herbert Potechius,
Tehnical University of Berlin, Faculty IV - Electrical Engineering and Computer Science
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.

NOTE:
Conversion of multiple pngs to mp4: 
    ffmpeg -framerate 30 -i image%03d.png -c:v libx264 -pix_fmt yuv420p output.mp4
Reduce video size:
    ffmpeg -i '/home/potechius/Downloads/rectified/output.mp4' -vf scale=512:-1 -c:a copy '/home/potechius/Downloads/outputmedium.mp4'
*/

import React, {Suspense, useState, useEffect, useRef, useImperativeHandle, forwardRef} from 'react';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Plane } from "@react-three/drei";
import CustomCanvas from 'rendering/CustomCanvas';
import Axis from "rendering/Axis"
import {Canvas} from "@react-three/fiber";
import './LightFieldRenderer.scss';
import PlaneComponent from 'rendering/PlaneComponent';
import $ from 'jquery';
import * as THREE from 'three';

const LightFieldRenderer = (props) => {    
    const [isFieldSettingVisible, setIsFieldSettingVisible] = useState(true);
    const [focus, setFocus] = useState(0.0);
    const [aperture, setAperture] = useState(5.0);
    const [stInput, setStInput] = useState(false);
    const [fieldTexture, setFieldTexture] = useState(null);

    const camsX = 17;
    const camsY = 17;
    const width = useRef(1.0);
    const height = useRef(1.0);
    const cameraGap = 0.08;
    let lightfield_cameraview = <PerspectiveCamera 
                                    position={[0, 0, 1.5]} 
                                    fov={45}
                                    makeDefault />

    
    const button_settings_texture_icon = "assets/icons/icon_settings_grey.png";


    const showSettings = () => {
        setIsFieldSettingVisible(!isFieldSettingVisible);
    };

    const handleFocusChange = (e) => {
        // focus is in the range of -0.01 to 0.01
        setFocus(e.target.value / 10000.0);
    }

    const handleApertureChange = (e) => {
        // aperture is in the range of 1.0 to 10.0
        setAperture(e.target.value / 10.0);
    }

    const handlePlaneChange = (e) => {
        setStInput(!stInput);
    }

    const extractVideo = (filename, resX, resY, camsX, camsY, setFieldTexture, renderBarID, setComplete) => {
        console.log('extracting video');
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = resX;
        canvas.height = resY;
        let seekResolve;
        let count = 0;
        let offset = 0;
        const allBuffer = new Uint8Array(resX * resY * 4 * camsX * camsY);

        console.log('starting extraction');
      
        const getBufferFromVideo = () => {
            ctx.drawImage(video, 0, 0, resX, resY);
            const imgData = ctx.getImageData(0, 0, resX, resY);

            allBuffer.set(imgData.data, offset);
            offset += imgData.data.byteLength;
            count++;
            let progress = Math.round(100 * count / (camsX * camsY));

            $(`#${renderBarID}`).css("width", progress.toString() + "%")
        };
      
        const fetchFrames = async () => {
            let currentTime = 0;
      
            while (count < camsX * camsY) {
                getBufferFromVideo();
                currentTime += 0.0333;
                video.currentTime = currentTime;
                await new Promise(res => (seekResolve = res));
            }

            const fieldTexture = new THREE.DataArrayTexture(allBuffer, resX, resY, camsX * camsY);
            console.log('Loaded field data');
        
            fieldTexture.needsUpdate = true;
            setFieldTexture(fieldTexture);
        };
      
        video.addEventListener('seeked', async function() {
            if (seekResolve) seekResolve();
        });
      
        video.addEventListener('loadeddata', async () => {
            await fetchFrames();
            console.log('loaded data');
        
            setComplete(Math.random());
            $(`#${renderBarID}`).css("width", "0%")
        });
      
        video.crossOrigin = 'anonymous';
        video.src = filename;
    }

    useEffect(() => {
        const loadVideo = async (data) => {
            const camsX = data.grid_width;
            const camsY = data.grid_height;
            const resX = data.img_width;
            const resY = data.img_height;
            width.current = resX;
            height.current = resY;
            extractVideo(props.filePath, resX, resY, camsX, camsY, setFieldTexture, props.renderBarID, props.setComplete);
        };
        

        if (props.filePath !== null) {
            // read JSON file with lightfield meta data
            const json_path = props.filePath.split(".")[0] + ".json";
            console.log(json_path)

            const loadJson = async () => {
                try {
                    const response = await fetch(json_path);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    loadVideo(data);
                } catch (error) {
                    console.error("Error loading JSON:", error);
                }
            };
            loadJson();
        }

    }, [props.filePath]);

    return (

        <div id={props.id} className="renderer_lightfield">

            {/* Button for showing the settings for the mesh view */}
            <div className='lfr_button_settings' onClick={showSettings}>
                <img className="lfr_button_settings_texture_icon" src={button_settings_texture_icon}/>
            </div>

            <Canvas>
                <PlaneComponent
                    camsX={camsX}
                    camsY={camsY}
                    width={width.current}
                    height={height.current}
                    cameraGap={cameraGap}
                    fieldTexture={fieldTexture}
                    aperture={aperture}
                    focus={focus}
                    stInput={stInput}
                    //uvCoords={uvCoords}
                />
                <OrbitControls 
                    enableDamping={true}
                    dampingFactor={0.25}
                    target={[0, 0, 1]}
                    panSpeed={2}
                />
                {lightfield_cameraview}
            </Canvas>

            {/* Settings field */}
            <div className="lfr_field_settings" style={{ display: isFieldSettingVisible ? 'none' : 'block' }}>
                <table style={{width:"100%"}}>
                    <tbody>
                        <tr>
                            <td className='lfr_field_settings_table_cell'>Focus</td>
                            <td className='lfr_field_settings_table_cell'>
                                <input 
                                    type="range" 
                                    min="-100" 
                                    max="100" 
                                    defaultValue="0" 
                                    onChange={handleFocusChange} 
                                    style={{width: "100%"}}/>
                            </td>
                        </tr>
                        <tr>
                            <td className='lfr_field_settings_table_cell'>Aperture</td>
                            <td className='lfr_field_settings_table_cell'>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    defaultValue="50" 
                                    onChange={handleApertureChange} 
                                    style={{width: "100%"}}/>
                            </td>
                        </tr>
                        <tr>
                            <td className='lfr_field_settings_table_cell'>Show ST Plane</td>
                            <td className='lfr_field_settings_table_cell'>
                                <input 
                                    type="checkbox"
                                    defaultChecked={false}
                                    onChange={handlePlaneChange} 
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
};

export default LightFieldRenderer;