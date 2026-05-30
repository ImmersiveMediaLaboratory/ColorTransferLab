/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./View.scss";
import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import Renderer from "./renderer/Renderer.jsx";
import { getInitialValue } from "@/Utils/Utils.jsx";
import ViewHeader from "./ViewHeader.jsx";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** This component is responsible for rendering the main view of the application, which includes the source, 
 ** reference, and output renderers. It also handles the drag-and-drop functionality for loading files.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function View({setSettings, setMeshTexture, outputModifications, semanticMaps, isUserStudyOpen}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [showTop, setShowTop] = useState(getInitialValue('View:ShowTop') ?? true);
    const [showBottom, setShowBottom] = useState(getInitialValue('View:ShowBottom') ?? true);
    const [showRight, setShowRight] = useState(getInitialValue('View:ShowRight') ?? true);
    const [activeMobile, setActiveMobile] = useState("right");
    const [leftWidth, setLeftWidth] = useState(getInitialValue('View:LeftWidth') ?? 350); // pixels
    const [topHeight, setTopHeight] = useState(getInitialValue('View:TopHeight') ?? 50); // percent
    const [area1File, setArea1File] = useState(getInitialValue('Renderer:filePath:src') ?? null);
    const [area2File, setArea2File] = useState(getInitialValue('Renderer:filePath:ref') ?? null);
    const [areaOutFile, setAreaOutFile] = useState(getInitialValue('Renderer:filePath:out') ?? null);
    const [activeDownload, setActiveDownload] = useState({src: false, ref: false, out: false});
    const [isDraggingOverArea1, setDraggingOverArea1] = useState(false);
    const [isDraggingOverArea2, setDraggingOverArea2] = useState(false);
    const [isDraggingOverAreaOut, setDraggingOverAreaOut] = useState(false);
    /*------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const containerRef = useRef(null);
    const drag = useRef({ horizontal: false, vertical: false });

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const isMobile = useMediaQuery("(max-width:900px)");

    const isTopActive = isMobile ? activeMobile === "top" : showTop;
    const isBottomActive = isMobile ? activeMobile === "bottom" : showBottom;
    const isRightActive = isMobile ? activeMobile === "right" : showRight;

    const viewButtons = [
        { label: "SRC", isActive: isTopActive, setState: setShowTop, activeMobileState: "top" },
        { label: "REF", isActive: isBottomActive, setState: setShowBottom, activeMobileState: "bottom" },
        { label: "OUT", isActive: isRightActive, setState: setShowRight, activeMobileState: "right" },
    ];

    const isLeftVisible =
        (!isMobile && (showTop || showBottom)) ||
        (isMobile && activeMobile !== "right");

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     *  Calls handler if file is dropped on the renderer
     **************************************************************************************************************/
    useEffect(() => {
        const handleFileToSource = (e) => {
            const filePath = e.detail;
            setArea1File(filePath);
        };

        const handleFileToReference = (e) => {
            const filePath = e.detail;
            setArea2File(filePath);
        };

        const handleFileToOutput = (e) => {
            const filePath = e.detail;
            setAreaOutFile(filePath);
        };

        window.addEventListener("fileToSource", handleFileToSource);
        window.addEventListener("fileToReference", handleFileToReference);
        window.addEventListener("fileToOutput", handleFileToOutput);

        return () => {
            window.removeEventListener("fileToSource", handleFileToSource);
            window.removeEventListener("fileToReference", handleFileToReference);
            window.removeEventListener("fileToOutput", handleFileToOutput);
        };
    }, []);

    /**************************************************************************************************************
     * Save the file paths and view settings to localStorage whenever they change, so that they can be 
     * restored on page reload.
     **************************************************************************************************************/
    useEffect(() => {
        localStorage.setItem(`Renderer:filePath:src`, JSON.stringify(area1File));
        localStorage.setItem(`Renderer:filePath:ref`, JSON.stringify(area2File));
        localStorage.setItem(`Renderer:filePath:out`, JSON.stringify(areaOutFile));
        localStorage.setItem('View:LeftWidth', JSON.stringify(leftWidth));
        localStorage.setItem('View:TopHeight', JSON.stringify(topHeight));
        localStorage.setItem('View:ShowTop', JSON.stringify(showTop));
        localStorage.setItem('View:ShowBottom', JSON.stringify(showBottom));
        localStorage.setItem('View:ShowRight', JSON.stringify(showRight));
    }, [leftWidth, topHeight, showTop, showBottom, showRight, area1File, area2File, areaOutFile]);

    /**************************************************************************************************************
     * Dispatch a custom event to the histogram component when the active mobile view changes.
     **************************************************************************************************************/
    useEffect(() => {
        if (!isMobile) return;

        const map = {
            top: "src",
            bottom: "ref",
            right: "out",
        };
        const slot = map[activeMobile];
        if (!slot) return;

        window.dispatchEvent(
            new CustomEvent("histogram:active", {
                detail: { slot }, // "src" | "ref" | "out"
            })
        );
    }, [activeMobile, isMobile]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Mouse move handler for chaning the widths and heights of the renderers.
     **************************************************************************************************************/
    const handleMouseMove = (e) => {
        if (drag.current.horizontal) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const containerWidth = rect.width;

            const MIN_RIGHT = showRight ? 200 : 0;
            const localX = e.clientX - rect.left;

            const newWidth = Math.max(150, Math.min(localX, containerWidth - MIN_RIGHT - 10));

            setLeftWidth(newWidth);
        }
        if (drag.current.vertical) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const viewHeaderHeight = 27;
            const containerHeight = rect.height - viewHeaderHeight;
            const offsetY = e.clientY - rect.top - viewHeaderHeight;

            let newTopPercent = (offsetY / containerHeight) * 100;
            newTopPercent = Math.max(10, Math.min(90, newTopPercent));
            setTopHeight(newTopPercent);
        }
    };

    /**************************************************************************************************************
     * Mouse up and mouse leave handler for stopping the size chaning of the renderers.
     **************************************************************************************************************/
    const stopDragging = () => {
        drag.current.horizontal = false;
        drag.current.vertical = false;
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <Box
            className="view"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            style={{display: isUserStudyOpen ? "none" : ""}}
        >
            <ViewHeader viewButtons={viewButtons} setActiveDownload={setActiveDownload} setActiveMobile={setActiveMobile}/>

            {/* MAIN AREA */}
            <Box className="view-main">
                {/* LEFT SIDE (SRC/REF stay mounted) */}
                <Box
                    className={`view-left`}
                    style={{
                        display: isLeftVisible ? "block" : "none",
                        width: isMobile ? "100%" : showRight ? leftWidth + "px" : "100%",
                        height: isMobile
                            ? (activeMobile === "top" || activeMobile === "bottom" ? "100%" : "0px")
                            : undefined,
                        flexGrow: isMobile ? 0 : showRight ? 0 : 1,
                    }}
                >
                    {/* TOP (SRC) */}
                    <Box
                        className="view_left_top"
                        style={
                            isMobile
                                ? {
                                      display: activeMobile === "top" ? "block" : "none",
                                      width: "100%",
                                      height: "100%",
                                  }
                                : showTop
                                ? // Desktop: Top visible
                                  showBottom
                                    ? {
                                          // Top + Bottom active → Top gets topHeight%
                                          display: "block",
                                          height: `${topHeight}%`,
                                          width: "100%",
                                          visibility: "visible",
                                      }
                                    : {
                                          // Only top is active → full height
                                          display: "block",
                                          height: "100%",
                                          width: "100%",
                                          visibility: "visible",
                                      }
                                : {
                                      // Top hidden
                                      display: "none",
                                      width: "100%",
                                  }
                        }
                    >
                        <div
                            className={isDraggingOverArea1 ? "drop_highlight" : ""}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={() => setDraggingOverArea1(true)}
                            onDragLeave={() => setDraggingOverArea1(false)}
                            onDrop={(e) => {
                                const file = e.dataTransfer.getData("text/plain");
                                setArea1File(file);
                                setDraggingOverArea1(false);
                            }}
                            style={{ width: "100%", height: "100%" }}
                        >
                            <Renderer
                                title="Source"
                                rid="src"
                                filePath={area1File}
                                setSettings={setSettings}
                                setMeshTexture={setMeshTexture}
                                activeDownload={activeDownload.src}
                                setActiveDownload={(value) => setActiveDownload((prev) => ({ ...prev, src: value }))}
                            />
                        </div>
                    </Box>

                    {/* vertical resizer left:
                    only desktop AND only if both Top and Bottom are visible */}
                    {!isMobile && showTop && showBottom && (
                        <Box
                            className="view_left_vertical_resizer"
                            onMouseDown={() => (drag.current.vertical = true)}
                        />
                    )}

                    {/* BOTTOM (REF) */}
                    <Box
                        className="view_left_bottom"
                        style={
                            isMobile
                                ? {
                                      display: activeMobile === "bottom" ? "block" : "none",
                                      width: "100%",
                                      height: "100%",
                                  }
                                : showBottom
                                ? // Desktop: Bottom visible
                                  showTop
                                    ? {
                                          // Top + Bottom active → Bottom gets the rest
                                          display: "block",
                                          height: `${100 - topHeight}%`,
                                          width: "100%",
                                          visibility: "visible",
                                      }
                                    : {
                                          // Only Bottom active → full height
                                          display: "block",
                                          height: "100%",
                                          width: "100%",
                                          visibility: "visible",
                                      }
                                : {
                                      // Bottom hidden
                                      display: "none",
                                      width: "100%",
                                  }
                        }
                    >
                        <div
                            className={isDraggingOverArea2 ? "drop_highlight" : ""}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={() => setDraggingOverArea2(true)}
                            onDragLeave={() => setDraggingOverArea2(false)}
                            onDrop={(e) => {
                                const file = e.dataTransfer.getData("text/plain");
                                setArea2File(file);
                                setDraggingOverArea2(false);
                            }}
                            style={{ width: "100%", height: "100%" }}
                        >
                            <Renderer
                                title="Reference"
                                rid="ref"
                                filePath={area2File}
                                setSettings={setSettings}
                                setMeshTexture={setMeshTexture}
                                activeDownload={activeDownload.ref}
                                setActiveDownload={(value) => setActiveDownload((prev) => ({ ...prev, ref: value }))}
                            />
                        </div>
                    </Box>
                </Box>

                {/* HORIZONTAL RESIZE HANDLE (Desktop only, as long as at least one left View is visible) */}
                {!isMobile && (showTop || showBottom) && (
                    <Box
                        onMouseDown={() => (drag.current.horizontal = true)}
                        className="view_middle_resizer"
                    />
                )}

                {/* RIGHT SIDE (OUT, now also via Drag&Drop) */}
                <Box
                    className="view_right"
                    style={{
                        display: isRightActive ? "block" : "none",
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                    }}
                >
                    <div
                        className={isDraggingOverAreaOut ? "drop_highlight" : ""}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={() => setDraggingOverAreaOut(true)}
                        onDragLeave={() => setDraggingOverAreaOut(false)}
                        onDrop={(e) => {
                            const file = e.dataTransfer.getData("text/plain");
                            setAreaOutFile(file);
                            setDraggingOverAreaOut(false);
                        }}
                        style={{ width: "100%", height: "100%" }}
                    >
                        <Renderer
                            title="Output"
                            rid="out"
                            filePath={areaOutFile}
                            setSettings={setSettings}
                            setMeshTexture={setMeshTexture}
                            outputModifications={outputModifications}
                            semanticMaps={semanticMaps}
                            activeDownload={activeDownload.out}
                            setActiveDownload={(value) => setActiveDownload((prev) => ({ ...prev, out: value }))}
                        />
                    </div>
                </Box>
            </Box>
        </Box>
    );
}