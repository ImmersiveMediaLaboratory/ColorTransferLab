/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./ColorPalette.scss";
import { useEffect, useState } from "react";
import { useWebRTC } from '@/Utils/WebRTCProvider';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function ColorPalette() {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [colorPalette, setColorPalette] = useState(Array(25).fill("#ffffff"));
    const [activeCount, setActiveCount] = useState(1);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const { rtc } = useWebRTC();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Receives color palette data from the compute node and updates the state accordingly.
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onColorPaletteRequest = (data) => {
            setColorPalette(data);
            setActiveCount(data.filter(c => c !== "#ffffff").length + 1);
            console.debug("RECV", "[Compute Node] Color palette data received: ", data);
        };
    }, [rtc]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

   /**************************************************************************************************************
    * Handles the removal of a color from the palette.
    **************************************************************************************************************/
    const handleRemoveColor = (index, e) => {
        e.preventDefault();
        const newPalette = colorPalette.filter((_, i) => i !== index);
        newPalette.push("#ffffff");
        setColorPalette(newPalette);
        const filled = newPalette.findIndex(c => c === "#ffffff");
        setActiveCount(filled !== -1 ? Math.max(1, filled + 1) : 25);
    };

   /**************************************************************************************************************
    * Handles the change of a color in the palette.
    **************************************************************************************************************/
    const handleColorChange = (index, color) => {
        const newPalette = [...colorPalette];
        newPalette[index] = color;
        setColorPalette(newPalette);

        if (color !== "#ffffff" && activeCount < 25 && index === activeCount - 1) {
            setActiveCount(activeCount + 1);
        }
    };
    
    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (    
        <div className="colorpalette">
            <div className="colorpalette-content">
                {Array.from({ length: activeCount }).map((_, idx) => (
                    <div
                        key={idx}
                        style={{
                            width: "calc((100% - 8px) / 5)",
                            height: "calc((100% - 8px) / 5)",
                            background: colorPalette[idx],
                            cursor: "pointer",
                            position: "absolute",
                            left: `calc(${(idx % 5)} * (100% - 8px) / 5)`,
                            top: `calc(${Math.floor(idx / 5)} * (100% - 8px) / 5)`
                        }}
                    >
                        {colorPalette[idx] === "#ffffff" && (
                            <span style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "100%",
                                position: "absolute",
                                left: 0,
                                top: 0,
                                zIndex: 1,
                                pointerEvents: "none"
                            }}>
                                <AddCircleOutlineIcon style={{ fontSize: "2em", color: "#bbb" }} />
                            </span>
                        )}
                        <input
                            type="color"
                            value={colorPalette[idx]}
                            style={{
                                opacity: 0,
                                width: "100%",
                                height: "100%",
                                position: "absolute",
                                left: 0,
                                top: 0,
                                cursor: "pointer",
                                border: "none"
                            }}
                            onChange={e => handleColorChange(idx, e.target.value)}
                            onContextMenu={e => handleRemoveColor(idx, e)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}