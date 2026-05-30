/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./Results.scss";
import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import { useWebRTC } from '@/Utils/WebRTCProvider.jsx';
import {useWarning} from "@/contexts/WarningContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** This component is responsible for displaying the results of the user study for each participant.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Results({activeTab}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [previewData, setPreviewData] = useState([]);
    const [activeParticipant, setActiveParticipant] = useState("");

    /*------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const containerRef = useRef(null);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc} = useWebRTC();
    const { showWarning, showInfo } = useWarning();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Set up event listener for handling result file display.
     **************************************************************************************************************/
    useEffect(() => {
        window.addEventListener("webrtc:resultFile", handlerResultShow);
        return () => {
            window.removeEventListener("webrtc:resultFile", handlerResultShow);
        };
    }, []);

    /**************************************************************************************************************
     * Set up WebRTC message handler for receiving test set results and requesting result files.
     **************************************************************************************************************/  
    useEffect(() => {
        rtc.onGetTestSetResultsRequest = (data) => {
            setPreviewData(() =>
                Object.entries(data).map(([key, value]) => ({
                    name: key,
                    src: null,
                    ref: null,
                    out: null,
                    meta: value
                }))
            );

            // set the first user as active participant by default
            const firstParticipantId = Object.keys(Object.values(data)[0])[0];
            console.log(firstParticipantId)

            setActiveParticipant(firstParticipantId);

            for (const [key, value] of Object.entries(data)) {

                const dataRequests = ["src", "ref", "out"]

                for (const rid of dataRequests) {
                    const data_send = {
                        "command": "/getResultFileRequest",
                        "data": {
                            "rid": rid,
                            "abstractPath": `${key}/${rid}.png`,
                            "mode": "result"
                        }
                    }
                    console.debug("SEND", "[Compute Node] Request Result File via command /getResultFileRequest",  data_send)
                    rtc.sendMessage(JSON.stringify(data_send))
                }
            }
        }
    }, [rtc]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Handler for displaying result files in the preview area when received via WebRTC.
     **************************************************************************************************************/
    const handlerResultShow = (e) => {
        const stateKey = e.detail.abstractPath.substring(0, e.detail.abstractPath.lastIndexOf('/'));
        const value = e.detail.data;
        const rid = e.detail.rid;
        const receivedBlob = new Blob(value);
        const image_path = URL.createObjectURL(receivedBlob);

        setPreviewData((prevData) => {
            const idx = prevData.findIndex(item => item.name === stateKey);
            const newEntry = {
                name: stateKey,
                src: rid === "src" ? image_path : prevData[idx]?.src || null,
                ref: rid === "ref" ? image_path : prevData[idx]?.ref || null,
                out: rid === "out" ? image_path : prevData[idx]?.out || null,
                meta: rid === "meta" ? value : prevData[idx]?.meta || null,
            };
            if (idx === -1) {
                // Noch nicht vorhanden: hinzufügen
                return [...prevData, newEntry];
            } else {
                // Schon vorhanden: ersetzen
                const updated = [...prevData];
                updated[idx] = newEntry;
                return updated;
            }
        });
    }

    /**************************************************************************************************************
     * Deletes a participant's results from the preview area and sends a request to the compute node to 
     * remove the results from storage.
     **************************************************************************************************************/
    const removeResults = async (idx) => {
        if(idx === "" || idx === "None") {
            showInfo("Please select a participant to remove their results.")
            return;
        }

        const confirmed = await showWarning("Are you sure you want to remove the results of this user?");
        if (confirmed == "continue") {
            console.debug("INFO", "Removing results for participant with index:", idx);

            const data_send = {
                "command": "/deleteUserResultsRequest",
                "data": {
                    "participant_id": idx
                }
            }

            console.debug("SEND", "[Compute Node] Request Removal of User Results via command /deleteUserResultsRequest",  data_send)
            rtc.sendMessage(JSON.stringify(data_send))

            setPreviewData((prevData) => prevData.filter(item => item.meta && item.meta[idx] === undefined));
            setActiveParticipant("")
        }
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <Box
            ref={containerRef}
            className="results"
            style={{display: activeTab === "results" ? "block" : "none"}}
        >
            {/* MAIN AREA */}
            <div className="results-main">
                    <div className="results-table-header">
                        <div className="results-cell-header-empty"></div>
                        <div className="results-cell-header">Source</div>
                        <div className="results-cell-header">Reference</div>
                        <div className="results-cell-header">Output</div>
                        <div className="results-cell-header-meta">Results
                            <div className="results-cell-header-meta-buttons">
                                <select
                                    className="results-meta-input"
                                    value={activeParticipant}
                                    onChange={e => setActiveParticipant(e.target.value)}
                                >
                                    {previewData.length > 0 &&
                                        Object.keys(previewData[0].meta).map(participantId => (
                                            <option key={participantId} value={participantId}>
                                                {participantId}
                                            </option>
                                        ))
                                    }
                                </select>
                                <div 
                                    className="results-meta-remove-button"
                                    onClick={() => removeResults(activeParticipant)}
                                >
                                    Remove Results
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="results-content">
                        <div className="results-table-body">
                            <div className="results-tbody">
                                {previewData.slice().reverse().map((item, index) => (
                                    <div key={index}className="results-tr">
                                        <div className="results-cell-button"/>
                                        <div className="results-cell img">
                                            <img src={item.src} />
                                        </div>
                                        <div className="results-cell img"> 
                                            <img src={item.ref} />
                                        </div>
                                        <div className="results-cell img"> 
                                            <img src={item.out} />
                                        </div>
                                        <div className="results-cell meta">
                                            <div className="meta-scroll">
                                            {item.meta[activeParticipant] && Object.entries(item.meta[activeParticipant]).sort(([aKey], [bKey]) => aKey.localeCompare(bKey)).map(([key, value]) => (
                                                <div key={key}>
                                                    <strong>{key}:</strong> {String(value)}
                                                </div>
                                            ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
            </div>
        </Box>
    );
}