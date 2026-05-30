/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./TestConfiguration.scss";
import {useSelectionUserStudy} from "@/contexts/SelectionContextUserStudy";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Configuration Tab in the Test Settings section of the Console, allowing users to configure test parameters.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function TestConfiguration() {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const headerValC = ["Parameter", "Value"];
    const {selectedTestType, selectedUserStudyDatabaseStructure, setSelectedSettings } = useSelectionUserStudy();


    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Handle change in number of test items per test set, updating the selected settings in the context.
     **************************************************************************************************************/
    const handleNumTestItemsChange = (value) => {
        setSelectedSettings(prev => ({
            ...prev,
            rating: {
                ...prev.rating,
                num: parseInt(value) || 10
            }
        }));
    }

    /**************************************************************************************************************
     * Handle change in selected database folder, updating the selected settings in the context.
     **************************************************************************************************************/
    const handleDatabaseFolderChange = (value) => {
        console.log(`Database folder changed to:`, value);
        setSelectedSettings(prev => ({
            ...prev,
            rating: {
                ...prev.rating,
                databaseFolder: value.split("/")[1] || "" // Remove "root/" prefix if present
            }
        }));
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="testconfiguration">
            <div className="testconfiguration-content">
                <table className="testconfiguration-table">
                    <thead>
                        <tr>
                            {headerValC.map((h, idx) => (
                                <th key={idx} className="cell-config">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="cell-config">Database Folder</td>
                            <td className="cell-config">
                                <select 
                                    className="config-input"
                                    onChange={e => handleDatabaseFolderChange(e.target.value)}    
                                >
                                    <option value="">Choose database</option>
                                    {(selectedUserStudyDatabaseStructure?.[0]?.folders || []).map(folder => (
                                        <option key={folder.name} value={`root/${folder.name}`}>
                                            {folder.name}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td className="cell-config">Items per Test Set</td>
                            <td className="cell-config">
                                <input
                                    className="config-input"
                                    type="number"
                                    min={1}
                                    max={100}
                                    defaultValue={10}
                                    onChange={(e) => handleNumTestItemsChange(e.target.value)}
                                />
                            </td>
                        </tr>

                        {selectedTestType === "Ranking" && (
                        <tr>
                            <td className="cell-config">Items per Test</td>
                            <td className="cell-config">
                                <input
                                    className="config-input"
                                    type="number"
                                    min={3}
                                    max={10}
                                    defaultValue={4}
                                />
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}