/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from "react";
import './Settings.scss';


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Settings(props) {
    const icon_settings = "assets/icons/icon_settings_grey.png";
    const sidebar_settings = "SETTINGS"

    return (
    <div id="settings_main">
        <div id="settings_header">
        <img id='settings_header_logo' src={icon_settings}/>
        <div id='settings_header_name'>{sidebar_settings}</div>
        </div>
        <div id="settings_body">
        <table>
            <tbody>
            <tr>
                <td>Grid</td>
                <td><input id="settings_grid" type="checkbox" defaultChecked/></td>
            </tr>
            <tr>
                <td>Point size</td>
                <td><input id="settings_pointsize" type="range" min="1" max="10" defaultValue="1" style={{width: "75px"}}/></td>
            </tr>
            <tr>
                <td>Vertex normal color</td>
                <td><input id="settings_colornormal" type="checkbox"/></td>
            </tr>
            <tr>
                <td>Axes</td>
                <td><input id="settings_axis" type="checkbox" defaultChecked/></td>
            </tr>
            <tr>
                <td>RGB Color Space</td>
                <td><input id="settings_rgbcolorspace" type="checkbox" /></td>
            </tr>
            <tr>
                <td>3D RGB Color Histogram</td>
                <td><input id="settings_3dcolorhistogram" type="checkbox" /></td>
            </tr>
            <tr>
                <td>Voxel Grid</td>
                <td><input id="settings_voxelgrid" type="checkbox" /></td>
            </tr>
            <tr>
                <td title={"The objects have to be loaded manually again for showing the new voxel level."}>Voxel Level</td>
                <td><input id="settings_voxellevel" type="range" min="1" max="3" defaultValue="1" style={{width: "75px"}}/></td>
            </tr>
            <tr>
                <td>Orthographic View</td>
                <td><input id="settings_orthographicview" type="checkbox" /></td>
            </tr>
            </tbody>
        </table>
        </div>
    </div>
    );
}

export default Settings;