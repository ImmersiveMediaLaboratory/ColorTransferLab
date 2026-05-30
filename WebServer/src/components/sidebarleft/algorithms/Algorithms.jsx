/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./Algorithms.scss";
import ArticleIcon from '@mui/icons-material/Article';
import Box from "@mui/material/Box";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useWebRTC } from '@/Utils/WebRTCProvider';
import { useEffect, useState } from "react";
import AlgorithmTabContent from "./AlgorithmTabContent";
import { getInitialValue } from "@/Utils/Utils";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Left sidebar with three tabs each activating a different content area.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Algorithms({activePanel, showLeft, leftWidth, isUserStudyOpen}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [activeTab, setActiveTab] = useState(getInitialValue('Algorithms:activeAlgorithmsTab') ?? "a");    
    const [algorithmsList, setAlgorithmsList] = useState([]);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const isMobile = useMediaQuery("(max-width:900px)");
    const {rtc, dataChannelOpen} = useWebRTC();
    const tabs = [
        { id: "a", text: "Color Transfer" },
        { id: "b", text: "Style Transfer" },
        { id: "c", text: "Colorization" }
    ];

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Listen for algorithms list from compute node and update state accordingly
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onAlgorithmsRequest = (data) => {
            console.debug("RECV", "[Compute Node] Algorithms list received: ", {data})
            setAlgorithmsList(data);
        };
    }, [rtc]);

    /**************************************************************************************************************
     * Request the algorithms list from the compute node
     **************************************************************************************************************/
    useEffect(() => {
        if (dataChannelOpen) {
            const data_send = {
                command: "/getMethodsRequest",
                data: ""
            };
            console.debug("SEND", "[Compute Node] Request algorithms via command: /getMethodsRequest");
            rtc.sendMessage(JSON.stringify(data_send));
        }
    }, [dataChannelOpen]);

    /**************************************************************************************************************
     * Persist active tab in local storage
     **************************************************************************************************************/
    useEffect(() => {
        localStorage.setItem('Algorithms:activeAlgorithmsTab', JSON.stringify(activeTab));
    }, [activeTab]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <Box 
            className="algorithms"
            sx={{
                display: isUserStudyOpen ? "none" : isMobile
                ? (activePanel === "left" ? "flex" : "none")
                : (showLeft ? "flex" : "none"),
                width: isMobile ? "100%" : leftWidth + "px",
                flexGrow: isMobile ? 1 : 0
            }}
        >
            {/* Icon and Title */}
            <div className="algorithms_title">
                <ArticleIcon className="algorithms_icon"/>
                ALGORITHMS
            </div>

            <div className="algorithms_body">
                {/* Left vertical tab bar */}
                <div className="algorithms_tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`algorithms_tab ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="algorithms_tab_text">{tab.text}</span>
                        </button>
                    ))}
                </div>

                {/* Content area with algorithm buttons */}
                <div className="algorithms_content">
                    <AlgorithmTabContent 
                        activeTab={activeTab}
                        algorithmsList={algorithmsList}
                    />
                </div>
            </div>
        </Box>
    );
}