/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./TestSetFileNode.scss"
import { useWebRTC } from '@/Utils/WebRTCProvider';
import CancelIcon from '@mui/icons-material/Cancel';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Single file or folder element within the FileTree.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function TestSetFileNode({node}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc} = useWebRTC();


    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Removes the test set from the compute node and updates the file tree.
     **************************************************************************************************************/
    function handlerRemoveTestSet(folderName) {
        const data_send = {
            command: "/deleteTestSetRequest",
            data: {
                testtype: "Likert", 
                dataset_name: "TestDataset1",
                set_name: folderName
            }
        };

        console.debug("SEND", `[COMPUTE NODE] Request to delete test set via command /deleteTestSet`, data_send);
        rtc.sendMessage(JSON.stringify(data_send));
    }

    /**************************************************************************************************************
     * Request images from the selected test set and show them in the viewer.
     **************************************************************************************************************/    
    const handlerShowTestSet = (name) => {
        console.log("Show test set:", name)

       const data_send = {
            command: "/getTestSetResultsRequest",
            data: {
                set_name: name
            }
        };

        console.debug("SEND", `[COMPUTE NODE] Request to get test set results via command /getTestSetResultsRequest`, data_send);
        rtc.sendMessage(JSON.stringify(data_send));
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="testsetfile">
            <div className="testsetfile-container">
                <div
                    className={`testsetfile-label`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlerShowTestSet(node.name);
                    }}
                >
                    <span className="testsetfile-icon">🗂️</span>
                    {node.name}
                </div>
                <CancelIcon className="testsetfile-cancel" onClick={() => handlerRemoveTestSet(node.name)} />
            </div>
        </div>
    );
};