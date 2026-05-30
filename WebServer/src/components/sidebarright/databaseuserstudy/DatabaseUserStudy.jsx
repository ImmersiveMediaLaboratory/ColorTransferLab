/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./DatabaseUserStudy.scss";
import StorageIcon from '@mui/icons-material/Storage';
import DatabaseUserStudyFileTree from '@/components/sidebarright/databaseuserstudy/DatabaseUserStudyFileTree'; 
import Searchbar from "@/components/sidebarright/elements/Searchbar";
import {useWebRTC} from '@/Utils/WebRTCProvider';
import {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import {useSelectionUserStudy} from "@/contexts/SelectionContextUserStudy";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Visualize a right sidebar with searchbar and a content area for a file tree. This component is used for the 
 ** user study to display the database structure provided by the compute node.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function DatabaseUserStudy({isUserStudyOpen, rightTopHeight}) {
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
    let filteredDatabase = filterTree(database, search);
    const expandAll = !!search;
    const { setSelectedUserStudyDatabaseStructure } = useSelectionUserStudy();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Listens for incoming database structure data from the compute node and updates the state accordingly.
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onUserStudyDatabaseStructureRequest = (data) => {
            setSelectedUserStudyDatabaseStructure(data);
            setDatabase(data);
            console.debug("RECV", "[Compute Node] User Study Database data received: ", data);
        };
    }, [rtc]);

    /**************************************************************************************************************
     * Sends a request to the compute node to fetch the user study database structure.
     **************************************************************************************************************/
    useEffect(() => {
        if (dataChannelOpen) {
            const data_send = {
                command: "/getUserStudyDatabaseStructureRequest",
                data: ""
            };

            console.debug("SEND", "[COMPUTE NODE] Request to apply User Study databases via command /getUserStudyDatabaseStructureRequest", data_send);
            rtc.sendMessage(JSON.stringify(data_send));
        }
    }, [dataChannelOpen]);

    /**************************************************************************************************************
     * Filters the database structure again when the search term changes to update the file tree accordingly.
     **************************************************************************************************************/
    useEffect(() => {
        filteredDatabase = filterTree(database, search);
    }, [search]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Request the files for the test folder when it is clicked.
     **************************************************************************************************************/
    function handleTestFolderClick(folderId) {
        const testData = {
            src: ["/getUserStudyFileRequest", "png"],
            ref: ["/getUserStudyFileRequest", "png"],
            out: ["/getUserStudyFileRequest", "png"],
            meta: ["/getUserStudyMetaRequest", "json"]
        }

        Object.entries(testData).forEach(([key, command]) => {
            let data_send = {
                "command": command[0],
                "data": {
                    "rid": key,
                    "abstractPath": `${folderId}/${key}.${command[1]}`,
                    "mode": "userstudy"
                }
            }

            console.debug("SEND", `[Compute Node] Request File via command ${command[0]}`, data_send)
            rtc.sendMessage(JSON.stringify(data_send))
        })
    }

    /**************************************************************************************************************
     * Filters recursively the file tree using the text from the search bar
     **************************************************************************************************************/
    function filterTree(tree, query) {
        const prune = (n, d, q, path = "") => {
            if (!n || typeof n !== "object" || !n.name) return null;
            const currentPath = path ? `${path}/${n.name}` : n.name;
            const nameMatch = !q || n.name.toLowerCase().includes(q);
            if (d === 0) {
                // Path without root element
                const pathWithoutRoot = currentPath.split('/').slice(1).join('/');
                return nameMatch
                    ? { ...n, files: [], folders: [], isUserStudyTestFolder: true, onClick: () => handleTestFolderClick(pathWithoutRoot) }
                    : null;
            }
            const folders = (n.folders || []).map(f => prune(f, d - 1, q, currentPath)).filter(Boolean);
            if (nameMatch || folders.length) {
                return { ...n, files: [], folders };
            }
            return null;
        };
        const arr = Array.isArray(tree) ? tree : [tree];
        const q = query ? query.toLowerCase() : null;
        return arr.map(n => prune(n, 2, q)).filter(Boolean);
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <Box className="databaseuserstudy" style={{display: !isUserStudyOpen ? "none" : ""}} sx={{ height: rightTopHeight + "px"}}>
            <div className="databaseuserstudy-title">
                <StorageIcon className="database-icon"/>
                <span>DATABASE</span>
            </div>

            <Searchbar search={search} setSearch={setSearch}/>
            <DatabaseUserStudyFileTree data={filteredDatabase} expandAll={expandAll} />
        </Box>
    );
}