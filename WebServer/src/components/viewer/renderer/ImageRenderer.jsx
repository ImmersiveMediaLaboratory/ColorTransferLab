/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './ImageRenderer.scss';
import {useEffect, useRef, useState} from 'react';
import SettingsFieldItem from '../../console/data/settings/SettingsFieldItem.jsx';
import Image from '../elements/Image';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function ImageRenderer({rid, activeDataType, filePath, fileName, setObjInfo, setSettings, outputModifications, semanticMaps}) {    
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /* ------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [greyscaleEnabled, setGreyscaleEnabled] = useState(false);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Sets the settings for the image renderer, which currently only consists of a checkbox to 
     * enable/disable greyscale.
     **************************************************************************************************************/
    useEffect(() => {
        if (setSettings && filePath !== null) {
            setSettings(prev => ({
                ...(prev || {}),
                [rid]: [
                    <SettingsFieldItem key="greyscale" type={"checkbox"} default={false} onChange={handleGreyscaleChange} >
                        Greyscale
                    </SettingsFieldItem>
                ]
            }));
        }
    }, [filePath]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Makes the image greyscale or colored again.
     **************************************************************************************************************/
    const handleGreyscaleChange = (e) => {
        setGreyscaleEnabled(e.target.checked);
    }

    /**************************************************************************************************************
     * Downloads the image when the download button is clicked.
     **************************************************************************************************************/
    const download = (e) => {
        if (!filePath) return;
        const link = document.createElement('a');
        link.href = filePath;
        const customName = fileName;
        link.download = customName;
        link.type = "image/png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div 
            className="imagerenderer"
            style={{ display: activeDataType === "Image" ? "block" : "none" }}
        >    
            <div className='imagerenderer-download-button' title="Download">
                <FileDownloadOutlinedIcon 
                    className='imagerenderer-download-button-icon'
                    onClick={download}
                />
            </div>

            <Image 
                rid={rid}
                filePath={filePath} 
                greyscaleEnabled={greyscaleEnabled} 
                setObjInfo={setObjInfo}
                modifications={outputModifications}
                semanticMaps={semanticMaps}
            />
        </div>
    )
}