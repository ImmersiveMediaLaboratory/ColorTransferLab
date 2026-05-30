/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./Console.scss";
import { useState, useEffect } from "react";
import Terminal from "./Terminal.jsx";
import Information from "./Information.jsx";
import Configuration from "./Configuration.jsx";
import Evaluation from "./Evaluation.jsx";
import Data from "./data/Data.jsx";
import ConsoleTabButton from "./elements/ConsoleTabButton.jsx"
import TestSettings from "@/components/console/settings/TestSettings.jsx";
import { getInitialValue } from "@/Utils/Utils"
import Participants from "./Participants.jsx";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** CONSOLE COMPONENT: Container component for all console-related components (Terminal, Information, 
 ** Configuration, Evaluation, Data, Metrics, Participants, Test Settings)
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Console({settings, meshTexture, setOutputModifications, semanticMaps, setSemanticMaps, isUserStudyOpen }) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [activeTab, setActiveTab] = useState(isUserStudyOpen ? getInitialValue('Console:activeUserStudyTab') ?? "terminal" : getInitialValue('Console:activeConsoleTab') ?? "terminal");

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const consoleTabs = [
        { label: 'Terminal' },
        // Tabs only available in Execution Mode
        { label: 'Evaluation' },
        { label: 'Configuration' },
        { label: 'Data' },
        { label: 'Information' },
        // Tabs only available in User Study Mode
        { label: 'Participants' },
        { label: 'Test Settings' }
    ];

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Persist active tab in localStorage to restore it on page reload
     **************************************************************************************************************/
    useEffect(() => {
        if (isUserStudyOpen) {
            localStorage.setItem('Console:activeUserStudyTab', JSON.stringify(activeTab));
        } else {
            localStorage.setItem('Console:activeConsoleTab', JSON.stringify(activeTab));
        }
    }, [activeTab]);

    /**************************************************************************************************************
     * Set active tab based on localStorage value or default
     **************************************************************************************************************/
    useEffect(() => {
        if (isUserStudyOpen) {
            setActiveTab(getInitialValue('Console:activeUserStudyTab') ?? "terminal");
        } else {
            setActiveTab(getInitialValue('Console:activeConsoleTab') ?? "terminal");
        }
    }, [isUserStudyOpen]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="console">
            <div className="console-body">

                {/* Horizontal tab bar */}
                <div className="console-tabs">
                    {consoleTabs.map(tab => (
                        <ConsoleTabButton
                            key={tab.label}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isUserStudyOpen={isUserStudyOpen}
                        >
                            {tab.label}
                        </ConsoleTabButton>
                    ))}
                </div>

                {/* Content area */}
                <div className="console-content">
                    <Terminal activeTab={activeTab}/>
                    <Evaluation activeTab={activeTab}/>
                    <Configuration activeTab={activeTab}/>
                    <Data 
                        activeTab={activeTab}
                        settings={settings}
                        meshTexture={meshTexture} 
                        setOutputModifications={setOutputModifications}
                        semanticMaps={semanticMaps}
                        setSemanticMaps={setSemanticMaps}
                    />
                    <Information activeTab={activeTab}/>
                    <Participants activeTab={activeTab}/>
                    <TestSettings activeTab={activeTab}/>
                </div>
            </div>
        </div>
    );
}