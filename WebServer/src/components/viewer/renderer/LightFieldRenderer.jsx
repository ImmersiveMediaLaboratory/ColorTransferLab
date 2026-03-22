/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.

NOTE:
Conversion of multiple pngs to mp4: 
    ffmpeg -framerate 30 -i image%03d.png -c:v libx264 -pix_fmt yuv420p output.mp4
Reduce video size:
    ffmpeg -i '/home/potechius/Downloads/rectified/output.mp4' -vf scale=512:-1 -c:a copy '/home/potechius/Downloads/outputmedium.mp4'
*/

import './LightFieldRenderer.scss';
import {useState, useEffect, useRef} from 'react';
import {OrbitControls, PerspectiveCamera} from "@react-three/drei"
import * as THREE from 'three';
import {Canvas} from "@react-three/fiber";
import LightFieldPlane from '../elements/LightFieldPlane';
import SettingsFieldItem from '../../console/data/settings/SettingsFieldItem.jsx';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Light field renderer for displaying light field videos in mp4 format.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function LightFieldRenderer({activeDataType, filePath, view, setObjInfo, setSettings}){    
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    const [focus, setFocus] = useState(0.0);
    const [aperture, setAperture] = useState(5.0);
    const [stInput, setStInput] = useState(false);
    const [fieldTexture, setFieldTexture] = useState(null);
    const [cameraMoved, setCameraMoved] = useState(false);

    const controlsRef = useRef();
    const cameraRef = useRef();
    const isImageVisible = useRef(true);
    const planeRef = useRef();

    const camsX = 17;
    const camsY = 17;
    const width = useRef(1.0);
    const height = useRef(1.0);
    const cameraGap = 0.1;

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Load the light field video and extract the frames to a texture. The light field is either in lf format
     * containing a json and a mp4 or in lfd format containing a json and multiple pngs.
     **************************************************************************************************************/
    useEffect(() => {
        const loadVideo = async (data) => {
            const camsX = data.grid_width;
            const camsY = data.grid_height;
            const resX = data.img_width;
            const resY = data.img_height;
            width.current = resX;
            height.current = resY;

            // lf files are zip files containing a json and a mp4
            if(filePath.length === 2)
                extractVideo(filePath[1], resX, resY, camsX, camsY, setFieldTexture);
            // lfd files are zip files containing a json and multiple pngs
            else
                processImageSequence(filePath, resX, resY, camsX, camsY, setFieldTexture);
        };
        
        if (filePath !== null) {
            // read JSON file with lightfield meta data
            const json_path = filePath[0];

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

        if (setSettings && filePath !== null) {
            setSettings(prev => ({
                ...(prev || {}),
                [view]: [
                    <SettingsFieldItem type={"range"} min="-100" max="100" default={focus * 10000.0} onChange={handleFocusChange}>Focus</SettingsFieldItem>,
                    <SettingsFieldItem type={"range"} min="0" max="100" default={aperture * 10.0} onChange={handleApertureChange}>Aperture</SettingsFieldItem>,
                    <SettingsFieldItem type={"checkbox"} default={stInput} onChange={handlePlaneChange}>Show ST Plane</SettingsFieldItem>
                ]
            }));
        }

    }, [filePath]);

    /**************************************************************************************************************
     * Switch between perspective and orthographic view
     **************************************************************************************************************/
    useEffect(() => {
        if (controlsRef.current) {
            const controls = controlsRef.current;
            const handleEnd = () => {
                // Wird aufgerufen, wenn die Kamerabewegung endet
                setCameraMoved(true)
            };
            controls.addEventListener('end', handleEnd);
            return () => controls.removeEventListener('end', handleEnd);
        }
    }, [controlsRef.current]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Updates the focus value of the light field renderer.
     * Focus is in the range of -0.01 to 0.01.
     **************************************************************************************************************/
    const handleFocusChange = (e) => {
        setFocus(e.target.value / 10000.0);
    }

    /**************************************************************************************************************
     * Updates the aperture value of the light field renderer
     * Aperture is in the range of 1.0 to 10.0.
     **************************************************************************************************************/
    const handleApertureChange = (e) => {
        setAperture(e.target.value / 10.0);
    }

    /**************************************************************************************************************
     * Visualize the camera positions of the individual cameras in the light field.
     **************************************************************************************************************/
    const handlePlaneChange = (e) => {
        setStInput(e.target.checked);
    }

    /**************************************************************************************************************
     * The Light Field is stored as a video in mp4 format. The video is extracted and the frames are stored in a
     * texture. The texture is used for rendering the light field.
     **************************************************************************************************************/
    const extractVideo = (filename, resX, resY, camsX, camsY, setFieldTexture) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        canvas.width = resX;
        canvas.height = resY;
        let seekResolve;
        let count = 0;
        let offset = 0;
        const allBuffer = new Uint8Array(resX * resY * 4 * camsX * camsY);

        const getBufferFromVideo = () => {
            ctx.drawImage(video, 0, 0, resX, resY);
            const imgData = ctx.getImageData(0, 0, resX, resY);

            allBuffer.set(imgData.data, offset);
            offset += imgData.data.byteLength;
            count++;
            let progress = Math.round(100 * count / (camsX * camsY));

            window.dispatchEvent(new CustomEvent("webrtc:loadingProgress", {
                detail: {
                    rid: view,
                    status: "progress",
                    progress: progress
                }
            }));
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

            fieldTexture.needsUpdate = true;
            setFieldTexture(fieldTexture);
        };
      
        video.addEventListener('seeked', async function() {
            if (seekResolve) seekResolve();
        });
      
        video.addEventListener('loadeddata', async () => {
            await fetchFrames();

            window.dispatchEvent(new CustomEvent("webrtc:loadingProgress", {
                detail: {
                    rid: view,
                    status: "end",
                    progress: 100
                }
            }));
        });
      
        video.crossOrigin = 'anonymous';
        video.src = filename;
    }
    /**************************************************************************************************************
     * The Light Field is stored as multiple png images. The images are loaded and stored in a texture.
     **************************************************************************************************************/
    const processImageSequence = (filenames, resX, resY, camsX, camsY, setFieldTexture) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        canvas.width = resX;
        canvas.height = resY;
        let count = 0;
        let offset = 0;
        const allBuffer = new Uint8Array(resX * resY * 4 * camsX * camsY);

        const fetchFrames = async () => {
            for (let i = 1; i < filenames.length; i++) {
                const img = new window.Image();
                img.crossOrigin = "anonymous";
                img.src = filenames[i];

                // Warte, bis das Bild geladen ist
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                ctx.clearRect(0, 0, resX, resY);
                ctx.drawImage(img, 0, 0, resX, resY);
                const imgData = ctx.getImageData(0, 0, resX, resY);

                allBuffer.set(imgData.data, offset);
                offset += imgData.data.byteLength;
                count++;
                let progress = Math.round(100 * count / (camsX * camsY));

                window.dispatchEvent(new CustomEvent("webrtc:loadingProgress", {
                    detail: {
                        rid: view,
                        status: "progress",
                        progress: progress
                    }
                }));
            }

            const fieldTexture = new THREE.DataArrayTexture(allBuffer, resX, resY, camsX * camsY);
            fieldTexture.needsUpdate = true;
            setFieldTexture(fieldTexture);

            window.dispatchEvent(new CustomEvent("webrtc:loadingProgress", {
                detail: {
                    rid: view,
                    status: "end",
                    progress: 100
                }
            }));
        };

        fetchFrames();
    };
    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div 
            className="renderer_lightfield"
            style={{ display: activeDataType === "LightField" ? "block" : "none" }}
        >
            {/* Header of the renderer containing buttons for changing the output of the render view*/}
            <div className="rendererbutton-container"/>

            <Canvas
                style={{
                    display: isImageVisible.current ? "block" : "none",
                    height: "calc(100% - 25px)",
                    backgroundColor: "black"
                }}
            >
                <LightFieldPlane
                    ref={planeRef}
                    camsX={camsX}
                    camsY={camsY}
                    width={width.current}
                    height={height.current}
                    cameraGap={cameraGap}
                    fieldTexture={fieldTexture}
                    aperture={aperture}
                    focus={focus}
                    stInput={stInput}    
                    cameraRef={cameraRef}
                    view={view}
                    setObjInfo={setObjInfo}
                    setCameraMoved={setCameraMoved}
                    cameraMoved={cameraMoved}
                />
                <OrbitControls 
                    enableDamping={true}
                    dampingFactor={0.25}
                    target={[0, 0, 1]}
                    ref={controlsRef}
                />
                <PerspectiveCamera 
                    position={[0, 0, 1.5]} 
                    fov={45}
                    ref={cameraRef}
                    makeDefault 
                />
            </Canvas>
        </div>
    )
};