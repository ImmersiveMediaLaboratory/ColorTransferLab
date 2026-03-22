/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './LayoutEval.scss'
import { useState, useEffect } from 'react'
import HeaderEval from './HeaderEval'
import FooterEval from './FooterEval'
import Main from '../main/Main'
import Logout from '../framing/Logout'
import Introduction from '../framing/Introduction'
import UserInfo from '../framing/UserInfo'
import { useWebRTC } from '@/Utils/WebRTCProvider';
import { getInitialValue } from "@/Utils/Utils";
import { useSelectionUserStudy } from '@/contexts/SelectionContextUserStudy.jsx';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Main application component for the Color Transfer User Study.
 ** Handles routing, authentication, user info, test type selection,
 ** and conditional rendering of all major pages and flows.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function LayoutEval() {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [isMobile, setIsMobile] = useState(false)
    const [userLink, setUserLink] = useState(null);

    const [submitted, setSubmitted] = useState(false)
    const [showIntro, setShowIntro] = useState(getInitialValue('LayoutEval:showIntro') ?? true);
    const [showUserInfo, setShowUserInfo] = useState(getInitialValue('LayoutEval:showUserInfo') ?? false);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc} = useWebRTC();
    const { offerState } = useSelectionUserStudy();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     ** Creates a WebRTC offer on component mount and extracts the user link from the URL parameters.
     **************************************************************************************************************/
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sid = params.get('sid');
        const id = params.get('id'); // <-- test Link
        setUserLink(id)

        rtc.createOffer(sid, null, id);
    }, [])

    /**************************************************************************************************************
     ** Stores the showIntro and showUserInfo states in localStorage whenever they change.     **************************************************************************************************************/
    useEffect(() => {
        if (!showUserInfo && !showIntro) {
            localStorage.setItem('LayoutEval:showIntro', 'false');
            localStorage.setItem('LayoutEval:showUserInfo', 'false');
        }
    }, [showUserInfo]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        offerState ? (
            <div className="layouteval">
                <HeaderEval />
                {isMobile ? (
                    <div className="layouteval-mobile-warning">
                        This application does not support mobile devices. Please switch to a desktop browser.
                    </div>
                ) : submitted ? (
                    <Logout />
                ) : showIntro ? (
                    <Introduction setShowIntro={setShowIntro} setShowUserInfo={setShowUserInfo} />
                ) : showUserInfo ? (
                    <UserInfo userLink={userLink} setShowUserInfo={setShowUserInfo} />
                ) : (
                    <Main setSubmitted={setSubmitted} />
                )}
                <FooterEval />
            </div> 
       
            ) : (null)
    )
}