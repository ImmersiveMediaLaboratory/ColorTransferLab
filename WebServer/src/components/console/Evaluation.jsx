/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Evaluation.scss';
import {useEffect, useState} from 'react';
import { useWebRTC } from '../../Utils/WebRTCProvider';
import { useSelection } from "../../contexts/SelectionContext";
import ColorLensTwoToneIcon from '@mui/icons-material/ColorLensTwoTone';
import ArchitectureTwoToneIcon from '@mui/icons-material/ArchitectureTwoTone';
import ForestTwoToneIcon from '@mui/icons-material/ForestTwoTone';
import FunctionsTwoToneIcon from '@mui/icons-material/FunctionsTwoTone';
import { getInitialValue } from '@/Utils/Utils';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** This component displays the evaluation results for various metrics. It allows users to calculate individual 
 ** metrics or all metrics at once, and to export the results as JSON. The metrics are organized into four 
 ** categories: Color Evaluation, Structure Evaluation, Naturalness, and Combined Evaluation. Each category has 
 ** its own set of metrics with specific ranges and color coding based on the values.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Evaluation({activeTab}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [metricsResults, setMetricsResults] = useState(
        getInitialValue('Evaluation:results') ??
        {
            "PSNR" : null, "HI": null, "Corr": null, "BD": null, "MSE": null, "RMSE": null, "CF": null,
            "MSSSIM": null, "SSIM": null, "GSSIM": null, "IVSSIM": null, "IVEGSSIM": null,
            "FSIM": null, "BRISQUE": null, "NIQE": null, "VSI": null, "CTQM": null, "LPIPS": null, "NIMA": null, "CSS": null
        }
    );

    const [activeView, setActiveView] = useState(getInitialValue('Evaluation:activeEvaluationTab') ?? 1);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    // infinite = true -> max is displayed as "∞" in the UI
    // true = larger is better; false = smaller is better
    const metricsData = {
        1: {
            name: "Color Evaluation",
            icon: ColorLensTwoToneIcon,
            metrics: {
                HI: { 
                    min: 0,    
                    max: 1,
                    higherIsBetter: true
                },
                Corr: { 
                    min: -1,   
                    max: 1, 
                    higherIsBetter: true
                },
                BD: { 
                    min: 0,    
                    max: 1, 
                    higherIsBetter: false
                }
            }
        },
        2: {
            name: "Structure Evaluation",
            icon: ArchitectureTwoToneIcon,
            metrics: {
                PSNR: { 
                    min: 0,    
                    max: 40, 
                    infinite: true,
                    higherIsBetter: true
                },
                MSE: { 
                    min: 0,    
                    max: 1, 
                    higherIsBetter: false
                },
                RMSE: { 
                    min: 0,    
                    max: 1, 
                    higherIsBetter: false
                },
                MSSSIM: { 
                    min: 0,    
                    max: 1, 
                    higherIsBetter: true
                },
                SSIM: { 
                    min: 0,    
                    max: 1, 
                    higherIsBetter: true
                },
                GSSIM: { 
                    min: 0,    
                    max: 1, 
                    higherIsBetter: true
                },
                IVSSIM: { 
                    min: 0,    
                    max: 1, 
                    higherIsBetter: true
                },
                IVEGSSIM: { 
                    min: 0,    
                    max: 1, 
                    higherIsBetter: true
                },
                FSIM: { 
                    min: 0,    
                    max: 1, 
                    higherIsBetter: true
                },
                VSI: { 
                    min: 0,    
                    max: 1, 
                    higherIsBetter: true
                },
                LPIPS: { 
                    min: 0,    
                    max: 1, 
                    higherIsBetter: false
                },
            }
        },
        3: {
            name: "Naturalness",
            icon: ForestTwoToneIcon,
            metrics: {
                CF: { 
                    min: 0,    
                    max: 109, 
                    higherIsBetter: true
                },
                BRISQUE: { 
                    min: 0,    
                    max: 100, 
                    higherIsBetter: false
                },
                NIQE: { 
                    min: 0,    
                    max: 20, 
                    higherIsBetter: false
                },
                NIMA: { 
                    min: 0,    
                    max: 10, 
                    higherIsBetter: true
                }
            }
        },
        4: {
            name: "Combined Evaluation",
            icon: FunctionsTwoToneIcon,
            metrics: {
                CTQM: { 
                    min: 0,    
                    max: 100, 
                    higherIsBetter: true
                },
                CSS: { 
                    min: 0,    
                    max: 2, 
                    higherIsBetter: true
                }
            }
        }
    };


    const {rtc} = useWebRTC();
    const { selectedSourcePath, selectedReferencePath, selectedOutputPath } = useSelection(); 
    
    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Called when a new metric result is received from the backend. Updates the metricsResults state with the new value.
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onMetricsRequest = (data) => {
            const metric = data.metric;
            let value = data.value;
            
            if (typeof value === "number") {
                value = Number(value.toFixed(4));
            } else if (!isNaN(parseFloat(value))) {
                value = Number(parseFloat(value).toFixed(4));
            }

            setMetricsResults((prev) => ({
                ...prev,
                [metric]: value,
            }));

            console.debug("RECV", "Metrics result received:", data);
        };
    }, [rtc]);

    /**************************************************************************************************************
     * ...
     **************************************************************************************************************/
    useEffect(() => {
        localStorage.setItem('Evaluation:results', JSON.stringify(metricsResults));
    }, [metricsResults]);

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        localStorage.setItem('Evaluation:activeEvaluationTab', JSON.stringify(activeView));
    }, [activeView]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * If a metric has infinite: true in its range, display max as "∞" in the UI; otherwise display "min / max".
     **************************************************************************************************************/
    // Min/Max-Anzeige formatieren (für alle Metriken mit infinite: true → max als ∞)
    const formatRange = (range) => {
        if (!range) return "- / -";
        const minStr = range.min;
        const maxStr = range.infinite ? "∞" : range.max;
        return `${minStr} / ${maxStr}`;
    };

    /**************************************************************************************************************
     * Color Coding of cells based on value and metric-specific range/direction.
     **************************************************************************************************************/
    const getValueCellStyle = (metricName, value) => {
        const range = metricsData[activeView].metrics[metricName];
        if (!range || value === null || value === undefined) return {};

        if(value === "∞")
            return {
                backgroundColor: `rgb(0,${0.35 * 255},0)`,
                color: "#ffffff",
            };

        const num = typeof value === "number" ? value : parseFloat(value);
        if (Number.isNaN(num)) return {};

        const { min, max} = range;
        const cMin = min;
        const cMax = max;
        if (cMax === cMin) return {};

        let t_raw = (num - cMin) / (cMax - cMin);
        t_raw = Math.max(0, Math.min(1, t_raw));

        const higherIsBetter = metricsData[activeView].metrics[metricName].higherIsBetter ?? true;
        const t = higherIsBetter ? t_raw : 1 - t_raw;

        let r, g, b;
        if (t <= 0.5) {
            const tt = t * 2;
            r = 255;
            g = 255 * tt;
            b = 0;
        } else {
            const tt = (t - 0.5) * 2;
            r = 255 * (1 - tt);
            g = 255;
            b = 0;
        }

        const factor = 0.35;
        r = Math.round(r * factor);
        g = Math.round(g * factor);
        b = Math.round(b * factor);

        return {
            backgroundColor: `rgb(${r},${g},${b})`,
            color: "#ffffff",
        };
    };

    /**************************************************************************************************************
     * Sends a request to the backend to calculate the specified metric for the currently selected source, 
     * reference, and output paths.
     **************************************************************************************************************/
    const handleCalculate = (metricName) => {
        console.debug("SEND", "Request metric calculation:", metricName);

        const data_send = {
            command: "/getEvaluationRequest",
            data: {
                source: selectedSourcePath,
                reference: selectedReferencePath,
                output: selectedOutputPath,
                metric: metricName
            }
        };
        rtc.sendMessage(JSON.stringify(data_send));
    };

    /**************************************************************************************************************
     * Calculates all metrics. Calls handleCalculate for each metric in the current view.
     **************************************************************************************************************/
    const handleCalculateAll = () => {
        console.debug("INFO", "Calculate all metric.");
        const list = Object.keys(metricsData[activeView].metrics);
        list.forEach((m) => handleCalculate(m));
    };

    /**************************************************************************************************************
     * Exports all metrics results as JSON.
     **************************************************************************************************************/
    const handleExport = () => {
        const metricsObject = {};
        for (const [idx, metricTypes] of Object.entries(metricsData)) {
            for (const [key, val] of Object.entries(metricTypes.metrics)) {
                metricsObject[key] = {
                    value: metricsResults[key],
                    min: val.min ?? null,
                    max: val.max ?? null,
                };
            }
        }

        const exportData = {
            source: selectedSourcePath || null,
            reference: selectedReferencePath || null,
            output: selectedOutputPath || null,
            metrics: metricsObject,
        };

        const jsonStr = JSON.stringify(exportData, null, 2);

        console.debug("INFO", "Export evaluation results JSON:", exportData);

        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        a.href = url;
        a.download = `evaluation_results_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div
            className='evaluation'
            style={{ display: activeTab === "evaluation" ? "block" : "none"}}
        >
            {/* Left area: Main content */}
            <div className="evaluation-content">
                <div className="evaluation-title">{metricsData[activeView].name}</div>
                <table className="evaluation_table">
                    <thead>
                        <tr>
                            {["Metric", "Min / Max", "Value"].map((h, idx) => (
                                <th key={idx} className="cell_config">{h}</th>
                            ))}
                            <th className="cell_config">
                                <div className='evaluation-calc-header'>
                                    <span>Calculate</span>
                                    <button
                                        className="evaluation_calc_button"
                                        onClick={handleCalculateAll}
                                    >
                                        All
                                    </button>
                                    <button
                                        className="evaluation_calc_button"
                                        onClick={handleExport}
                                    >
                                        Export
                                    </button>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(metricsData[activeView].metrics).map((metric) => {
                            const range = metricsData[activeView].metrics[metric];
                            const value = metricsResults[metric] == "999999" ? "∞" : metricsResults[metric];
                            const valueCellStyle = getValueCellStyle(metric, value);

                            return (
                                <tr key={metric}>
                                    <td className="cell_config">{metric}</td>
                                    <td className="cell_config">
                                        {formatRange(range)}
                                    </td>
                                    <td className="cell_config" style={valueCellStyle}>
                                        {value !== null ? String(value) : "-"}
                                    </td>
                                    <td className="cell_config">
                                        <button
                                            className="evaluation-calc-button"
                                            onClick={() => handleCalculate(metric)}
                                        >
                                            Calculate
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Right border: scrollable tab with icons (4 views) */}
            <div className='evaluation-scrollarea'>
                {Array.from({ length: 4 }, (_, i) => i + 1).map((idx) => {
                    const IconComp = metricsData[idx]?.icon;
                    return (
                        <button 
                            className={`evaluation-metric-buttons ${activeView === idx ? 'active' : ''}`}
                            key={idx}
                            onClick={() => setActiveView(idx)}
                        >
                            {IconComp && <IconComp style={{ fontSize: 18 }} />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}