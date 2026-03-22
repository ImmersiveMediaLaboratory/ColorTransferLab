/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Configuration.scss';
import {useEffect, useState} from 'react';
import { useWebRTC } from '@/Utils/WebRTCProvider';
import { useSelection } from "@/contexts/SelectionContext";
import { getInitialValue } from "@/Utils/Utils"

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Displaying the configuration options for the selected algorithm and allowing the user to change them.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Configuration({activeTab}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [optionsList, setOptionsList] = useState(getInitialValue('Configuration:options') ?? {});

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc} = useWebRTC();
    const { selectedAlgorithm } = useSelection(); 
    const { setSelectedOptions } = useSelection();

    const headerValC = ["Parameter", "Value", "Type"];

    const visibleOptions = optionsList && Array.isArray(optionsList[selectedAlgorithm?.key])
        ? optionsList[selectedAlgorithm?.key].filter((opt) => opt && opt.changeable)
        : [];

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Initialize options from localStorage or default values
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onOptionsRequest = (data) => {
            const storageOptions = getInitialValue('Configuration:options')
            const updatedOptions = !storageOptions || Object.keys(storageOptions).length === 0 ? data : storageOptions;
            setOptionsList(updatedOptions);
            localStorage.setItem('Configuration:options', JSON.stringify(updatedOptions));
            console.debug("RECV", "[Compute Node] Options list received: ", data);
        };
    }, [rtc]);

    /**************************************************************************************************************
     * Update selected options when selected algorithm or options list changes
     **************************************************************************************************************/
    useEffect(() => {
        if (!selectedAlgorithm || !optionsList) return;

        const key = selectedAlgorithm.key ?? selectedAlgorithm.name;
        const opt = optionsList[key] || [];
        setSelectedOptions(opt);

        localStorage.setItem('Configuration:options', JSON.stringify(optionsList));

    }, [selectedAlgorithm, optionsList]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Handle value change for a specific option
     **************************************************************************************************************/
    const handleValueChange = (index, newValue) => {
        console.debug("INFO", `Changing option at index ${index} to ${newValue}`);

        const algoKey = selectedAlgorithm?.key;

        let updated = [];
        if (algoKey) {
            updated = optionsList[algoKey].map((opt, i) =>
                i === index ? { ...opt, default: newValue } : opt
            );
            setOptionsList((prevList) => ({
                ...prevList,
                [algoKey]: updated,
            }));
        }
        return updated;
    };

    /**************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************/
    return (
        <div className='configuration' style={{ display: activeTab === "configuration" ? "block" : "none"}}>
            <div className="configuration-content">
                <table className="configuration-table">
                    <thead>
                        <tr>
                            {headerValC.map((h, idx) => (
                                <th key={idx} className="cell-config">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleOptions.length > 0 ? (
                            visibleOptions.map((opt, idx) => {
                                const paramName = opt.parameter ?? opt.name ?? "";
                                const value = opt.default ?? "";
                                const type = opt.type ?? "";
                                const isStringType = type === "string";
                                const isBoolType = type === "bool" || type === "boolean";
                                const possibleValues = Array.isArray(opt.values) ? opt.values : [];

                                return (
                                    <tr key={idx}>
                                        <td className="cell-config">{paramName}</td>
                                        <td className="cell-config">
                                            {isStringType ? (
                                                <select
                                                    value={value}
                                                    onChange={(e) => handleValueChange(idx, e.target.value)}
                                                >
                                                    {possibleValues.map((v) => (
                                                        <option key={v} value={v}>
                                                            {v}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : isBoolType ? (
                                                <select
                                                    value={String(value)}
                                                    onChange={(e) =>
                                                        handleValueChange(idx, e.target.value === "true")
                                                    }
                                                >
                                                    <option value="true">true</option>
                                                    <option value="false">false</option>
                                                </select>
                                            ) : (
                                                <input
                                                    className="config-input"
                                                    type={
                                                        type === "int" ||
                                                        type === "float" ||
                                                        type === "number"
                                                            ? "number"
                                                            : "text"
                                                    }
                                                    value={value}
                                                    onChange={(e) => handleValueChange(idx, e.target.value)}
                                                />
                                            )}
                                        </td>
                                        <td className="cell-config">{type}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td className="cell-config" colSpan={3}>
                                    No options available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}