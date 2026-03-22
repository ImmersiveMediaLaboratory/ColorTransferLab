/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './OutputAdjustment.scss';
import React, {useEffect, useState} from 'react';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useSelection } from "@/contexts/SelectionContext";
import { getInitialValue } from "@/Utils/Utils"

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** This component allows the user to adjust the output image based on the semantics. The user can select a 
 ** semantic layer and adjust its hue, saturation, brightness and bleeding.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function OutputAdjustment({setOutputModifications, semanticMaps}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
  
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    // Index of the selected semantic layer
    const [activeIdx, setActiveIdx] = useState(getInitialValue('OutputAdjustment:activeIdx') ?? null);
    // Structure: {Sky: { hue: 0, saturation: 100, brightness: 100, bleeding: 0 }, ...}
    const [semanticValues, setSemanticValues] = useState(getInitialValue('OutputAdjustment:semanticValues') ?? {});

    /*------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    // Debounce-Timeout-Ref
    const debounceRef = React.useRef();

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const { selectedSemanticList } = useSelection(); 

    // Current values for active element
    let currentValues = semanticValues[activeIdx] || { hue: 0, saturation: 100, brightness: 100, bleeding: 0 };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Is called when the semantics within the semantics tab are changed. It resets the semantic values and the active index.
     **************************************************************************************************************/
    useEffect(() => {
        if (Array.isArray(selectedSemanticList)) {
            setSemanticValues(Object.fromEntries(
                selectedSemanticList.map(element => [
                    element.name,
                    semanticValues[element.name] ||
                    { hue: 0, saturation: 100, brightness: 100, bleeding: 0 }
                ])
            ));
        }
    }, [selectedSemanticList]);

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        if (typeof setOutputModifications === "function") {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                const semanticMap = semanticMaps?.src;
                const outputModifications = {};
                if (Array.isArray(selectedSemanticList) && semanticMap) {
                    selectedSemanticList.forEach((semantic, idx) => {
                        const values = semanticValues[semantic.name] || { hue: 0, saturation: 100, brightness: 100 };
                        outputModifications[semantic.name] = {
                            hue: values.hue,
                            brightness: values.brightness,
                            saturation: values.saturation,
                            bleeding: values.bleeding,
                            color: semantic.color,
                        };
                    });
                }
                setOutputModifications(outputModifications);
            }, 100);
        }
    }, [semanticValues, selectedSemanticList, semanticMaps]);

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        localStorage.setItem('OutputAdjustment:semanticValues', JSON.stringify(semanticValues));
    }, [semanticValues]);

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        localStorage.setItem('OutputAdjustment:activeIdx', JSON.stringify(activeIdx));
    }, [activeIdx]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    // Handler for Slider
    const handleValueChange = (key, value) => {
        setSemanticValues(prev => ({
            ...prev,
            [activeIdx]: {
                ...prev[activeIdx],
                [key]: value
            }
        }));
    };

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const handleExportAdjustments = () => {
        const jsonString = JSON.stringify(semanticValues, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "adjustments.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const handleResetAdjustments = () => {
        setSemanticValues(Object.fromEntries(
            selectedSemanticList.map(element => [
                element.name,
                { hue: 0, saturation: 100, brightness: 100, bleeding: 0 }
            ])
        ));
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className='outputadjustment'>
            <div className='outputadjustment-semanticlist'>
                {/* Table with Semantics */}
                <table className='outputadjustment-semanticlist-table'>
                    <thead>
                        <tr><th>Name</th><th>Color</th></tr>
                    </thead>
                    <tbody>
                        {(Array.isArray(selectedSemanticList) ? selectedSemanticList : []).map((item, idx) => (
                            <tr
                                key={item.name ?? idx}
                                className={`outputadjustment-row ${item.name === activeIdx ? 'active' : ''}`}
                                onClick={() => setActiveIdx(item.name)}
                            >
                                <td>{item.name}</td>
                                <td>
                                    <span className='outputadjustment-color'
                                        style={{
                                            background: item.color
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* HSB Adjustment */}
            <div className='outputadjustment-sliders'>
                {/* HUE */}
                <div className='outputadjustment-HSB-container'>
                    <label>Hue: {currentValues.hue}°</label>
                    <div className='outputadjustment-HSB-adjust' >
                        <input
                            type="range"
                            min={-180}
                            max={180}
                            value={currentValues.hue}
                            onChange={e => handleValueChange("hue", Number(e.target.value))}
                        />
                        <RestartAltIcon 
                            className='outputadjustment-HSB-reset' 
                            onClick={() => handleValueChange("hue", 0)}
                        />
                    </div>
                </div>
                {/* SATURATION */}
                <div className='outputadjustment-HSB-container'>
                    <label>Saturation: {currentValues.saturation}%</label>
                    <div className='outputadjustment-HSB-adjust' >
                        <input
                            type="range"
                            min={0}
                            max={200}
                            value={currentValues.saturation}
                            onChange={e => handleValueChange("saturation", Number(e.target.value))}
                        />
                        <RestartAltIcon 
                            className='outputadjustment-HSB-reset'
                            onClick={() => handleValueChange("saturation", 100)} 
                        />
                    </div>
                </div>
                {/* BRIGHTNESS */}
                <div className='outputadjustment-HSB-container'>
                    <label>Brightness: {currentValues.brightness}%</label>
                    <div className='outputadjustment-HSB-adjust' >
                        <input
                            type="range"
                            min={0}
                            max={200}
                            value={currentValues.brightness}
                            onChange={e => handleValueChange("brightness", Number(e.target.value))}
                            style={{ flex: 1 }}
                        />
                        <RestartAltIcon 
                            className='outputadjustment-HSB-reset' 
                            onClick={() => handleValueChange("brightness", 100)}
                        />
                    </div>
                </div>
                {/* BLEEDING */}
                <div className='outputadjustment-HSB-container'>
                    <label>Bleeding: {currentValues.bleeding}%</label>
                    <div className='outputadjustment-HSB-adjust' >
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={currentValues.bleeding}
                            onChange={e => handleValueChange("bleeding", Number(e.target.value))}
                            style={{ flex: 1 }}
                        />
                        <RestartAltIcon 
                            className='outputadjustment-HSB-reset' 
                            onClick={() => handleValueChange("bleeding", 0)}
                        />
                    </div>
                </div>
                {/* Button Container */}
                <div className='outputadjustment-button-container'>
                    <div className='outputadjustment-button' onClick={() => handleExportAdjustments()}>Export all adjustement</div>
                    <div className='outputadjustment-button' onClick={() => handleResetAdjustments()}>Reset all adjustements</div>
                </div>
            </div>
        </div>
    );
}