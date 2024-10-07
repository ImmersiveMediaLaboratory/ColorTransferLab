/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {Suspense, useState, useEffect, useRef} from 'react';
import {Canvas} from "@react-three/fiber";
import './ImageRenderer.scss';
import $ from 'jquery';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

function ImageRenderer(props) {    
    const [isFieldSettingVisible, setIsFieldSettingVisible] = useState(false);
    const [isFieldInfoVisible, setIsFieldInfoVisible] = useState(false);
    const [initialScale, setInitialScale] = useState(0.5);
    const [update, setUpdate] = useState(0);

    const imageRef = useRef(null);
    const containerRef = useRef(null);

    const button_settings_texture_icon = "assets/icons/icon_settings_grey.png";
    const button_infos_texture_icon = "assets/icons/icon_information.png"


    const showSettings = () => {
        console.log("showSettings")
        setIsFieldSettingVisible(!isFieldSettingVisible);
    };

    const showObjectInfo = (e) => {
        setIsFieldInfoVisible(!isFieldInfoVisible);
        console.log("showObjectInfo")
    }

    const handleGreyscaleChange = (e) => {
        console.log("handleGreyscaleChange")
        $(`#${props.innerid}`).css('filter', e.target.checked ? 'grayscale(100%)' : 'none');
    }

    useEffect(() => {
        props.setComplete(Math.random());
    }, [props.filePath]);


    return (
        <div id={props.id} className="renderer_image">                  
            {/* Button for showing the settings for the mesh view */}
            <div className='ir_button_settings' onClick={showSettings}>
                <img className="ir_button_settings_texture_icon" src={button_settings_texture_icon}/>
            </div>          

            {/* Button for showing the object infos */}
            <div className='ir_button_infos' onClick={showObjectInfo}>
                <img className="ir_button_infos_texture_icon" src={button_infos_texture_icon}/>
            </div>

            <div className="zoom-container" ref={containerRef}>
                <img 
                    ref={imageRef} 
                    id={props.innerid} 
                    className="renderer_image_inner" 
                    data-update={0}  
                    data-src={props.filePath}
                    src={props.filePath}
                />
            </div>

            {/* Info field */}
            <div className="ir_field_infos" style={{ display: isFieldInfoVisible ? 'flex' : 'none' }}>
                HEHE
            </div>

            {/* Settings field */}
            <div className="ir_field_settings" style={{ display: isFieldSettingVisible ? 'block' : 'none' }}>
                <table style={{width:"100%"}}>
                    <tbody>
                        <tr>
                            <td className='ir_field_settings_table_cell'>Greyscale</td>
                            <td className='ir_field_settings_table_cell'>
                                <input 
                                    type="checkbox"
                                    defaultChecked={false}
                                    onChange={handleGreyscaleChange} 
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>


        </div>
    )
}

export default ImageRenderer;