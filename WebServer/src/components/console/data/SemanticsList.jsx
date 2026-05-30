/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./SemanticsList.scss";
import {useEffect, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import { useSelection } from "@/contexts/SelectionContext";
import { getInitialValue } from "@/Utils/Utils"

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Renders a list of semantic labels with associated colors.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function SemanticsList() {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState("#ffffff");

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const { selectedSemanticList, setSelectedSemanticList } = useSelection();

    const rows = Array.isArray(selectedSemanticList) ? selectedSemanticList : [];

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        const initSemanticList = [
            { name: "Sky",    color: "#87CEEB", enabled: true },
            { name: "Person", color: "#A9A9A9", enabled: true },
            { name: "Grass", color: "#34d634", enabled: true },
            { name: "Water", color: "#343cd6", enabled: true },
        ];
        setSelectedSemanticList(getInitialValue('SemanticsList:selectedSemanticList') ?? initSemanticList);
        localStorage.setItem('SemanticsList:selectedSemanticList', JSON.stringify(initSemanticList));
    }, []); 

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        if (Array.isArray(selectedSemanticList)) {
            localStorage.setItem('SemanticsList:selectedSemanticList', JSON.stringify(selectedSemanticList));
        }
    }, [selectedSemanticList]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Changes the color of class in selectedSemanticList
     **************************************************************************************************************/
    const handleColorChange = (index, newColor) => {
        setSelectedSemanticList((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, color: newColor } : item
            )
        );
    };

    /**************************************************************************************************************
     * Changes the enabled status of a class in selectedSemanticList
     **************************************************************************************************************/
    const handleToggleEnabled = (index) => {
        setSelectedSemanticList((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, enabled: !item.enabled } : item
            )
        );
    };

    /**************************************************************************************************************
     * Adds a new class (name and color) in selectedSemanticList
     **************************************************************************************************************/
    const handleAddSemantic = () => {
        if (!newName.trim()) return;
        setSelectedSemanticList((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            { name: newName.trim(), color: newColor, enabled: true },
        ]);
        setNewName("");
    };

    /**************************************************************************************************************
     * Removes a class from selectedSemanticList
     **************************************************************************************************************/
    const handleRemove = (index) => {
        setSelectedSemanticList((prev) =>
            (Array.isArray(prev) ? prev : []).filter((_, i) => i !== index)
        );
    };

    /**************************************************************************************************************
     * Export the semantic list as JSON
     **************************************************************************************************************/
    const handleExportSemanticList = () => {
        const data = JSON.stringify(selectedSemanticList, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "semantics.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    /**************************************************************************************************************
     * Import the semantic list from JSON
     **************************************************************************************************************/
    const handleImportSemanticList = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const json = JSON.parse(evt.target.result);
                    if (Array.isArray(json)) {
                        setSelectedSemanticList(json);
                    } else if (json && Array.isArray(json.semantics)) {
                        setSelectedSemanticList(json.semantics);
                    } else {
                        alert("Invalid JSON format.");
                    }
                } catch (err) {
                    alert("Could not parse JSON.");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="semanticslist">
            <div className="semanticslist-row">
                <input
                    type="text"
                    placeholder="Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                />
                <button
                    type="button"
                    onClick={handleAddSemantic}
                    disabled={!newName.trim()}
                >
                    Add
                </button>
                {/* Import Button */}
                <button
                    type="button"
                    onClick={handleImportSemanticList}
                >
                    Import
                </button>
                {/* Export Button */}
                <button
                    type="button"
                    onClick={handleExportSemanticList}
                >
                    Export
                </button>
            </div>
            <div className="semantics_list_content">
                <table className="semantics_list_table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Color</th>
                            <th>Enabled</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item, idx) => (
                            <tr key={item.name ?? idx}>
                                <td>{item.name}</td>
                                <td>
                                    <input
                                        type="color"
                                        value={item.color}
                                        onChange={(e) => handleColorChange(idx, e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={!!item.enabled}
                                        onChange={() => handleToggleEnabled(idx)}
                                    />
                                </td>
                                <td>
                                    <ClearIcon
                                        className="semanticslist-remove-button"
                                        onClick={() => handleRemove(idx)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}