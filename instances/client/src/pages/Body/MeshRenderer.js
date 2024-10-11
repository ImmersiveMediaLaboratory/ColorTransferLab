/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {useEffect, useState, useRef} from 'react';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Plane } from "@react-three/drei";
import CustomCanvas from 'rendering/CustomCanvas';
import Axes from "rendering/Axes"
import './MeshRenderer.scss';
import $ from 'jquery';
import {pathjoin} from 'Utils/Utils';
import {active_server} from 'pages/SideBarLeft/Server'
import TriangleMesh from "rendering/TriangleMesh"
import PointCloud from "rendering/PointCloud"
import VolumetricVideo from 'rendering/VolumetricVideo';
import RendererButton from './RendererButton';
import Settings from 'pages/SideBarRight/Settings';
import SettingsField from './SettingsField';
import SettingsFieldItem from './SettingsFieldItem';
import InfoField from './InfoField';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
const MeshRenderer = (props) => {    
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    const [grid, changeGrid] = useState(<gridHelper args={[20,20, 0x222222, 0x222222]}/>)
    const [axis, changeAxis] = useState(<Axes />)
    const [camera, setCamera] = useState(null);
    const [perspectiveView, setPerspectiveView] = useState(true)
    const [isFieldSettingVisible, setIsFieldSettingVisible] = useState(false);
    const [isFieldInfoVisible, setIsFieldInfoVisible] = useState(false);
    const [isTextureMapVisible, setIsTextureMapVisible] = useState(false);
    const [fps, setFps] = useState(1);
    const [info, setInfo] = useState({});

    const pointCloudRef = useRef();
    const meshRef = useRef();

    const currentIndex = useRef(0);
    const activeObject = useRef([]);
    const activeTextureMap = useRef([]);

    const button_settings_texture_icon = "assets/icons/icon_settings_grey.png";
    const button_texturemap_texture_icon = "assets/icons/icon_texturemap_grey.png";
    const button_settings_dist_icon = "assets/icons/icon_dist_grey.png";
    const button_settings_histo_icon = "assets/icons/icon_histogram_grey.png";
    const button_settings_info_icon = "assets/icons/icon_information.png";

    const textureMapID = "texture_map" + props.id;
    const initPath = "data"
    const RID = props.view

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        setIsFieldInfoVisible(false)
        setIsFieldSettingVisible(false)
        if(props.obj_type === "Mesh") {
            const obj = <TriangleMesh 
                            key={Math.random()} 
                            file_name={props.filePath} 
                            ref={meshRef}
                            view={RID}
                            renderBar={props.renderBarID} 
                            setGLOComplete={props.setComplete}
                        />

            const texture_path = pathjoin(props.filePath + ".png");

            activeObject.current.length = 0;
            activeObject.current.push(obj)

            activeTextureMap.current.length = 0;
            activeTextureMap.current.push(texture_path)

            props.setComplete(Math.random())
        }
        else if(props.obj_type === "PointCloud") {
            let obj = <PointCloud
                            key={Math.random()} 
                            file_path={props.filePath} 
                            view={RID}
                            ref={pointCloudRef}
                            renderBar={props.renderBarID} 
                            setGLOComplete={props.setComplete}
                        />

            activeObject.current.length = 0;
            activeObject.current.push(obj)

            props.setComplete(Math.random())
        }
        else if(props.obj_type === "VolumetricVideo") {
            console.log("Video")
            const json_path = props.filePath + ".json";
            console.log(json_path)
            activeObject.current.length = 0;
            activeTextureMap.current.length = 0;

            const volumetricVideo = new VolumetricVideo();
            const loadVideo = async () => {
                const voluReturn = await volumetricVideo.createVolumetricVideo(props.filePath, props.setComplete);
                activeObject.current.push(...voluReturn[0]);
                activeTextureMap.current.push(...voluReturn[1]);
                console.log(activeObject.current);
            };
            loadVideo();
        }

    }, [props.filePath]);

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
    const handleGridChange = (e) => {
        if (e.target.checked) {
            changeGrid(<gridHelper args={[20, 20, 0x222222, 0x222222]} />);
        } else {
            changeGrid(null);
        }
    };

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const handleAxisChange = (e) => {
        if (e.target.checked) {
            changeAxis(<Axes />);
        } else {
            changeAxis(null);
        }
    };

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const handlePointSizeChange = (e) => {
        if (pointCloudRef.current)
            pointCloudRef.current.updateState({
                pointsize: e.target.value,
            })
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const handleOrthographicViewChange = (e) => {
        setPerspectiveView(!e.target.checked)
        
    };

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const handleFpsChange = (event) => {
        setFps(event.target.value);
    };

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const handleVertexNormalViewChange = (e) => {
        console.log("handleVertexNormalViewChange")
        console.log(e.target.checked)
        if (pointCloudRef.current)
            pointCloudRef.current.updateState({
                colornormal: e.target.checked,
            })
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const showSettings = () => {
        setIsFieldSettingVisible(!isFieldSettingVisible);

        if(!isFieldSettingVisible)
            setIsFieldInfoVisible(false)
    };

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const showTextureMap = () => {
        console.log("showTextureMap")
        setIsTextureMapVisible(!isTextureMapVisible);
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const switchColorDistribution = () => {

        if (props.obj_type === "Mesh") {
            if (meshRef.current)
                meshRef.current.updateState({
                    colordistribution:  !meshRef.current.getState().colordistribution,
                    //colorhistogram: false
                })
        } else if (props.obj_type === "PointCloud") {
            if (pointCloudRef.current)
                pointCloudRef.current.updateState({
                    colordistribution:  !pointCloudRef.current.getState().colordistribution,
                    colorhistogram: false
                })
        }
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const switchColorHistogram = () => {
        if (pointCloudRef.current)
            pointCloudRef.current.updateState({
                colorhistogram:  !pointCloudRef.current.getState().colorhistogram,
                colordistribution: false
            })
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const handleWireFrameChange = (e) => {
        console.log(e.target.checked)
        if (meshRef.current)
            meshRef.current.updateState({
                wireframe:  e.target.checked,
            })
    }
    
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const handleFaceNormal = (e) => {
        console.log(e.target.checked)
        if (meshRef.current)
            meshRef.current.updateState({
                faceNormal:  e.target.checked,
            })
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const showInfo = () => {
        setIsFieldInfoVisible(!isFieldInfoVisible);

        // Hide the settings field if the info field is visible
        // Note that isFieldInfoVisible has to be false, because the state is not updated immediately
        if(!isFieldInfoVisible)
            setIsFieldSettingVisible(false)

        if (props.obj_type === "Mesh") {
            setInfo(meshRef.current.getState().info);
        } else if (props.obj_type === "PointCloud") {
            setInfo(pointCloudRef.current.getState().info);
        }
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    console.log(props.obj_type)
    return (
        <div id={props.id} className="renderer_mesh">
            {/* Header of the renderer containing buttons for changing the output of the render view*/}
            <div className="rendererbutton-container">
                {/* Button for showing the mesh's texture map */}
                {props.obj_type === "VolumetricVideo" || props.obj_type === "Mesh" && (
                    <RendererButton onClick={showTextureMap} src={button_texturemap_texture_icon}/>
                )}
                {/* Button for showing object information */}
                <RendererButton onClick={showInfo} src={button_settings_info_icon}/>
                {/* Button for switching between mesh view and the color dostribution view */}
                <RendererButton onClick={switchColorHistogram} src={button_settings_histo_icon}/>
                {/* Button for switching between mesh view and the color dostribution view */}
                <RendererButton onClick={switchColorDistribution} src={button_settings_dist_icon}/>
                {/* Button for showing the settings for the mesh view */}
                <RendererButton onClick={showSettings} src={button_settings_texture_icon}/>
            </div>

            {/* Framenumber counter */}
            {props.obj_type === "VolumetricVideo" && (
                <div className="voluCounter">Frame: {currentIndex.current}</div>
            )}

            {/* Canvas for rendering the mesh / pointcloud / volumetric video */}
            <CustomCanvas 
                view={props.view} 
                rendering={activeObject.current} 
                style={{ display: isTextureMapVisible ? 'none' : 'block' }}
                textureMapID={textureMapID}
                activeTextureMap={activeTextureMap.current}
                currentIndex={currentIndex}
                fps={fps}
            >
                <ambientLight/>
                <OrbitControls />
                {camera}
                {grid}
                {axis}
            </CustomCanvas>

            {/* Shows the texture map of the current mesh. */}
            <img 
                id={textureMapID} 
                style={{ display: isTextureMapVisible ? 'block' : 'none' }} 
                className='field_texture'
                src={""}
                data-src={""}
            />

            {/* Settings for the mesh view */}
            <SettingsField visibility={isFieldSettingVisible}>
                <SettingsFieldItem type={"checkbox"} default={true} onChange={handleGridChange}>Show Grid</SettingsFieldItem>
                <SettingsFieldItem type={"checkbox"} default={true} onChange={handleAxisChange}>Show Axes</SettingsFieldItem>
                <SettingsFieldItem type={"checkbox"}  default={false} onChange={handleOrthographicViewChange}>Orthographic View</SettingsFieldItem>
                {/*Point Cloud specific settings */}
                {props.obj_type === "PointCloud" && (
                    <>
                        <SettingsFieldItem type={"checkbox"}  default={false} onChange={handleVertexNormalViewChange}>Vertex Normal View</SettingsFieldItem>
                        <SettingsFieldItem type={"range"} min="1" max="10" default={1} onChange={handlePointSizeChange}>Point Size</SettingsFieldItem>
                    </>
                )}
                {/*Mesh and Volumetric Video specific settings */}
                {(props.obj_type === "VolumetricVideo" || props.obj_type === "Mesh") && (
                    <>
                        <SettingsFieldItem type={"checkbox"}  default={false} onChange={handleWireFrameChange}>WireFrame</SettingsFieldItem>
                    </>
                )}
                {/*Volumetric Video specific settings */}
                {props.obj_type === "VolumetricVideo" && (
                    <>
                        <SettingsFieldItem type={"range"} min="1" max="10" value={fps} onChange={handleFpsChange}>FPS</SettingsFieldItem>
                    </>
                )}
                {/*Mesh specific settings */}
                {props.obj_type === "Mesh" && (
                    <>
                        <SettingsFieldItem type={"checkbox"}  default={false} onChange={handleFaceNormal}>Face Normal</SettingsFieldItem>
                    </>
                )}
            </SettingsField>

            {/* Information field of the current object. Show for point clouds the number of vertices, etc. */}

            <InfoField visibility={isFieldInfoVisible}>
                {info}
            </InfoField>
            {/* <div className='fieldInfo' style={{ display: isFieldInfoVisible ? 'block' : 'none' }}>
                <div className="fieldInfoText">
                    Ihr Text hier
                </div>
            </div> */}

        </div>
    )
};

export default MeshRenderer;