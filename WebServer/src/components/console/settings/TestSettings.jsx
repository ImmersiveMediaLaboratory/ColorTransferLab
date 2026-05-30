/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './TestSettings.scss';
import {useEffect, useState} from 'react';
import { useSelectionUserStudy } from "@/contexts/SelectionContextUserStudy";
import { getInitialValue } from '@/Utils/Utils';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import Metrics from './Metrics';
import Tooltip from '@mui/material/Tooltip';
import TestConfiguration from './TestConfiguration';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';


/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Settings component in the Console, allowing users to configure test parameters and view metrics.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function TestSettings({activeTab}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [activeView, setActiveView] = useState(getInitialValue('Settings:activeSettingsTab') ?? 1);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const { selectedTestType } = useSelectionUserStudy();
    const views = [
        {   
            component: TestConfiguration,
            props: { activeTab },
            icon: SettingsApplicationsIcon,
            tooltip: "Test Configuration",
            type: "all"
        },
        {   
            component: Metrics,
            props: { activeTab },
            icon: NoteAltIcon,
            tooltip: "Metrics",
            type: "rating"
        }
    ];
    
    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Store active view in localStorage to preserve it across tab switches and reloads
     **************************************************************************************************************/
    useEffect(() => {
        localStorage.setItem('Settings:activeSettingsTab', JSON.stringify(activeView));
    }, [activeView]);

    /**************************************************************************************************************
     * Set active view to 1 (Test Configuration).
     **************************************************************************************************************/
    useEffect(() => {
        setActiveView(1);
    }, [selectedTestType]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div
            className='testsettings'
            style={{ display: activeTab === "testsettings" ? "block" : "none"}}
        >
            {/* Left area: Main content */}
            <div className="testsettings-body">
                {views.map((view, idx) => {
                    const ViewComponent = view.component;
                    if (view.type !== "all" && view.type !== selectedTestType) return null;
                    return (
                        <div
                            key={idx}
                            className="testsettings-content"
                            style={{ display: activeView === idx + 1 ? undefined : "none" }}
                        >
                            <ViewComponent {...view.props} />
                        </div>
                    );
                })}
            </div>

            {/* Right border: scrollable tab with icons (4 views) */}
            <div className='testsettings-menu'>
                {views.map((view, idx) => {
                    if (view.type !== "all" && view.type !== selectedTestType) return null;
                    const IconComp = view.icon;
                    const title = view.tooltip || `View ${idx + 1}`;
                    return (
                        <Tooltip key={idx + 1} title={title} placement="left" arrow>
                            <button
                                className={`testsettings-view-button ${activeView === idx + 1 ? 'active' : ''}`}
                                onClick={() => setActiveView(idx + 1)}
                            >
                                {IconComp && <IconComp style={{ fontSize: 18 }} />}
                            </button>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
}