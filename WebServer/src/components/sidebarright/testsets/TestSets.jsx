/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./TestSets.scss";
import { useEffect, useState } from "react";
import { useWebRTC } from '@/Utils/WebRTCProvider';
import Box from "@mui/material/Box";
import StorageIcon from '@mui/icons-material/Storage';
import TestSetFileTree from '@/components/sidebarright/testsets/TestSetFileTree'; 
import {useSelectionUserStudy} from "@/contexts/SelectionContextUserStudy";
import LibraryAddOutlinedIcon from '@mui/icons-material/LibraryAddOutlined';
import {useWarning} from "@/contexts/WarningContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Visualize a right sidebar with an add button and a content area for a file tree of test sets.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function TestSets({isUserStudyOpen}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [testSets, setTestSets] = useState([]);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc, dataChannelOpen} = useWebRTC();
    const { showInfo } = useWarning();
    const { selectedTestType, selectedUserStudyDatabaseStructure, setSelectedTestSets, selectedSettings } = useSelectionUserStudy();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Sets the test sets received from the compute node.
     **************************************************************************************************************/ 
    useEffect(() => {
        rtc.onGetTestSetsRequest = rtc.onPutTestSetsRequest = rtc.onDeleteTestSetRequest = (data) => {
            if (data.status === "success") {
                setTestSets(data.content);
                setSelectedTestSets(prev => ({...prev, ["rating"]: data.content}));
                console.debug("RECV", "[Compute Node] Test Sets data received: ", data);
            } else {
                console.debug("WARN", "Failed to retrieve test sets:", data.message);
                showInfo(data.message);
            }
        };
    }, [rtc]);

    /**************************************************************************************************************
     * Request the test sets from the compute node.
     **************************************************************************************************************/ 
    useEffect(() => {
        if (dataChannelOpen) {
            let data_send = {
                command: "/getTestSetsRequest",
                data: ""
            };

            console.debug("SEND", "[COMPUTE NODE] Request to apply User Study test sets via command /getTestSets", data_send);
            rtc.sendMessage(JSON.stringify(data_send));
        }
    }, [dataChannelOpen]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Add a new test set with randomly selected items from the selected database folder.
     **************************************************************************************************************/
    const handleAddButtonClick = () => {
        const folderName = selectedSettings.rating?.databaseFolder;

        if (!folderName) {
            console.debug("WARN", "Cannot add test set. No database folder selected.");
            showInfo("Cannot add test set. No database folder selected.");
            return;
        }

        const testDatasetFolders =
            selectedUserStudyDatabaseStructure?.[0]?.folders?.find(f => f.name === folderName)?.folders || [];

        const itemsPerSet = selectedSettings.rating?.num || 10;

        const shuffled = testDatasetFolders.sort(() => 0.5 - Math.random());
        const nextFolders = shuffled.slice(0, itemsPerSet).map(folder => ({
            ...folder,
            isSet: true,
        }));

        // Get the highest test set number
        const existingNames = testSets[0]?.folders?.map(f => f.name) || [];
        const maxNum = existingNames
            .map(name => {
                const match = name.match(/Test Set: (\d+)/);
                return match ? parseInt(match[1], 10) : 0;
            })
            .reduce((a, b) => Math.max(a, b), 0);

        const newFolder = {
            name: `Test Set: ${maxNum + 1}`,
            files: [],
            folders: nextFolders
        };

        const data_send = {
            command: "/putTestSetsRequest",
            data: {
                testtype: "Likert", 
                dataset_name: folderName,
                set_name: newFolder.name,
                set_items: nextFolders
            }
        };

        console.debug("SEND", `[COMPUTE NODE] Request to update test sets via command /putTestSetsRequest`, data_send);
        rtc.sendMessage(JSON.stringify(data_send));
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <Box className="testsets" style={{display: !isUserStudyOpen ? "none" : ""}}>
            <div className="testsets-title">
                <StorageIcon className="testsets-icon"/>
                <span>TEST SETS</span>
                <div className="testsets-add-button" onClick={handleAddButtonClick}>
                    <LibraryAddOutlinedIcon className="testsets-add-icon"/>
                </div>
            </div>
            <TestSetFileTree data={testSets}/>
        </Box>
    );
}