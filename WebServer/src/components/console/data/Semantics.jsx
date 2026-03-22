/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Semantics.scss';
import {useEffect, useState} from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import CircularProgress from '@mui/material/CircularProgress';
import { useSelection } from "@/contexts/SelectionContext";
import SemanticsList from './SemanticsList';
import {useWebRTC} from '@/Utils/WebRTCProvider';

/******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************/
export default function Semantics({activeRenderer, setSemanticMaps}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [srcSemantics, setSrcSemantics] = useState(null);
    const [refSemantics, setRefSemantics] = useState(null);
    const [srcLoading, setSrcLoading] = useState(false);
    const [refLoading, setRefLoading] = useState(false);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const isMobile = useMediaQuery("(max-width:900px)");

    // Visibility: Desktop → all visible; Mobile → only activeRenderer
    const showSrc  = !isMobile || activeRenderer === "src";
    const showRef  = !isMobile || activeRenderer === "ref";
    const showOut  = !isMobile || activeRenderer === "out";

    const {rtc} = useWebRTC();
    const { selectedSourcePath, selectedReferencePath, selectedSemanticList } = useSelection(); 

    const chessPattern = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><defs><pattern id='c' width='8' height='8' patternUnits='userSpaceOnUse'><rect width='8' height='8' fill='%23ccc'/><rect width='4' height='4' fill='%23eee'/><rect x='4' y='4' width='4' height='4' fill='%23eee'/></pattern></defs><rect width='64' height='64' fill='url(%23c)'/></svg>"

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        window.addEventListener("webrtc:fileAvailability", handlerSemanticsAvailability);
        window.addEventListener("webrtc:semanticsFile", handlerSemanticsShow);
        return () => {
            window.removeEventListener("webrtc:fileAvailability", handlerSemanticsAvailability);
            window.removeEventListener("webrtc:semanticsFile", handlerSemanticsShow);
        };
    }, []);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Sets the semantic map in the semantic tab
     **************************************************************************************************************/
    const handlerSemanticsShow = (e) => {
        console.log("Semantics File Received:", e.detail);

        const value = e.detail.data;
        const receivedBlob = new Blob(value);
        const image_path = URL.createObjectURL(receivedBlob);

        if (e.detail.rid === "src") {
            setSrcSemantics(image_path);
            setSrcLoading(false);
            setSemanticMaps(prev => ({...prev, src: image_path}));
        } else if (e.detail.rid === "ref") {
            setRefSemantics(image_path);
            setRefLoading(false);
            setSemanticMaps(prev => ({...prev, ref: image_path}));
        }
    }
    /**************************************************************************************************************
     * Requests semantics generation
     **************************************************************************************************************/
    const generateSemantics = (slot) => {
        if (slot === "src") setSrcLoading(true);
        if (slot === "ref") setRefLoading(true);

        console.debug("SEND", `[Compute Node] Requesting semantics generation via command /semantics for ${slot} with selectedSemanticList:`, {selectedSemanticList});

        const data_send = {
            command: "/semantics",
            data: {
                image: slot === "src" ? selectedSourcePath : selectedReferencePath,
                view: slot,
                semantics: selectedSemanticList
            }
        };
        rtc.sendMessage(JSON.stringify(data_send));
    }
    /**************************************************************************************************************
     * Requests the semantic map if available
     **************************************************************************************************************/
    const handlerSemanticsAvailability = (e) => {
        const detail = e.detail;
        const availability = detail.exists;
        // if semantics available, request file
        if (availability) {
            console.debug("SEND", "[Compute Node] Requesting semantics file via command /file for", detail.abstractPath);
            const data_send = {
                command: "/file",
                data: {
                    "rid": detail.rid,
                    "abstractPath": detail.abstractPath,
                    "mode": "semantics"
                }
            };
            rtc.sendMessage(JSON.stringify(data_send))
        } else {
            if (detail.rid === "src") setSrcSemantics(chessPattern);
            if (detail.rid === "ref") setRefSemantics(chessPattern);
        }
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className='semanticsX'>
            {/* SRC-Infos */}
            <div
                className='sub_semantics_content'
                style={{ display: showSrc ? undefined : "none" }}
            >
                <div className="semantics-texture-container">
                    {srcLoading ? (
                        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                            <CircularProgress />
                        </div>
                    ) : (
                        <img 
                            className="semantics_texture" 
                            src={srcSemantics || chessPattern}
                        />
                    )}
                    <div className='semantics_button' onClick={() => generateSemantics("src")}>
                        Generate
                    </div>
                </div>
            </div>

            {/* REF-Infos */}
            <div
                className='sub_semantics_content'
                style={{ display: showRef ? undefined : "none" }}
            >
                <div className="semantics-texture-container">
                    {refLoading ? (
                        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                            <CircularProgress />
                        </div>
                    ) : (
                        <img 
                            className="semantics_texture" 
                            src={refSemantics || chessPattern}
                        />
                    )}
                    <div className='semantics_button' onClick={() => generateSemantics("ref")}>
                        Generate
                    </div>
                </div>
            </div>
            {/* OUT-Infos */}
            <div
                className='sub_semantics_content'
                style={{ display: showOut ? undefined : "none" }}
            >
                <SemanticsList />
            </div>
        </div>
    );
}