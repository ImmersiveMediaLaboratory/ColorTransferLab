/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './TestArea.scss'
import { useState, useEffect, useRef } from 'react'
import { useWebRTC } from '@/Utils/WebRTCProvider';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** TestArea component for displaying and rating a single test.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function TestArea({ test, metrics, participantID, setMetrics, setRatings, ratings, completed, onRatingsChange, onPrev, onNext, disablePrev, disableNext, setSubmitted }) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/    
    const [localRatings, setLocalRatings] = useState(ratings);

    const [imageDict, setImageDict] = useState([
        { src: null, label: 'Source' },
        { src: null, label: 'Output' },
        { src: null, label: 'Reference' }
    ]);

    /*------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const activeTest = useRef(null);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc} = useWebRTC();


    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     ** 
     **************************************************************************************************************/
    useEffect(() => {
        const data_send = {
            command: "/getMetricsRequest",
            data: ""
        };

        console.debug("SEND", "[COMPUTE NODE] Request to apply User Study metrics via command /metricsUserStudy", data_send);
        rtc.sendMessage(JSON.stringify(data_send));

        window.addEventListener("webrtc:userTestFile", handlerUserTestShow);
        return () => {
            window.removeEventListener("webrtc:userTestFile", handlerUserTestShow);
        };
    }, []);

    /**************************************************************************************************************
     ** 
     **************************************************************************************************************/
    function handlerUserTestShow(e) {
        const value = e.detail.data;
        const rid = e.detail.rid;
        const receivedBlob = new Blob(value);
        const image_path = URL.createObjectURL(receivedBlob);

        if (rid === "src") {
            setImageDict(prev => prev.map(img => img.label === "Source" ? {...img, src: image_path} : img));
        } else if (rid === "out") {
            setImageDict(prev => prev.map(img => img.label === "Output" ? {...img, src: image_path} : img));
        } else if (rid === "ref") {
            setImageDict(prev => prev.map(img => img.label === "Reference" ? {...img, src: image_path} : img));
        }
    }

    /**************************************************************************************************************
     ** 
     **************************************************************************************************************/
    useEffect(() => {
        setLocalRatings(ratings);
    }, [ratings, test?.test_id]);

    /**************************************************************************************************************
     ** 
     **************************************************************************************************************/
    useEffect(() => {
        if (JSON.stringify(localRatings) !== JSON.stringify(ratings)) {
            onRatingsChange(localRatings);
            console.log(localRatings)
        }
    }, [localRatings]);

    /**************************************************************************************************************
     ** 
     **************************************************************************************************************/
    useEffect(() => {
        if (test) {
            const dataset_name = test?.dataset_name;
            const test_name = test?.test_name;

            activeTest.current = test;

            let data_send = {
                "command": "/getRatingFileRequest",
                "data": {
                    "rid": "src",
                    "abstractPath": `${dataset_name}/${test_name}/src.png`,
                    "mode": "usertest"
                }
            }

            console.debug("SEND", "[Compute Node] Request File via command /getRatingFileRequest",  data_send)
            rtc.sendMessage(JSON.stringify(data_send))

            data_send = {
                "command": "/getRatingFileRequest",
                "data": {
                    "rid": "ref",
                    "abstractPath": `${dataset_name}/${test_name}/ref.png`,
                    "mode": "usertest"
                }
            }

            console.debug("SEND", "[Compute Node] Request File via command /getRatingFileRequest",  data_send)
            rtc.sendMessage(JSON.stringify(data_send))


            data_send = {
                "command": "/getRatingFileRequest",
                "data": {
                    "rid": "out",
                    "abstractPath": `${dataset_name}/${test_name}/out.png`,
                    "mode": "usertest"
                }
            }

            console.debug("SEND", "[Compute Node] Request File via command /getRatingFileRequest",  data_send)
            rtc.sendMessage(JSON.stringify(data_send))
        }
    }, [test]);

    /**************************************************************************************************************
     ** 
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onGetMetricsRequest = (data) => {
            console.debug("RECV", "[Compute Node] User Study Metrics data received: ", data);
            setMetrics(data);
        };
    }, [rtc]);

    /**************************************************************************************************************
     ** 
     **************************************************************************************************************/
    const handleRatingsChange = (metric, newRatings) => {
        setRatings(prev => {
            const updated = { ...prev };
            if (!updated[activeTest.current?.set_id]) {
                updated[activeTest.current?.set_id] = {};
            }
            updated[activeTest.current?.set_id][metric] = newRatings;
            return updated;
        });
    }

    /**************************************************************************************************************
     ** 
     **************************************************************************************************************/
    const handleSubmission = () => {
        let data_send = {
            command: "/putSubmissionRequest",
            data: {participant_id: participantID, ratings: ratings}
        };

        console.debug("SEND", `[COMPUTE NODE] Submitting user ratings via command /putSubmissionRequest`, data_send);
        rtc.sendMessage(JSON.stringify(data_send));

        setSubmitted(true);
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="testarea">
            <div className="testarea-image-container">
                {imageDict.map((img, idx) => (
                    <div className='testarea-single-image-container'>
                        <div key={idx} className={`testarea-image-wrapper`}>
                            <img src={img.src} alt={img.label} />
                        </div>
                        <div className="testarea-image-caption">{img.label}</div>
                    </div>
                ))}
            </div>

            <div className="testarea-likert-container">
                <table className="testarea-likert-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th></th>
                            {Array.from({ length: metrics[0]?.scale || 5 }, (_, i) => (
                                <th key={`testarea-header-radio-${i}`}>{i + 1}</th>
                            ))}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.map((item, idx) => (
                            <tr key={idx}>
                                <td>
                                    <span>{item.name}</span>
                                    <span className='testarea-tooltip' title={item?.tooltip}>
                                        &#9432;
                                    </span>
                                </td>
                                <td className="testarea-likert-pole-row left">{item.min_label || ''}</td> 
                                {/* Radio-Buttons */}
                                {Array.from({ length: item.scale }, (_, i) => (
                                    <td key={`testarea-radio-${idx}-${i}`}>
                                        <input
                                            type="radio"
                                            name={`likert-${idx}-${test?.test_id}`}
                                            value={i + 1}
                                            checked={ratings[test?.set_id]?.[item.name] === i + 1}
                                            onChange={() => handleRatingsChange(item.name, i + 1)}
                                        />
                                    </td>
                                ))}
                                <td className="testarea-likert-pole-row">{item.max_label || ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="testarea-prev-next-container">
                <button className="testarea-prev-button" onClick={onPrev} disabled={disablePrev}>Previous</button>
                <button className="testarea-next-button" onClick={onNext} disabled={disableNext}>Next</button>
                {completed && (
                    <button className="submit_button" onClick={handleSubmission} style={{marginLeft: 12, background: '#4caf50', color: 'white', fontWeight: 'bold'}}>
                        Submit
                    </button>
                )}
            </div>
        </div>
    )
}