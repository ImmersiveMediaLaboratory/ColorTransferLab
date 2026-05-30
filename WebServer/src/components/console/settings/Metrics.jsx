/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Metrics.scss';
import {useEffect, useState} from 'react';
import { useWebRTC } from '@/Utils/WebRTCProvider';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {useWarning} from "@/contexts/WarningContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Metrics tab in the Test Settings, which allows users to define custom metrics for the user study.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Metrics() {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [metrics, setMetrics] = useState([]);
    const [newMetric, setNewMetric] = useState({
        name: "",
        min_label: "",
        max_label: "",
        scale: 5,
        tooltip: ""
    });

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc, dataChannelOpen} = useWebRTC();
    const headerValC = ["Metric", "Lowest Label", "Highest Label", "Scale", "Tooltip", "Action"];
    const { showInfo } = useWarning();

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Set up WebRTC message handlers for receiving metrics data from the compute node.
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onGetMetricsRequest = rtc.onPutMetricRequest = rtc.onDeleteMetricRequest = (data) => {
            setMetrics(data);
            console.debug("RECV", "[Compute Node] User Study Metrics data received: ", data);
        };
    }, [rtc]);
 
    /**************************************************************************************************************
     * Requests the current metrics from the compute node.
     **************************************************************************************************************/
    useEffect(() => {
        if (dataChannelOpen) {
            const data_send = {
                command: "/getMetricsRequest",
                data: ""
            };

            console.debug("SEND", "[COMPUTE NODE] Request to apply User Study metrics via command /getMetricsRequest", data_send);
            rtc.sendMessage(JSON.stringify(data_send));
        }
    }, [dataChannelOpen]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Handles the removal of a metric when the corresponding button is clicked
     **************************************************************************************************************/
    function handleMetricButtonRemove(metric) {
        const data_send = {
            command: "/deleteMetricRequest",
            data: metric
        };

        console.debug("SEND", `[COMPUTE NODE] Request removal of metric: ${metric.name} via command /deleteMetricRequest`, data_send);
        rtc.sendMessage(JSON.stringify(data_send));
    }

    /**************************************************************************************************************
     * Handles the addition of a new metric when the corresponding button is clicked
     **************************************************************************************************************/
    function handleMetricButtonAdd() {
        if (!newMetric.name || !newMetric.min_label || !newMetric.max_label) {
            console.debug("WARN", "Cannot add metric. Please fill in all fields.");
            showInfo("Cannot add metric. Please fill in all fields.")
            return;
        }

        if (metrics.some(m => m.name === newMetric.name)) {
            console.debug("WARN", "Cannot add metric. Name already exists.");
            showInfo("Cannot add metric. Name already exists.")
            return;
        }

        // Check if the scale matches all existing metrics. If there are no existing metrics, this check is skipped.
        if (
            metrics.length > 0 &&
            metrics.some(m => String(m.scale) !== String(newMetric.scale))
        ) {
            console.debug("WARN", "Cannot add metric. Scale must match existing metrics.");
            showInfo("Cannot add metric. Scale must match existing metrics.");
            return;
        }

        const data_send = {
            command: "/putMetricRequest",
            data: newMetric
        };
        console.debug("SEND", `[COMPUTE NODE] Request addition of new metric: ${newMetric.name} via command /putMetricRequest`, data_send);
        rtc.sendMessage(JSON.stringify(data_send));
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className='metrics'>
            <div className="metrics-content">
                <table className="metrics-table">
                    <thead>
                        <tr>
                            {headerValC.map((h, idx) => (
                                <th key={idx} className="metrics-cell-config">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.map((metric, idx) => (
                            <tr key={idx}>
                                <td className="metrics-cell-config">{metric.name}</td>
                                <td className="metrics-cell-config">{metric.min_label}</td>
                                <td className="metrics-cell-config">{metric.max_label}</td>
                                <td className="metrics-cell-config">{metric.scale}</td>
                                <td className="metrics-cell-config">{metric.tooltip}</td>
                                <td className="metrics-cell-config center red">
                                    <CancelIcon className="metrics-icon" onClick={() => handleMetricButtonRemove(metric)} />
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td className="metrics-cell-config">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={newMetric.name || ""}
                                    onChange={e => setNewMetric(m => ({ ...m, name: e.target.value }))}
                                />
                            </td>
                            <td className="metrics-cell-config">
                                <input
                                    type="text"
                                    placeholder="Lowest Label"
                                    value={newMetric.min_label || ""}
                                    onChange={e => setNewMetric(m => ({ ...m, min_label: e.target.value }))}
                                />
                            </td>
                            <td className="metrics-cell-config">
                                <input
                                    type="text"
                                    placeholder="Highest Label"
                                    value={newMetric.max_label || ""}
                                    onChange={e => setNewMetric(m => ({ ...m, max_label: e.target.value }))}
                                />
                            </td>
                            
                            <td className="metrics-cell-config">
                                <input
                                    type="number"
                                    step="1"
                                    min={2}
                                    max={10}
                                    placeholder="Scale"
                                    value={newMetric.scale || ""}
                                    onChange={e => setNewMetric(m => ({ ...m, scale: e.target.value }))}
                                />
                            </td>
                            <td className="metrics-cell-config">
                                <input
                                    type="text"
                                    placeholder="Tooltip"
                                    value={newMetric.tooltip || ""}
                                    onChange={e => setNewMetric(m => ({ ...m, tooltip: e.target.value }))}
                                />
                            </td>
                            <td className="metrics-cell-config center green">
                                <AddCircleIcon className="metrics-icon" onClick={handleMetricButtonAdd} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}