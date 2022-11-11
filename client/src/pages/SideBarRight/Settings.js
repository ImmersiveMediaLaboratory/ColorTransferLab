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
import Images from "constants/Images"
import Texts from "constants/Texts";


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Settings extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
        <div id="settings_main">
            <div id="settings_header">
            <img id='settings_header_logo' src={Images.icon_settings}/>
            <div id='settings_header_name'>{Texts.sidebar_settings}</div>
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
                    <td><input id="settings_pointsize" type="range" min="1" max="10" defaultValue="1" style={{width: "100px"}}/></td>
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
                </tbody>
            </table>
            </div>
        </div>
        );
    }
}

export default Settings;