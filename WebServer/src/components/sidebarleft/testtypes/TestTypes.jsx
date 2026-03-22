/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./TestTypes.scss";
import ArticleIcon from '@mui/icons-material/Article';
import Box from "@mui/material/Box";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useState } from "react";
import TestTypeButton from "./TestTypeButton"
import { getInitialValue } from "@/Utils/Utils";
import { useSelectionUserStudy } from "@/contexts/SelectionContextUserStudy";
import { useWebRTC } from '@/Utils/WebRTCProvider';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Left sidebar component that allows users to select the test type for the user study and to export 
 ** the results as a JSON file.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function TestTypes({activePanel, showLeft, leftWidth, isUserStudyOpen}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [activeTestType, setActiveTestType] = useState(getInitialValue('TestTypes:testType') ?? "rating");   

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const { setSelectedTestType } = useSelectionUserStudy();
    const isMobile = useMediaQuery("(max-width:900px)");
    const {rtc} = useWebRTC();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Whenever the active test type changes, save it to localStorage and update the selected test type 
     * in the context.
     **************************************************************************************************************/
    useEffect(() => {
        localStorage.setItem('TestTypes:testType', JSON.stringify(activeTestType));
        setSelectedTestType(activeTestType);
    }, [activeTestType]);

    /**************************************************************************************************************
     * Listen for results request from compute node and export results as JSON file
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onGetResultsRequest = (data) => {
            console.debug("RECV", "[Compute Node] Results data received: ", data);

            const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filename = `results_${timestamp}.json`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }, [rtc]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Activates the clicked test type and prints test type's information within the Information-Tab.
     **************************************************************************************************************/
    const handleTestTypeClick = (testType) => {
        console.debug("INFO", `Selected test type: ${testType}`)
        setActiveTestType(testType);
        setSelectedTestType(testType);
    };

    /**************************************************************************************************************
     * Requests results data from the compute node and triggers the download of the results as a JSON file.
     **************************************************************************************************************/
    const handleExportResults = () => {
        const data_send = {
            command: "/getResultsRequest",
            data: ""
        };
        console.debug("SEND", "[Compute Node] Request results: /getResultsRequest");
        rtc.sendMessage(JSON.stringify(data_send));
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <Box 
            className="testtypes"
            sx={{
                display: !isUserStudyOpen ? "none" : isMobile
                ? (activePanel === "left" ? "flex" : "none")
                : (showLeft ? "flex" : "none"),
                width: isMobile ? "100%" : leftWidth + "px",
                flexGrow: isMobile ? 1 : 0,
                
            }}
        >
            {/* Icon and Title */}
            <div className="testtypes_title">
                <ArticleIcon className="testtypes_icon"/>
                TEST TYPES
            </div>

            <div className="testtypes_body">

                {/* Content area with algorithm buttons */}
                <div className="testtypes_content">
                    <TestTypeButton activeTestType={activeTestType} val="rating" onClick={() => handleTestTypeClick("rating")}>Likert Rating</TestTypeButton>
                    {/* <TestTypeButton activeTestType={activeTestType} val="comparison" onClick={() => handleTestTypeClick("comparison")}>Pairwise Comparison</TestTypeButton>
                    <TestTypeButton activeTestType={activeTestType} val="ranking" onClick={() => handleTestTypeClick("ranking")}>Ranking</TestTypeButton> */}
                </div>
            </div>
            <div className="testtypes-export-button" onClick={() => handleExportResults()}>Export Results as JSON</div>
        </Box>
    );
}