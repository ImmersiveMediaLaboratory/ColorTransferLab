/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./TurnServer.scss";
import {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import PublicTwoToneIcon from '@mui/icons-material/PublicTwoTone';
import PublicOffTwoToneIcon from '@mui/icons-material/PublicOffTwoTone';
import CloseIcon from '@mui/icons-material/Close';
import DnsIcon from '@mui/icons-material/Dns';
import {useWebRTC} from '@/Utils/WebRTCProvider';
import config from "@/config.json"
import {useSelection} from "@/contexts/SelectionContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Shows available Compute Nodes and allows to connect to them by creating a WebRTC offer. 
 ** Also allows to disconnect from the currently connected Compute Node.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function TurnServer({leftBottomHeight}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [turnAddress, setTurnAddress] = useState(config.turn_name ?? "");
    const [turnUser, setTurnUser] = useState(config.turn_user ?? "");
    const [password, setPassword] = useState(config.turn_pw ?? "");


    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const { setSelectedTurnServer } = useSelection();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Initially set the TURN server information in the global selection context based on the config values.
     **************************************************************************************************************/
    useEffect(() => {
        setSelectedTurnServer({address: turnAddress, user: turnUser, password: password});
    }, []);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Update password state.
     **************************************************************************************************************/
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    /**************************************************************************************************************
     * Sets the selected TURN server information in the global selection context.
     **************************************************************************************************************/
    function handleApply() {
        console.debug("INFO", "Apply TURN settings", {
            turnAddress,
            turnUser,
            password,
        });
        setSelectedTurnServer({address: turnAddress, user: turnUser, password: password});
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <Box className="turnserver" sx={{ height: leftBottomHeight + "px" }}>
            <div className="turnserver_title">
                <DnsIcon className="turnserver-icon"/>
                TURN SERVER
            </div>
            <div className="turnserver_content">
                <div className="turnserver_row">
                    <label htmlFor="turn-address">Address</label>
                    <input
                        id="turn-address"
                        type="text"
                        value={turnAddress}
                        onChange={(e) => setTurnAddress(e.target.value)}
                    />
                </div>

                <div className="turnserver_row">
                    <label htmlFor="turn-user">User</label>
                    <input
                        id="turn-user"
                        type="text"
                        value={turnUser}
                        onChange={(e) => setTurnUser(e.target.value)}
                    />
                </div>

                <div className="turnserver_row">
                    <label htmlFor="turn-password">Password</label>
                    <input
                        id="turn-password"
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </div>

                <button className="turnserver_apply_button" onClick={handleApply}>
                    Apply
                </button>
            </div>
        </Box>
    );
}