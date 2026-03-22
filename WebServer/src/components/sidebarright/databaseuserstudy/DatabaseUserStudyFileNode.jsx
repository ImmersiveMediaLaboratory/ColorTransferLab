/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./DatabaseUserStudyFileNode.scss"
import FolderIcon from '@mui/icons-material/Folder';
import { useState, useEffect } from "react";
import {getInitialValue} from '@/Utils/Utils';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Single file or folder element within the FileTree.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function DatabaseUserStudyFileNode({node, parentPath = "", expandAll, isHiddenName}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [idx, setIdx] = useState(hashCode(node));
    const [expanded, setExpanded] = useState(getInitialValue(`FileNode:${idx}`) ?? false);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    // node.files: list of filenames (strings) for this folder
    const fileChildren = (node.files || [])
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

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
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
    function hashCode(obj) {
        const str = JSON.stringify(obj, Object.keys(obj).sort()); // sortiert für Konsistenz
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0; // 32bit int
        }
        return Math.abs(hash);
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="databaseuserstudyfilenode">
            <div
                className={`databaseuserstudyfilenode-label`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (node?.isUserStudyTestFolder) {
                        node.onClick();
                    } else {
                        toggle();
                    }
                }}
            >
                {node?.isUserStudyTestFolder ? (
                    node?.isSet ? (
                        <span className="databaseuserstudyfilenode-icon" >
                            <FolderIcon style={{ color: "#5f70b6" }} />
                        </span>
                    ) : (
                        <span className="databaseuserstudyfilenode-icon" >
                            <FolderIcon style={{ color: "#4caf50" }} />
                        </span>
                    )
                ) : (
                    <span className="databaseuserstudyfilenode-icon">
                        {expanded ? "📂" : "📁"}
                    </span>
                )}
                {node.name}
            </div>

            {expanded && !isFile && hasChildren && (
                <div className="databaseuserstudyfilenode-children">
                    {children.map((child, idx) => (
                        <DatabaseUserStudyFileNode key={idx} node={child} parentPath={currentPath} expandAll={expandAll} />
                    ))}
                </div>
            )}
        </div>
    );
};