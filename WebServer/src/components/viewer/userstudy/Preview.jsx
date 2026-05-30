/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./Preview.scss";
import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { useWebRTC } from '@/Utils/WebRTCProvider.jsx';
import { getInitialValue } from "@/Utils/Utils";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Display items from the test datasets.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Preview({activeTab}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [previewData, setPreviewData] = useState(getInitialValue('Preview:Data') || []);

    /*------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const containerRef = useRef(null);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc} = useWebRTC();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Set up event listener for handling user study file display.
     **************************************************************************************************************/
    useEffect(() => {
        window.addEventListener("webrtc:userstudyFile", handlerUserStudyShow);
        return () => {
            window.removeEventListener("webrtc:userstudyFile", handlerUserStudyShow);
        };
    }, []);

    /**************************************************************************************************************
     * Persist preview data in local storage to survive page reloads.
     **************************************************************************************************************/
    useEffect(() => {
        localStorage.setItem('Preview:Data', JSON.stringify(previewData));
    }, [previewData]);

    /**************************************************************************************************************
     * Set up WebRTC handler for receiving user study metadata.
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onGetUserStudyMetaRequest = (data) => {
            const stateKey = data.abstractPath

            setPreviewData((prevData) => {
                const idx = prevData.findIndex(item => item.name === stateKey);
                const newEntry = {
                    name: stateKey,
                    src: prevData[idx]?.src || null,
                    ref: prevData[idx]?.ref || null,
                    out: prevData[idx]?.out || null,
                    meta: data,
                };
                if (idx === -1) {
                    return [...prevData, newEntry];
                } else {
                    const updated = [...prevData];
                    updated[idx] = newEntry;
                    return updated;
                }
            });
            console.debug("RECV", "[Compute Node] User Study meta data received: ", data);
        };
    }, [rtc]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Handler for displaying user study files in the preview.
     **************************************************************************************************************/
    const handlerUserStudyShow = (e) => {
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
                return [...prevData, newEntry];
            } else {
                const updated = [...prevData];
                updated[idx] = newEntry;
                return updated;
            }
        });
    }

    /**************************************************************************************************************
     * Removes a preview item from the list.
     **************************************************************************************************************/
    const removePreviewItem = (name) => {
        console.debug("INFO", "Removing preview item with name:", name);
        setPreviewData((prevData) => prevData.filter(item => item.name !== name));
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <Box
            ref={containerRef}
            className="preview"
            style={{display: activeTab === "preview" ? "block" : "none"}}
        >
            <div className="preview-main">
                    <div className="preview-table-header">
                        <div className="preview-cell-header-empty"></div>
                        <div className="preview-cell-header">Source</div>
                        <div className="preview-cell-header">Reference</div>
                        <div className="preview-cell-header">Output</div>
                        <div className="preview-cell-header-meta">Meta</div>
                    </div>
                    <div className="preview-content">
                        <div className="preview-table-body">
                            <div className="preview-tbody">
                                {previewData.slice().reverse().map((item, index) => (
                                    <div key={index} className="preview-tr">
                                        <div className="preview-cell-button">
                                            <IndeterminateCheckBoxIcon className="preview-close-button" onClick={() => removePreviewItem(item.name)} />
                                        </div>
                                        <div className="preview-cell img">
                                            <img src={item.src} />
                                        </div>
                                        <div className="preview-cell img"> 
                                            <img src={item.ref} />
                                        </div>
                                        <div className="preview-cell img"> 
                                            <img src={item.out} />
                                        </div>
                                        <div className="preview-cell meta">
                                            <div className="meta-scroll">
                                            {item.meta && Object.entries(item.meta).map(([key, value]) => (
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