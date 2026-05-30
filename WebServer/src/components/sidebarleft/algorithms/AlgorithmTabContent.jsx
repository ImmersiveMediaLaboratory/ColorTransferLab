/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./AlgorithmTabContent.scss"
import AlgorithmButton from "./AlgorithmButton";
import CloudIcon from '@mui/icons-material/Cloud';
import ImageIcon from '@mui/icons-material/Image';
import GridOnIcon from '@mui/icons-material/GridOn';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import AppsIcon from '@mui/icons-material/Apps';
import AnimationIcon from '@mui/icons-material/Animation';
import ReactDOMServer from "react-dom/server";
import { useEffect, useState } from "react";
import { getInitialValue } from "@/Utils/Utils"
import { useSelection } from "@/contexts/SelectionContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Content area with a button for each available algorithm.
 ******************************************************************************************************************
 ******************************************************************************************************************/
/** Primary UI component for user interaction */
export default function AlgorithmTabContent({ activeTab, algorithmsList}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/  
    const [activeAlgo, setActiveAlgo] = useState(getInitialValue('AlgorithmTabContent:algorithm') ?? null);   

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const { setSelectedAlgorithm } = useSelection();

    const colorTransferMethods = getMethodsByType("Color Transfer");
    const styleTransferMethods = getMethodsByType("Style Transfer");
    const colorizationMethods = getMethodsByType("Colorization");

    const methodGroups = {
        a: colorTransferMethods,
        b: styleTransferMethods,
        c: colorizationMethods,
    };

    const methods = methodGroups[activeTab] || [];

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

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Updates the selected algorithm and stores it in local storage.
     **************************************************************************************************************/
    useEffect(() => {
        activeAlgo && printAlgorithmInformation(activeAlgo)
        localStorage.setItem('AlgorithmTabContent:algorithm', JSON.stringify(activeAlgo));
        setSelectedAlgorithm(activeAlgo);
    }, [activeAlgo]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Returns all methods which corresponds to a given type. Available types: "Color Transfer", "Style Transfer", "Colorization"
     **************************************************************************************************************/
    function getMethodsByType(type) {
        if (!Array.isArray(algorithmsList)) {
            return [];
        }
        return algorithmsList.filter((algo) => algo.type === type);
    };

    /**************************************************************************************************************
     * Activates the clicked algorithm and prints algorithm's information within the Information-Tab.
     **************************************************************************************************************/
    const handleAlgorithmClick = (algo) => {
        console.debug("INFO", `Selected algorithm: ${algo.name}`)
        setSelectedAlgorithm(algo);
        setActiveAlgo(algo);
    };

    /**************************************************************************************************************
     * Prints information about the selected algorithm in the Information-Tab.
     **************************************************************************************************************/
    function printAlgorithmInformation(algo) {
        let supportHtml = "";
        if (Array.isArray(algo.datatypes) && algo.datatypes.length > 0) {
            const [first, ...rest] = algo.datatypes;

            const firstIconHtml = getIconHtmlForDatatype(first);
            const firstLine = `Support: ${firstIconHtml}${first}`;

            const restLines = rest
                .map((dt) => {
                    const iconHtml = getIconHtmlForDatatype(dt);
                    return `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${iconHtml}${dt}`;
                })
                .join("<br/>");

            supportHtml = firstLine + (restLines ? "<br/>" + restLines : "");
        } else if (algo.datatypes) {
            const iconHtml = getIconHtmlForDatatype(algo.datatypes);
            supportHtml = `Support: ${iconHtml}${algo.datatypes}`;
        } else {
            supportHtml = "Support: -";
        }

        if (window.pushInformation) {           
            window.pushInformation(
                "Publication: " + algo.publication + "<br/>" + 
                "Authors: " + algo.author + "<br/>" +  
                "Scientific Venue: " + algo.scientificVenue + "<br/>" + 
                "Year: " + algo.year + "<br/>" +  
                "DOI: " + "<a href="+algo.doi+">"+algo.doi + "</a>" + "<br/>" +  
                "Abstract: " + algo.abstract + "<br/>" +
                supportHtml + "<br/>"
            );
        }
    };

    /**************************************************************************************************************
     * Return Icon for a specific data type
     **************************************************************************************************************/
    function getIconHtmlForDatatype(dt) {
        const slot = DATATYPE_SLOTS.find(s => s.type === dt);
        const IconComp = slot?.Icon || ImageIcon;
        return ReactDOMServer.renderToStaticMarkup(
            <IconComp className="algorithmtabcontent-information-button"/>
        );
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="algorithms_list">
            {methods.length > 0 ? (
                methods.map((algo) => (
                    <AlgorithmButton 
                        key={algo.key ?? algo.name} 
                        algo={algo} 
                        onClick={handleAlgorithmClick} 
                        activeAlgo={activeAlgo?.key}
                    />
                ))
            ) : (
                <div>No algorithms available</div>
            )}
        </div>
    );
}