/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Introduction.scss';
import { useState, useEffect } from "react";
import { useWebRTC } from '@/Utils/WebRTCProvider.jsx';
import { useSelectionUserStudy } from '@/contexts/SelectionContextUserStudy.jsx';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Introduction component displaying the study instructions.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Introduction({ setShowIntro, setShowUserInfo }) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [introductionText, setIntroductionText] = useState("");

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc, dataChannelOpen} = useWebRTC();
    const { offerState } = useSelectionUserStudy();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onGetIntroductionsRequest = (data) => {
            console.debug("RECV", "[Compute Node] User Study introduction data received: ", data);
            const filtered = data.filter(obj => obj.name === "rating");
            setIntroductionText(filtered[0].text);
        };
    }, [rtc]);

    /**************************************************************************************************************
     * Callback when data channel is open, send request to get the introduction text for the user study.
     **************************************************************************************************************/
    useEffect(() => {
        // Data channel is not ready yet, wait for dataChannelOpen to be set to true before sending the request
        if (dataChannelOpen) {
            const data_send = {
                command: "/getIntroductionsRequest",
                data: {test_type: "rating"}
            };

            console.debug("SEND", "[COMPUTE NODE] Request to apply User Study introductions via command /getIntroductionsRequest", data_send);
            rtc.sendMessage(JSON.stringify(data_send));
        }
    }, [dataChannelOpen]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="introduction-container">
            <div
                contentEditable={true}
                dangerouslySetInnerHTML={{ __html: introductionText }}
            />
            <button 
                className="introduction-continue-btn" 
                onClick={() => { setShowIntro(false); setShowUserInfo(true); }}
            >
                Continue
            </button>
        </div>
    );
}