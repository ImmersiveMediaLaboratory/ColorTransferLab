/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Data.scss';
import {useEffect, useState} from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BlurOnOutlinedIcon from '@mui/icons-material/BlurOnOutlined';
import WorkspacesTwoToneIcon from '@mui/icons-material/WorkspacesTwoTone';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import Tooltip from '@mui/material/Tooltip';
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Histogram from './Histogram';
import Info from './Info';
import Settings from './settings/Settings';
import ColorDistribution from './ColorDistribution';
import Histogram3D from './Histogram3D';
import TextureOutlinedIcon from '@mui/icons-material/TextureOutlined';
import Textures from './Textures';
import WbSunnyTwoToneIcon from '@mui/icons-material/WbSunnyTwoTone';
import Semantics from './Semantics';
import OutputAdjustment from './OutputAdjustment';
import Empty from './Empty';
import { getInitialValue } from '@/Utils/Utils';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** This component manages the different views in the "Data" tab of the console. It includes an icon-based 
 ** sidebar for navigation and conditionally renders the selected view. The views include Info, Settings, 
 ** Histograms, Color Distribution, Textures, Semantics, and Output Adjustment.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Data({activeTab, settings, meshTexture, setOutputModifications, semanticMaps, setSemanticMaps}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [activeView, setActiveView] = useState(getInitialValue('Data:activeDataTab') ?? 1);
    const [activeRenderer, setActiveRenderer] = useState("src");

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const views = [
        {   
            component: Info,
            props: { activeRenderer },
            icon: InfoOutlinedIcon,
            tooltip: "Info"
        },
        {
            component: Settings,
            props: { activeRenderer, settings: settings },
            icon: SettingsOutlinedIcon,
            tooltip: "Settings"
        },
        {
            component: Histogram,
            props: { activeRenderer},
            icon: BarChartIcon,
            tooltip: "2D Histograms"
        },
        {
            component: ColorDistribution,
            props: { activeRenderer },
            icon: BlurOnOutlinedIcon,
            tooltip: "3D Color Distribution"
        },
        {
            component: Histogram3D,
            props: { activeRenderer },
            icon: WorkspacesTwoToneIcon,
            tooltip: "3D Histograms"
        },
        {
            component: Textures,
            props: { activeRenderer, meshTexture: meshTexture },
            icon: TextureOutlinedIcon,
            tooltip: "Textures"
        },
        {
            component: Semantics,
            props: { activeRenderer, setSemanticMaps: setSemanticMaps },
            icon: AutoAwesomeOutlinedIcon,
            tooltip: "Semantics"
        },
        {
            component: Empty,
            props: { activeRenderer },
            icon: LayersOutlinedIcon,
            tooltip: "Depths"
        },
        {
            component: Empty,
            props: { activeRenderer },
            icon: ArrowOutwardOutlinedIcon,
            tooltip: "Normals"
        },
        {
            component: Empty,
            props: { activeRenderer },
            icon: WbSunnyTwoToneIcon,
            tooltip: "Illumination"
        },
        {
            component: OutputAdjustment,
            props: { setOutputModifications: setOutputModifications, semanticMaps: semanticMaps },
            icon: BuildOutlinedIcon,
            tooltip: "Output Adjustment"
        }
    ];
    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        const handler = (e) => {
            const slot = e.detail?.slot;
            if (slot === "src" || slot === "ref" || slot === "out") {
                setActiveRenderer(slot);
            }
        };
        window.addEventListener("histogram:active", handler);
        return () => window.removeEventListener("histogram:active", handler);
    }, []);

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        localStorage.setItem('Data:activeDataTab', JSON.stringify(activeView));
    }, [activeView]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div
            className='data'
            style={{ display: activeTab === "data" ? "block" : "none"}}
        >
            {/* LEFT AREA: all views mounted, only visible via display */}
            <div className='data-body'>
                {views.map((view, idx) => {
                    const ViewComponent = view.component;
                    return (
                        <div
                            key={idx}
                            className="data-content"
                            style={{ display: activeView === idx + 1 ? undefined : "none" }}
                        >
                            <ViewComponent {...view.props} />
                        </div>
                    );
                })}
            </div>

            {/* Right sidebar: Buttons with Icons */}
            <div className='data-menu'>
                {views.map((view, idx) => {
                    const IconComp = view.icon;
                    const title = view.tooltip || `View ${idx + 1}`;
                    return (
                        <Tooltip key={idx + 1} title={title} placement="left" arrow>
                            <button
                                className={`data-view-button ${activeView === idx + 1 ? 'active' : ''}`}
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