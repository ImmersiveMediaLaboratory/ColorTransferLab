/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./FileNode.scss"
import CloudIcon from '@mui/icons-material/Cloud';
import ImageIcon from '@mui/icons-material/Image';
import GridOnIcon from '@mui/icons-material/GridOn';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import AppsIcon from '@mui/icons-material/Apps';
import FolderIcon from '@mui/icons-material/Folder';
import AnimationIcon from '@mui/icons-material/Animation';
import DensitySmallIcon from '@mui/icons-material/DensitySmall';
import { useState, useEffect } from "react";
import {getInitialValue} from '@/Utils/Utils';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Single file or folder element within the FileTree.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function FileNode({node, parentPath = "", expandAll, isHiddenName}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    function hashCode(obj) {
        const str = JSON.stringify(obj, Object.keys(obj).sort());
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0; // 32bit int
        }
        return Math.abs(hash);
    }

    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    // const [expanded, setExpanded] = useState(expandAll);
    const [idx, setIdx] = useState(hashCode(node));
    const [expanded, setExpanded] = useState(getInitialValue(`FileNode:${idx}`) ?? false);
    const [dragging, setDragging] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    // node.files: list of filenames (strings) for this folder
    const fileChildren = (node.files || [])
        // .filter((f) => !isHiddenName(f))
        .map((f) => ({
            name: f,
            isFile: true,
        }));

    const folderChildren = (node.folders || []).filter((f) => !isHiddenName(f.name));

    const isFile = node.isFile === true;
    const hasChildren =
        !isFile &&
        (
            (Array.isArray(node.folders) && node.folders.length > 0) ||
            (Array.isArray(node.files) && node.files.length > 0)
        );

    const children = isFile ? [] : [...folderChildren, ...fileChildren];

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Adopt the expandAll state from the FileTree component
     **************************************************************************************************************/
    useEffect(() => {
        expandAll ? setExpanded(expandAll) : setExpanded(getInitialValue(`FileNode:${idx}`) ?? false);
    }, [expandAll]);

    useEffect(() => {
        localStorage.setItem(`FileNode:${idx}`, JSON.stringify(expanded));
    }, [idx]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Expands folders.
     **************************************************************************************************************/    
    const toggle = () => {
        if (!isFile) {
            setExpanded(!expanded);
            localStorage.setItem(`FileNode:${idx}`, JSON.stringify(!expanded));
        }
    };

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/  
    const getFileIcon = (name) => {
        const ext = name.split(".").pop().toLowerCase();
        switch (ext) {
            case "png":
            case "jpg":
            case "jpeg":
                return <ImageIcon />;
            case "exr":
                return <DensitySmallIcon />;
            case "mesh":
                return <GridOnIcon />;
            case "splat":
            case "ksplat":
                return <ScatterPlotIcon />;
            case "mp4":
            case "mov":
                return <VideoCameraBackIcon />;
            case "ply":
                return <CloudIcon />;
            case "lf":
            case "lfd":
                return <AppsIcon />;
            case "volu":
                return <AnimationIcon />;
            default:
                return <BrokenImageIcon />;
        }
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="file-node" onClick={() => setShowMenu(false)}>
            <div
                className={`file-label ${dragging ? "file-dragging" : ""}`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (isFile) {
                        window.dispatchEvent(new CustomEvent("closeAllFileMenus"));
                        setMenuPos({ x: e.clientX, y: e.clientY });
                        setShowMenu(true);

                        // Close menu when clicking outside
                        const closeMenu = () => {
                            setShowMenu(false);
                            window.removeEventListener("click", closeMenu);
                        };
                        window.addEventListener("click", closeMenu);
                    } else {
                        if (node?.isUserStudyTestFolder) {
                            node.onClick();
                        } else {
                            toggle();
                        }
                    }
                }}
                draggable={isFile}
                onDragStart={(e) => {
                    if (isFile) {
                        e.dataTransfer.setData("text/plain", currentPath);
                        setDragging(true);
                        const img = document.createElement("div");
                        img.className = "filenode-drag-icon";
                        img.innerText = node.name;
                        document.body.appendChild(img);
                        e.dataTransfer.setDragImage(img, -10, -10);
                        setTimeout(() => document.body.removeChild(img), 0);
                    }
                }}
                onDragEnd={() => setDragging(false)}
            >
                {isFile ? (
                    <span className="file-icon">{getFileIcon(node.name)}</span>
                ) : (
                    node?.isUserStudyTestFolder ? (
                        node?.isSet ? (
                            <span className="file-icon" >
                                <FolderIcon style={{ color: "#5f70b6" }} />
                            </span>
                        ) : (
                            <span className="file-icon" >
                                <FolderIcon style={{ color: "#4caf50" }} />
                            </span>
                        )
                    ) : (
                        <span className="file-icon">
                            {expanded ? "📂" : "📁"}
                        </span>
                    )
                )}
                {node.name}
            </div>

            {showMenu && isFile && (
                <div
                    className="file-context-menu"
                    style={{ top: menuPos.y, left: menuPos.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="file-context-item"
                        onClick={() => {
                            console.debug("INFO", `File ${currentPath} sent to Area 1 (Source)`)
                            const event = new CustomEvent("fileToSource", {
                                detail: currentPath,
                            });
                            window.dispatchEvent(event);
                            setShowMenu(false);
                        }}
                    >
                        Set as Source
                    </div>
                    <div
                        className="file-context-item"
                        onClick={() => {
                            const event = new CustomEvent("fileToReference", {
                                detail: currentPath,
                            });
                            window.dispatchEvent(event);
                            setShowMenu(false);
                        }}
                    >
                        Set as Reference
                    </div>
                    <div
                        className="file-context-item"
                        onClick={() => {
                            const event = new CustomEvent("fileToOutput", {
                                detail: currentPath,
                            });
                            window.dispatchEvent(event);
                            setShowMenu(false);
                        }}
                    >
                        Set as Output
                    </div>
                </div>
            )}

            {expanded && !isFile && hasChildren && (
                <div className="file-children">
                    {children.map((child, idx) => (
                        <FileNode key={idx} node={child} parentPath={currentPath} expandAll={expandAll} />
                    ))}
                </div>
            )}
        </div>
    );
};