/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./AlgorithmButton.scss";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CloudIcon from '@mui/icons-material/Cloud';
import ImageIcon from '@mui/icons-material/Image';
import GridOnIcon from '@mui/icons-material/GridOn';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import AppsIcon from '@mui/icons-material/Apps';
import AnimationIcon from '@mui/icons-material/Animation';

// mapping datatypes -> icon components; 8 slots in a 2x4 grid
const DATATYPE_SLOTS = [
    { type: 'Image',            Icon: ImageIcon },
    { type: 'PointCloud',       Icon: CloudIcon },
    { type: 'Mesh',             Icon: GridOnIcon },
    { type: 'VolumetricVideo',  Icon: AnimationIcon },
    { type: 'LightField',       Icon: AppsIcon },
    { type: 'GaussianSplatting',Icon: ScatterPlotIcon },
    { type: 'Video',            Icon: VideoCameraBackIcon },
    { type: null,               Icon: null },
];

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function AlgorithmButton({ algo, onClick, activeAlgo }) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/    
    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/  
    const keyLabel = algo.key ?? algo.name;

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <button
            className={`algorithmbutton ${activeAlgo === algo.key ? "active" : ""}`}
            onClick={() => onClick(algo)}
        >
            <div className="algorithmbutton-content">
                <span className="algorithm-button-header">{keyLabel}</span>
                <div className="algorithmbutton-datatype-grid">
                    {DATATYPE_SLOTS.map((slot, idx) => {
                        const { type, Icon } = slot;
                        const hasType =
                            type &&
                            Array.isArray(algo.datatypes) &&
                            algo.datatypes.includes(type);
                        return (
                            <div
                                key={`${keyLabel}-${idx}`}
                                className="algorithmbutton-datatype-cell"
                            >
                                {Icon ? (
                                    hasType ? (
                                        <Icon fontSize="small" style={{ fontSize: 10 }}
                                        />
                                    ) : (
                                        <FiberManualRecordIcon fontSize="small" style={{ fontSize: 6, opacity: 0.4 }}/>
                                    )
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>
        </button>
    );
}