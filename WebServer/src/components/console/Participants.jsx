/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Participants.scss';
import {useEffect, useState} from 'react';
import { useWebRTC } from '@/Utils/WebRTCProvider';
import { useSelection } from "@/contexts/SelectionContext";
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PendingIcon from '@mui/icons-material/Pending';
import {useSelectionUserStudy} from "@/contexts/SelectionContextUserStudy";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {useWarning} from "@/contexts/WarningContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** This component displays the participants of the user study in a table and allows to add or remove participants.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Participants({activeTab}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [participants, setParticipants] = useState([]);
    const [newParticipant, setNewParticipant] = useState({
        worker_id: null,
        age: null,
        gender: null,
        nationality: null,
        vision: null,
        start_time: null,
        end_time: null,
        completion_code: null,
        test_type: null,
        test_link: null,
        test_number: null,
        valid: true
    });

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc, dataChannelOpen} = useWebRTC();
    const { contextConnectedNodes } = useSelection();
    const { selectedTestSets } = useSelectionUserStudy();
    const { showWarning, showInfo } = useWarning();
    const headerValC = ["", "ID", "Worker ID", "Completion Code", "Gender", "Age", "Nationality", "Vision Impairment", "Start", "End", "Duration", "Link", "Test Type", "#", "Action"];
    //const testTypes = ["rating", "comparison", "ranking"];
    const testTypes = ["rating"];

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Listens for incoming messages regarding participants data and updates the state accordingly
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onPutParticipantRequest = rtc.onDeleteParticipantRequest = rtc.onGetParticipantsRequest = (data) => {
            if (data.status === "success") {
                setParticipants(data.content);
                console.debug("RECV", "[Compute Node] User Study Participants data received: ", data.content);
            } else {
                console.debug("WARN", "Failed to retrieve participants:", data.message);
                showInfo(data.message);
            }
        };
    }, [rtc]);

    /**************************************************************************************************************
     * Sends a request to the backend to retrieve the list of participants
     **************************************************************************************************************/
    useEffect(() => {
        if (dataChannelOpen) {
            const data_send = {
                command: "/getParticipantsRequest",
                data: ""
            };

            console.debug("SEND", "[COMPUTE NODE] Request to apply User Study participants via command /getParticipantsRequest", data_send);
            rtc.sendMessage(JSON.stringify(data_send));
        }
    }, [dataChannelOpen]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Generates a random string of a given length, consisting of uppercase letters, lowercase letters, and digits
     **************************************************************************************************************/
    function generateRandomString(length = 8) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomString += characters[randomIndex];
        }

        return randomString;
    }

    /**************************************************************************************************************
     * Handles the removal of a metric when the corresponding button is clicked
     **************************************************************************************************************/
    async function handleParticipantButtonRemove(participant) {
        const result = await showWarning("Do you really want to remove this participant?");
        if(result === "continue") {
            const data_send = {
                command: "/deleteParticipantRequest",
                data: participant
            };

            console.debug("SEND", `[COMPUTE NODE] Request removal of participant: ${participant.id} via command /deleteParticipantRequest`, data_send);
            rtc.sendMessage(JSON.stringify(data_send));
        }
    }

    /**************************************************************************************************************
     * Handles the addition of a new participant when the corresponding button is clicked
     **************************************************************************************************************/
    async function handleParticipantButtonAdd() {
        if (!newParticipant.test_type || !newParticipant.test_number) {
            await showInfo("Cannot add participant. Please fill in Test Type and # fields.");
            console.debug("WARN", "Cannot add participant. Please fill in Test Type and # fields.");
            return;
        }

        // generate a random completion code
        newParticipant.completion_code = generateRandomString();
        newParticipant.test_link = generateRandomString(20);

        const data_send = {
            command: "/putParticipantRequest",
            data: newParticipant
        };
        console.debug("SEND", `[COMPUTE NODE] Request addition of new participant: ${newParticipant.worker_id} via command /putParticipantRequest`, data_send);
        rtc.sendMessage(JSON.stringify(data_send));
    }

    /**************************************************************************************************************
     * Calculation of the duration between two timestamps
     **************************************************************************************************************/
    const getDuration = (start, end) => {
        if (!start || !end) return "Null";
        const startDate = new Date(start);
        const endDate = new Date(end);

        const diffMs = endDate - startDate;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffSeconds = Math.floor((diffMs % 60000) / 1000);

        return `${diffMinutes} min ${diffSeconds} sec`;
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className='participants' style={{ display: activeTab === "participants" ? "block" : "none"}}>
            <div className="participants-content">
                <table className="participants-table">
                    <thead>
                        <tr>
                            {headerValC.map((h, idx) => (
                                <th key={idx} className="participants-cell-config">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map((participant, idx) => (
                            <tr key={idx}>
                                <td className={`participants-cell-config center ${participant.valid ? "yellow" : "green"}`}>
                                    {participant.valid ? 
                                        <PendingIcon titleAccess='Pending'/> 
                                        : 
                                        <CheckCircleIcon titleAccess='Submitted'/>
                                    }
                                </td>
                                <td className={`participants-cell-config${(participant.id == null) ? " yellow" : ""}`}>{participant.id ?? "Null"}</td>
                                <td className={`participants-cell-config${(participant.worker_id == null) ? " yellow" : ""}`}>{participant.worker_id ?? "Null"}</td>
                                <td className={`participants-cell-config${(participant.completion_code == null) ? " yellow" : ""}`}>{participant.completion_code ?? "Null"}</td>
                                <td className={`participants-cell-config${(participant.gender == null) ? " yellow" : ""}`}>{participant.gender ?? "Null"}</td>
                                <td className={`participants-cell-config${(participant.age == null) ? " yellow" : ""}`}>{participant.age ?? "Null"}</td>
                                <td className={`participants-cell-config${(participant.nationality == null) ? " yellow" : ""}`}>{participant.nationality ?? "Null"}</td>
                                <td className={`participants-cell-config${(participant.vision == null) ? " yellow" : ""}`}>{participant.vision ?? "Null"}</td>
                                <td className={`participants-cell-config${(participant.start_time == null) ? " yellow" : ""}`}>{participant.start_time?.split('.')[0].replace('T', ' ') ?? "Null"}</td>
                                <td className={`participants-cell-config${(participant.end_time == null) ? " yellow" : ""}`}>{participant.end_time?.split('.')[0].replace('T', ' ') ?? "Null"}</td>
                                <td className={`participants-cell-config${(participant.end_time == null || participant.start_time == null) ? " yellow" : ""}`}>{getDuration(participant.start_time, participant.end_time)}</td>
                                <td className="participants-cell-config link">
                                    {participant.test_link
                                        ? <a href={`${window.location.origin}/ColorTransferLab/colortransfereval?sid=${contextConnectedNodes}&id=${participant.test_link}`} target={`${window.location.origin}/ColorTransferLab/colortransfereval?sid=${contextConnectedNodes}&id=${participant.test_link}`} rel="noopener noreferrer">Link</a>
                                        : "Null"}
                                </td>
                                <td className="participants-cell-config">{participant.test_type ?? "Null"}</td>
                                <td className="participants-cell-config">{participant.test_number ?? "Null"}</td>
                                <td className="participants-cell-config center red">
                                    <CancelIcon className="participants-icon" onClick={() => handleParticipantButtonRemove(participant)} titleAccess='Remove participant'/>
                                    {/* <button onClick={() => handleParticipantButtonClick(participant)}>Aktion</button> */}
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td className="participants-cell-config">
                            </td>
                            <td className="participants-cell-config new">
                                ID
                            </td>
                            <td className="participants-cell-config new">
                                Worker ID
                            </td>
                            <td className="participants-cell-config new">
                                Completion Code
                            </td>
                            <td className="participants-cell-config new">
                                Gender
                            </td>
                            <td className="participants-cell-config new">
                                Age
                            </td>
                            <td className="participants-cell-config new">
                                Nationality
                            </td>
                            <td className="participants-cell-config new">
                                Vision Impairment
                            </td>
                            <td className="participants-cell-config new">
                                Start
                            </td>
                            <td className="participants-cell-config new">
                                End
                            </td>
                            <td className="participants-cell-config new">
                                Duration
                            </td>
                            <td className="participants-cell-config new">
                                Link
                            </td>
                            <td className="participants-cell-config">
                                <select
                                    value={newParticipant.test_type || ""}
                                    onChange={e => setNewParticipant(p => ({ ...p, test_type: e.target.value }))}
                                >
                                    <option value="">Select Test Type</option>
                                    {testTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="participants-cell-config">
                                <select
                                    value={newParticipant.test_number || ""}
                                    onChange={e => setNewParticipant(p => ({ ...p, test_number: e.target.value }))}
                                >
                                    <option value="">Select Test Set</option>
                                    {selectedTestSets.rating?.[0].folders.map((set, index) => (
                                        <option key={index} value={set.name}>{set.name}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="participants-cell-config center green">
                                <AddCircleIcon className="participants-icon" onClick={handleParticipantButtonAdd} titleAccess='Add participant'/>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}