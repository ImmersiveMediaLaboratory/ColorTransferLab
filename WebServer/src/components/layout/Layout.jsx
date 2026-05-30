/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./Layout.scss";
import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "./Header";
import Algorithms from "../sidebarleft/algorithms/Algorithms";
import Server from "../sidebarright/server/Server";
import Console from "../console/Console";
import Database from "../sidebarright/database/Database";
import TestSets from "@/components/sidebarright/testsets/TestSets";
import View from "../viewer/View";
import {useWebRTC} from '@/Utils/WebRTCProvider';
import Footer from "./Footer";
import TestTypes from "@/components/sidebarleft/testtypes/TestTypes";
import TurnServer from "@/components/sidebarleft/turnserver/TurnServer";
import DatabaseUserStudy from "@/components/sidebarright/databaseuserstudy/DatabaseUserStudy";
import ViewUserStudy from "../viewer/userstudy/ViewUserStudy";
import { getInitialValue } from "@/Utils/Utils";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** ...
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Layout() {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/ 
    const [settings, setSettings] = useState({src: [], ref: [], out: []});
    const [meshTexture, setMeshTexture] = useState({src: null, ref: null, out: null});
    const [semanticMaps, setSemanticMaps] = useState({src: null, ref: null});

    const [outputModifications, setOutputModifications] = useState(
        {
            all:{
                hue: 180,
                brightness: 1000,
                saturation: 50
            }
        }
    );

    // Horizontal widths
    const [leftWidth, setLeftWidth] = useState(getInitialValue('Layout:leftWidth') ?? 200);
    const [rightWidth, setRightWidth] = useState(getInitialValue('Layout:rightWidth') ?? 200);

    // Vertical heights for BOTTOM sections
    const [centerBottomHeight, setCenterBottomHeight] = useState(getInitialValue('Layout:centerBottomHeight') ?? 300);

    const [rightBottomHeight, setRightBottomHeight] = useState(getInitialValue('Layout:rightBottomHeight') ?? 300);
    const [rightTopHeight, setRightTopHeight] = useState(getInitialValue('Layout:rightTopHeight') ?? 300);

    const [leftBottomHeight, setLeftBottomHeight] = useState(getInitialValue('Layout:leftBottomHeight') ?? 300);
    
    const [activePanel, setActivePanel] = useState("center");

    const [showLeft, setShowLeft] = useState(getInitialValue('Layout:showLeft') ?? true);
    const [showRight, setShowRight] = useState(getInitialValue('Layout:showRight') ?? true);
    const [showBottom, setShowBottom] = useState(getInitialValue('Layout:showBottom') ?? true);

    const [isUserStudyOpen, setIsUserStudyOpen] = useState(getInitialValue('Layout:isUserStudyOpen') ?? false);

    /*------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const drag = useRef({
        left: false,
        right: false,
        leftVertical: false,
        centerVertical: false,
        rightVertical: false,
        rightVerticalTop: false,
    });

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc} = useWebRTC();
    const isMobile = useMediaQuery("(max-width:900px)");

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Save layout settings to localStorage on change
     **************************************************************************************************************/
    useEffect(() => {
        localStorage.setItem('Layout:leftWidth', JSON.stringify(leftWidth));
        localStorage.setItem('Layout:rightWidth', JSON.stringify(rightWidth));
        localStorage.setItem('Layout:centerBottomHeight', JSON.stringify(centerBottomHeight));
        localStorage.setItem('Layout:rightBottomHeight', JSON.stringify(rightBottomHeight));
        localStorage.setItem('Layout:rightTopHeight', JSON.stringify(rightTopHeight));
        localStorage.setItem('Layout:leftBottomHeight', JSON.stringify(leftBottomHeight));

        localStorage.setItem('Layout:showLeft', JSON.stringify(showLeft));
        localStorage.setItem('Layout:showRight', JSON.stringify(showRight));
        localStorage.setItem('Layout:showBottom', JSON.stringify(showBottom));
        localStorage.setItem('Layout:isUserStudyOpen', JSON.stringify(isUserStudyOpen));
    }, [leftWidth, rightWidth, centerBottomHeight, rightBottomHeight, leftBottomHeight, showLeft, showRight, showBottom, isUserStudyOpen]);


    
    /**************************************************************************************************************
     * Request available compute nodes from signaling server
     **************************************************************************************************************/
    useEffect(() => {
        rtc.sendServerMessage("/getComputeNodesRequest")
    }, []);
        
    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Mouse Move Handler
     **************************************************************************************************************/
    const handleMouseMove = (e) => {
        const screenHeight = window.innerHeight;
        const footerOffset = 40;
        const headerOffset = 40;

        // Horizontal
        if (drag.current.left) {
            setLeftWidth(Math.max(120, e.clientX));
        }
        if (drag.current.right) {
            setRightWidth(Math.max(120, window.innerWidth - e.clientX));
        }

        let newHeight = screenHeight - e.clientY - footerOffset;

        if (drag.current.centerVertical) {
            let clamped = Math.max(200, Math.min(newHeight, screenHeight * 0.7));
            setCenterBottomHeight(clamped);
        }
        if (drag.current.rightVertical) {
            let clamped = Math.max(200, Math.min(newHeight, 300));
            setRightBottomHeight(clamped);
        }

        if (drag.current.leftVertical) {
            let clamped = Math.max(200, Math.min(newHeight, 300));
            setLeftBottomHeight(clamped);
        }

        let newHeightTop = e.clientY - headerOffset;
        // let XD = screenHeight - rightBottomHeight - footerOffset - headerOffset - 200;
        let XD = screenHeight - 400 - footerOffset - headerOffset - 100;
        let clampedTop = Math.max(200, Math.min(newHeightTop, XD));


        if (drag.current.rightVerticalTop) {
            setRightTopHeight(clampedTop);
        }   

        if (drag.current.leftVerticalTop) {
            setLeftTopHeight(clampedTop);
        }   
    };

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const stopDragging = () => {
        drag.current.left = false;
        drag.current.right = false;
        drag.current.leftVertical = false;
        drag.current.centerVertical = false;
        drag.current.rightVertical = false;
        drag.current.rightVerticalTop = false;
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <Box
            className="layout"
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
        >
            <Header
                showLeft={showLeft}
                setShowLeft={setShowLeft}
                showRight={showRight}
                setShowRight={setShowRight}
                showBottom={showBottom}
                setShowBottom={setShowBottom}
                isUserStudyOpen={isUserStudyOpen}
                setIsUserStudyOpen={setIsUserStudyOpen}
            />

            {/* Body */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    overflow: "hidden",
                }}
            >
                {/* LEFT COLUMN: Algorithms */}
                {/* <Algorithms
                    activePanel={activePanel}
                    showLeft={showLeft}  
                    leftWidth={leftWidth}  
                    isUserStudyOpen={isUserStudyOpen}
                />

                <TestTypes
                    activePanel={activePanel}
                    showLeft={showLeft}  
                    leftWidth={leftWidth}  
                    isUserStudyOpen={isUserStudyOpen}
                /> */}

                <Box
                    sx={{
                        display: isMobile
                        ? (activePanel === "left" ? "flex" : "none")
                        : (showLeft ? "flex" : "none"),
                        flexDirection: "column",
                        width: isMobile ? "100%" : leftWidth + "px",
                        flexGrow: isMobile ? 1 : 0
                    }}
                >
                    <Algorithms
                        activePanel={activePanel}
                        showLeft={showLeft}  
                        leftWidth={leftWidth}  
                        isUserStudyOpen={isUserStudyOpen}
                    />

                    <TestTypes
                        activePanel={activePanel}
                        showLeft={showLeft}  
                        leftWidth={leftWidth}  
                        isUserStudyOpen={isUserStudyOpen}
                    />
                    
                    {/* Handle between Database and Server */}
                    <Box
                        className="layout-handler horizontal"
                        onMouseDown={() => (drag.current.leftVertical = true)}
                        sx={{
                            flexGrow: 0, flexShrink: 0
                        }}

                    />

                    <TurnServer leftBottomHeight={leftBottomHeight}/>
                </Box>

                {/* LEFT ↔ CENTER horizontal resizer (desktop only, and only if left is visible) */}
                {!isMobile && showLeft && (
                    <Box
                        className="layout-handler vertical"
                        onMouseDown={() => (drag.current.left = true)}
                    />
                )}

                {/* CENTER COLUMN: View + Console */}
                <Box
                    sx={{
                        display: isMobile
                        ? (activePanel === "center" ? "flex" : "none")
                        : "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                    }}
                >
                    {/* TOP = flex (View) */}
                    <View 
                        setSettings={setSettings} 
                        setMeshTexture={setMeshTexture}   
                        outputModifications={outputModifications}
                        semanticMaps={semanticMaps}
                        isUserStudyOpen={isUserStudyOpen}
                    />

                    <ViewUserStudy
                        isUserStudyOpen={isUserStudyOpen}
                    />

                    {/* Handle between View and Console */}
                    <Box
                        className="layout-handler horizontal"
                        onMouseDown={() => (drag.current.centerVertical = true)}
                        sx={{
                            display: isMobile
                                ? (activePanel === "center" && showBottom ? "block" : "none")
                                : (showBottom ? "block" : "none"),
                        }}
                    />

                    {/* BOTTOM = Console*/}
                    <Box
                        sx={{
                            height: isMobile
                            ? (activePanel === "center" ? centerBottomHeight + "px" : 0)
                            : (showBottom ? centerBottomHeight + "px" : 0),
                            overflow: "hidden",
                            mt: 0,
                        }}
                    >
                        <Console
                            settings={settings}
                            meshTexture={meshTexture}
                            setOutputModifications={setOutputModifications}
                            semanticMaps={semanticMaps}
                            setSemanticMaps={setSemanticMaps}
                            isUserStudyOpen={isUserStudyOpen}
                        />
                    </Box>
                </Box>

                {/* CENTER ↔ RIGHT horizontal resizer (desktop only, and only if right is visible) */}
                {!isMobile && showRight && (
                    <Box
                        className="layout-handler vertical"
                        onMouseDown={() => (drag.current.right = true)}
                    />
                )}

                {/* RIGHT COLUMN: Database + Server */}
                <Box
                    sx={{
                        display: isMobile
                        ? (activePanel === "right" ? "flex" : "none")
                        : (showRight ? "flex" : "none"),
                        flexDirection: "column",
                        width: isMobile ? "100%" : rightWidth + "px",
                        flexGrow: isMobile ? 1 : 0
                    }}
                >

                    <Database isUserStudyOpen={isUserStudyOpen}/>

                    <DatabaseUserStudy isUserStudyOpen={isUserStudyOpen} rightTopHeight={rightTopHeight}/>
                        <Box
                        className="layout-handler horizontal"
                        onMouseDown={() => (drag.current.rightVerticalTop = true)}
                        sx={{
                            display: isUserStudyOpen ? "block" : "none",
                            flexGrow: 0, flexShrink: 0

                        }}
                    />
                    <TestSets isUserStudyOpen={isUserStudyOpen}/> 
                    
                    {/* Handle between Database and Server */}
                    <Box
                        className="layout-handler horizontal"
                        onMouseDown={() => (drag.current.rightVertical = true)}
                        sx={{
                            flexGrow: 0, flexShrink: 0
                        }}

                    />

                    <Server rightBottomHeight={rightBottomHeight}/>
                </Box>
            </Box>

            <Footer activePanel={activePanel} setActivePanel={setActivePanel}/>
        </Box>
    );
}