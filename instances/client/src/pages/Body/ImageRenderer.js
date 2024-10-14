/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {Suspense, useState, useEffect, useRef, useMemo} from 'react';
import {useFrame} from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Plane } from "@react-three/drei"
import {Canvas} from "@react-three/fiber";
import './ImageRenderer.scss';
import $ from 'jquery';
import * as THREE from "three";
import Axes from "rendering/Axes"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import RendererButton from './RendererButton';
import SettingsField from './SettingsField';
import SettingsFieldItem from './SettingsFieldItem';
import InfoField from './InfoField';
import Image from 'rendering/Image';
import PointShader from 'shader/PointShader.js';


/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
function ImageRenderer(props) {    
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    const [isFieldSettingVisible, setIsFieldSettingVisible] = useState(false);
    const [isFieldInfoVisible, setIsFieldInfoVisible] = useState(false);
    const [initialScale, setInitialScale] = useState(0.5);
    const [update, setUpdate] = useState(0);
    const [info, setInfo] = useState({});

    const [grid, changeGrid] = useState(<gridHelper args={[20,20, 0x222222, 0x222222]}/>)
    const [axis, changeAxis] = useState(<Axes />)
    const [camera, setCamera] = useState(null);
    const [perspectiveView, setPerspectiveView] = useState(true)

    const vertexPointShader = PointShader.vertexShader
    const fragmentPointShader = PointShader.fragmentShader

    const imageRef = useRef(null);
    const isImageVisible = useRef(true);
    const isCanvasVisible = useRef(false);
    const isHistoVisible = useRef(false);
    const isDistVisible = useRef(false);

    const refPoints = useRef(null);

    const button_settings_texture_icon = "assets/icons/icon_settings_grey.png";
    const button_infos_texture_icon = "assets/icons/icon_information.png"


    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    // useFrame(() => {
    //     if(refPoints.current) {
    //         //refPoints.current.material.uniforms.pointsize = {value: state.pointsize}
    //         refPoints.current.material.uniforms.pointsize = {value: 1.0}
    //     }
    // })

    useEffect(() => {
        
    }, []);
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        isImageVisible.current = true;
        isCanvasVisible.current = false;
        isHistoVisible.current = false;
        isDistVisible.current = false;
        props.setComplete(Math.random());
    }, [props.filePath]);

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    let data = useMemo(
        () => ({
          uniforms: {
            Ka: { value: new THREE.Vector3(1, 1, 1) },
            Kd: { value: new THREE.Vector3(1, 1, 1) },
            Ks: { value: new THREE.Vector3(1, 1, 1) },
            LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
            LightIntensity: { value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
            LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
            Shininess: { value: 1.0 },
            enableNormalColor: { value: false },
            enableColorDistribution: { value: true },
            pointsize: { value: 1.0}
          },
          vertexShader:vertexPointShader,
          fragmentShader:fragmentPointShader,
          
        }),
        []
    )

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        if (perspectiveView) {
            setCamera(<PerspectiveCamera position={[4, 4, 4]} makeDefault />)
        } else {
            setCamera(<OrthographicCamera position={[10, 10, 10]} zoom={40} makeDefault />);
        }
    }, [perspectiveView]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const showSettings = () => {
        console.log("showSettings")
        setIsFieldSettingVisible(!isFieldSettingVisible);
    };

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const showObjectInfo = (e) => {
        setIsFieldInfoVisible(!isFieldInfoVisible);
        setInfo(imageRef.current.getState().info)
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const handleGreyscaleChange = (e) => {
        $(`#${props.innerid}`).css('filter', e.target.checked ? 'grayscale(100%)' : 'none');
    }
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const switchColorDistribution = () => {
        isDistVisible.current = !isDistVisible.current;
        
        if (!isHistoVisible.current) {
            isImageVisible.current = !isImageVisible.current;
            isCanvasVisible.current = !isCanvasVisible.current;
        }

        isHistoVisible.current = false;
        setUpdate(Math.random())
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const switchColorHistogram = () => {
        isHistoVisible.current = !isHistoVisible.current;

        if (!isDistVisible.current) {
            isImageVisible.current = !isImageVisible.current;
            isCanvasVisible.current = !isCanvasVisible.current;
        }

        isDistVisible.current = false;
        setUpdate(Math.random())
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const handlePointSizeChange = (e) => {
        refPoints.current.material.uniforms.pointsize = {value: e.target.value}
        setUpdate(Math.random())
    }

    // const switchDefault = () => {
    //     console.log("switchDefault")
    //     isHistoVisible.current = false;
    //     isDistVisible.current = false;
    //     isImageVisible.current = false;
    //     isCanvasVisible.current = false;
    //     console.log($("#view_empty_" + props.view))
    //     $("#view_empty_" + props.view).css("display", "block");
    //     setUpdate(Math.random())

    // }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div id={props.id} className="renderer_image">    
            {/* Header of the renderer containing buttons for changing the output of the render view*/}
            <div className="rendererbutton-container">
                {/* Button for showing the object infos */}
                <RendererButton onClick={showObjectInfo} src={button_infos_texture_icon}/>
                {/* Button for showing the settings for the mesh view */}
                <RendererButton onClick={showSettings} src={button_settings_texture_icon}/>
                {/* Button for switching between mesh view and the color dostribution view */}
                <RendererButton onClick={switchColorHistogram} src={"assets/icons/icon_histogram_grey.png"}/>
                {/* Button for switching between mesh view and the color dostribution view */}
                <RendererButton onClick={switchColorDistribution} src={"assets/icons/icon_dist_grey.png"}/>
                {/* Button for showing the deafault view */}
                {/* <RendererButton onClick={switchDefault} src={"assets/icons/icon_x.png"}/> */}
            </div>

            
            {/* Canvas for rendering the color distribution */}
            <Canvas 
                id={props.id} 
                className={props.className} 
                style={{
                    "height": "calc(100% - 25px)", 
                    display: isCanvasVisible.current ? "block" : "none"
                }}
            >
                <ambientLight/>
                <OrbitControls />
                {camera}
                {grid}
                {axis}
                <Suspense fallback={null}>
                    {/* {<group>{props.rendering}</group>} */}
                    {isHistoVisible.current && <group>{imageRef.current.getState().histogram3D}</group>}
                    {isDistVisible.current && 
                        <points
                            key={Math.random} 
                            ref={refPoints} 
                        >
                            <bufferGeometry>
                                <bufferAttribute attach={"attributes-position"} {...imageRef.current.getState().colordistribution} />
                                <bufferAttribute attach={"attributes-color"} {...imageRef.current.getState().colordistribution} />
                            </bufferGeometry>
                            <shaderMaterial attach="material" args={[data]} />
                        </points>}
                </Suspense>
            </Canvas>

            <Image 
                ref={imageRef} 
                filePath={props.filePath} 
                innerid={props.innerid} 
                view={props.view}
                visibility={isImageVisible.current}
            />

            {/* Settings for the image view */}
            <SettingsField visibility={isFieldSettingVisible}>
                <SettingsFieldItem type={"checkbox"} default={false} onChange={handleGreyscaleChange}>Greyscale</SettingsFieldItem>

                {isDistVisible.current && (
                    <>
                        <SettingsFieldItem type={"range"} min="1" max="10" default={1} onChange={handlePointSizeChange}>Point Size</SettingsFieldItem>
                    </>
                )}
            </SettingsField>

            {/* Information field of the current object. Shows the width and height etc. */}
            <InfoField visibility={isFieldInfoVisible}>
                {info}
            </InfoField>

        </div>
    )
}

export default ImageRenderer;