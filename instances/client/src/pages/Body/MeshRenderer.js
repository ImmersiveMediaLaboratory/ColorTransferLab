/*
Copyright 2024 by Herbert Potechius,
Tehnical University of Berlin, Faculty IV - Electrical Engineering and Computer Science
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {useEffect, useState, useRef} from 'react';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Plane } from "@react-three/drei";
import CustomCanvas from 'rendering/CustomCanvas';
import Axis from "rendering/Axis"
import './MeshRenderer.scss';
import $ from 'jquery';
import {pathjoin} from 'utils/Utils';
import {active_server} from 'pages/SideBarLeft/Server'
import TriangleMesh from "rendering/TriangleMesh"
import PointCloud from "rendering/PointCloud"


const MeshRenderer = (props) => {    

    const [grid, changeGrid] = useState(<gridHelper args={[20,20, 0x222222, 0x222222]}/>)
    const [axis, changeAxis] = useState(<Axis />)
    const [perspectiveView, setPerspectiveView] = useState(true)
    const [isFieldSettingVisible, setIsFieldSettingVisible] = useState(true);
    const [isTextureMapVisible, setIsTextureMapVisible] = useState(false);
    const [fps, setFps] = useState(1);

    const activeObject = useRef([]);
    const activeTextureMap = useRef([]);


    const button_settings_texture_icon = "assets/icons/icon_settings_grey.png";
    const button_texturemap_texture_icon = "assets/icons/icon_texturemap_grey.png";

    const textureMapID = "texture_map" + props.id;


    const initPath = "data"

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const handleGridChange = (e) => {
        if (e.target.checked) {
            changeGrid(<gridHelper args={[20, 20, 0x222222, 0x222222]} />);
        } else {
            changeGrid(null);
        }
    };

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const handleAxisChange = (e) => {
        if (e.target.checked) {
            changeAxis(<Axis />);
        } else {
            changeAxis(null);
        }
    };

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const handlePointSizeChange = (e) => {
        console.log("handlePointSizeChange")
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const handleOrthographicViewChange = (e) => {
        setPerspectiveView(!e.target.checked)
    };

    const handleFpsChange = (event) => {
        setFps(event.target.value);
    };

    const handleVertexNormalViewChange = (e) => {
        console.log("handleVertexNormalViewChange")
    }


    let cameraview;
    if(perspectiveView)
        cameraview = <PerspectiveCamera position={[4, 4, 4]} makeDefault />
    else
        cameraview = <OrthographicCamera position={[10, 10, 10]} zoom={40} makeDefault />

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const showSettings = () => {
        setIsFieldSettingVisible(!isFieldSettingVisible);
    };

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const showTextureMap = () => {
        console.log("showTextureMap")
        setIsTextureMapVisible(!isTextureMapVisible);
    }

    useEffect(() => {
        if(props.obj_type === "Mesh") {
            const obj = <TriangleMesh 
                            key={Math.random()} 
                            file_name={props.filePath} 
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
            console.log(props.filePath)
            const obj = <PointCloud
                            key={Math.random()} 
                            file_path={props.filePath} 
                            //id={TITLE} 
                            //center={ref_pc_center} 
                            //scale={ref_pc_scale}  
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

            const loadJson = async () => {
                try {
                    const response = await fetch(json_path);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    //console.log(data["num_frames"]);
                    for (let i = 0; i < data["num_frames"]; i++) {
                        let paddedNumber = String(i).padStart(5, '0');

                        let texture_path = pathjoin(props.filePath + "_" + paddedNumber + ".jpg");
                        activeTextureMap.current.push(texture_path)
     
                        var filepath = pathjoin(props.filePath + "_" + paddedNumber)
                        const obj3D = <TriangleMesh 
                                        key={Math.random()} 
                                        file_name={filepath} 
                                        setGLOComplete={props.setComplete}
                                      />
                        activeObject.current.push(obj3D)
                    }
                } catch (error) {
                    console.error("Error loading JSON:", error);
                }
            };
            loadJson();
        }

    }, [props.filePath]);


    return (
        <div id={props.id} className="renderer_mesh">
            {/* Button for showing the settings for the mesh view */}
            <div className='button_settings' onClick={showSettings}>
                <img className="button_settings_texture_icon" src={button_settings_texture_icon}/>
            </div>
            {/* Button for showing the mesh's texture map */}
            <div className='button_texturemap' onClick={showTextureMap}>
                <img className="button_texturemap_texture_icon" src={button_texturemap_texture_icon}/>
            </div>

            <CustomCanvas 
                view={props.view} 
                rendering={activeObject.current} 
                style={{ display: isTextureMapVisible ? 'none' : 'block' }}
                textureMapID={textureMapID}
                activeTextureMap={activeTextureMap.current}
                fps={fps}
            >
                <ambientLight/>
                <OrbitControls />
                {cameraview}
                {grid}
                {axis}
            </CustomCanvas>

            <img 
                id={textureMapID} 
                style={{ display: isTextureMapVisible ? 'block' : 'none' }} 
                className='field_texture'
                src={""}
                data-src={""}
            />

            {/* Settings field for Mesh*/}
            {props.obj_type === "Mesh" && (
                <div className="field_settings" style={{ display: isFieldSettingVisible ? 'none' : 'block' }}>
                    <table style={{width:"100%"}}>
                        <tbody>
                            <tr>
                                <td className='field_settings_table_cell'>Show Grid</td>
                                <td className='field_settings_table_cell'>
                                    <input 
                                        type="checkbox"
                                        defaultChecked
                                        onChange={handleGridChange} 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className='field_settings_table_cell'>Show Axes</td>
                                <td className='field_settings_table_cell'>
                                    <input 
                                        type="checkbox"
                                        defaultChecked
                                        onChange={handleAxisChange} 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className='field_settings_table_cell'>Orthographic View</td>
                                <td className='field_settings_table_cell'>
                                    <input 
                                        type="checkbox"
                                        defaultChecked={false}
                                        onChange={handleOrthographicViewChange} 
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {/* Settings field for Point Clouds*/}
            {props.obj_type === "PointCloud" && (
                <div className="field_settings" style={{ display: isFieldSettingVisible ? 'none' : 'block' }}>
                    <table style={{width:"100%"}}>
                        <tbody>
                            <tr>
                                <td className='field_settings_table_cell'>Show Grid</td>
                                <td className='field_settings_table_cell'>
                                    <input 
                                        type="checkbox"
                                        defaultChecked
                                        onChange={handleGridChange} 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className='field_settings_table_cell'>Show Axes</td>
                                <td className='field_settings_table_cell'>
                                    <input 
                                        type="checkbox"
                                        defaultChecked
                                        onChange={handleAxisChange} 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className='field_settings_table_cell'>Orthographic View</td>
                                <td className='field_settings_table_cell'>
                                    <input 
                                        type="checkbox"
                                        defaultChecked={false}
                                        onChange={handleOrthographicViewChange} 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className='field_settings_table_cell'>Vertex Normal View</td>
                                <td className='field_settings_table_cell'>
                                    <input 
                                        type="checkbox"
                                        id="settings_colornormal"
                                        defaultChecked={false}
                                        onChange={handleVertexNormalViewChange} 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className='field_settings_table_cell'>Point Size</td>
                                <td>
                                    <input 
                                        id="settings_pointsize" 
                                        type="range" 
                                        min="1" 
                                        max="10" 
                                        defaultValue="1" 
                                        style={{width: "100%"}}
                                        onChange={handlePointSizeChange} 
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {/* Settings field for Volumetric Video*/}
            {props.obj_type === "VolumetricVideo" && (
                <div className="field_settings" style={{ display: isFieldSettingVisible ? 'none' : 'block' }}>
                    <table style={{width:"100%"}}>
                        <tbody>
                            <tr>
                                <td className='field_settings_table_cell'>Show Grid</td>
                                <td className='field_settings_table_cell'>
                                    <input 
                                        type="checkbox"
                                        defaultChecked
                                        onChange={handleGridChange} 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className='field_settings_table_cell'>Show Axes</td>
                                <td className='field_settings_table_cell'>
                                    <input 
                                        type="checkbox"
                                        defaultChecked
                                        onChange={handleAxisChange} 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className='field_settings_table_cell'>Orthographic View</td>
                                <td className='field_settings_table_cell'>
                                    <input 
                                        type="checkbox"
                                        defaultChecked={false}
                                        onChange={handleOrthographicViewChange} 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className='field_settings_table_cell'>FPS: <span>{fps}</span></td>
                                <td>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="60" 
                                        value={fps}
                                        style={{width: "100%"}}
                                        onChange={handleFpsChange} 
                                    />
                                    
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
};

export default MeshRenderer;