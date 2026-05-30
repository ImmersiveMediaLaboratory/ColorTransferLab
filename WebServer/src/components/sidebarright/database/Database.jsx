/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./Database.scss";
import StorageIcon from '@mui/icons-material/Storage';
import LibraryAddOutlinedIcon from '@mui/icons-material/LibraryAddOutlined';
import {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import FileTree from '../elements/FileTree'; 
import {useWebRTC} from '@/Utils/WebRTCProvider';
import Searchbar from "../elements/Searchbar";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Visualize a right sidebar with searchbar, an add button and a content area for a file tree.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Database({isUserStudyOpen}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [database, setDatabase] = useState([]);
    const [search, setSearch] = useState("");

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc, dataChannelOpen} = useWebRTC();
    const filteredDatabase = filterTree(database, search);
    // All folders will be expanded when a search text is entered
    const expandAll = !!search;

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Listen for incoming database structure data from the compute node and update the state accordingly.
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onDatabaseStructureRequest = (data) => {
            setDatabase(data);
            console.debug("RECV", "[Compute Node] Database data received: ", data);
        };
    }, [rtc]);

    /**************************************************************************************************************
     * Request the database structure from the compute node.
     **************************************************************************************************************/
    useEffect(() => {
        if (dataChannelOpen === true) {
            const data_send = {
                command: "/getDatabaseStructureRequest",
                data: ""
            };
            console.debug("SEND", "[Compute Node] Request database via command: /getDatabaseStructureRequest");
            rtc.sendMessage(JSON.stringify(data_send));
        }
    }, [dataChannelOpen]);
    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Allows the upload of local images and point clouds.
     * The items can be accessed via the <Uploads> button within the <DATABASE> window.
     **************************************************************************************************************/
    function chooseFile() {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = _this => {
                let files =   Array.from(input.files);

                files.forEach(file => {
                    let reader = new FileReader();

                    reader.onload = function(e) {
                        let arrayBuffer = e.target.result;

                        console.debug("SEND", "Upload file via commands /upload_start and /upload_end: ", file.name);
 
                        rtc.sendMessage(JSON.stringify({"command": "/upload_start", "data": file.name}))
                        rtc.sendMessage(arrayBuffer, true)
                        rtc.sendMessage(JSON.stringify({"command": "/upload_end", "data": ""}))
                    };
            
                    reader.readAsArrayBuffer(file);
                });
            };
        input.click();
    }

    /**************************************************************************************************************
     * Handle the click on the add button, which allows the upload of local files to the compute node.
     **************************************************************************************************************/
    const handleAddButtonClick = () => {
        console.debug("INFO", "File adding requested. Note that uploaded files can be accessed from the Uploads folder.");
        chooseFile()
    };

    /**************************************************************************************************************
     * Filters recursively the file tree using the text from the search bar
     **************************************************************************************************************/
    function filterTree(tree, query) {
        if (!query) return tree;
        const q = query.toLowerCase();

        function filterNode(node) {
            if (Array.isArray(node)) {
                const filtered = node
                    .map(filterNode)
                    .filter(Boolean);
                return filtered.length > 0 ? filtered : null;
            }
            if (typeof node === "object" && node !== null) {
                if (node.name && (node.folders || node.files)) {
                    const filteredFolders = Array.isArray(node.folders)
                        ? node.folders.map(filterNode).filter(Boolean)
                        : [];
                    const filteredFiles = Array.isArray(node.files)
                        ? node.files
                            .filter(f => typeof f === "string" && f.toLowerCase().includes(q))
                            .map(f => ({ name: f, isFile: true }))
                        : [];
                    if (
                        node.name.toLowerCase().includes(q) ||
                        filteredFolders.length > 0 ||
                        filteredFiles.length > 0
                    ) {
                        return {
                            ...node,
                            folders: filteredFolders,
                            files: filteredFiles.map(f => f.name)
                        };
                    }
                    return null;
                }
                if (node.name && node.name.toLowerCase().includes(q)) {
                    return node;
                }
            }
            return null;
        }

        if (Array.isArray(tree)) {
            return tree.map(filterNode).filter(Boolean);
        }
        return filterNode(tree);
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <Box className="database" style={{display: isUserStudyOpen ? "none" : ""}}>
            <div className="database-title">
                <StorageIcon className="database-icon"/>
                <span>DATABASE</span>
                <div className="database-add-button" onClick={handleAddButtonClick}>
                    <LibraryAddOutlinedIcon className="database-add-icon"/>
                </div>
            </div>

            <Searchbar search={search} setSearch={setSearch}/>
            <FileTree data={filteredDatabase} expandAll={expandAll} />
        </Box>
    );
}