/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Main.scss'
import { useState, useEffect} from 'react'
import { useWebRTC } from '@/Utils/WebRTCProvider';
import { getInitialValue } from "@/Utils/Utils"
import TestArea from './TestArea'
import ItemArea from './ItemArea'

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** 
 ******************************************************************************************************************
 ******************************************************************************************************************/
function Main({ setSubmitted }) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [tests, setTests] = useState([]);
    const [participantID, setParticipantID] = useState(null);
    const [selectedTestIdx, setSelectedTestIdx] = useState(0);
    const [ratingsMap, setRatingsMap] = useState({});
    const [ratings, setRatings] = useState(getInitialValue(`Main:ratings`) ?? {});
    const [metrics, setMetrics] = useState([]);
    const [completed, setCompleted] = useState(false);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const {rtc} = useWebRTC();
    const username = localStorage.getItem('username');
    const selectedTest = tests[selectedTestIdx];
    const selectedTestId = selectedTest?.test_id;

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     ** Callback for receiving the user test set
     **************************************************************************************************************/
    useEffect(() => {
        rtc.onGetUserTestSetRequest = (data) => {
            console.debug("RECV", "Received user test set for user study ID via command /getUserTestSetResponse:", data);
            setTests(data.test_set);
            setParticipantID(data.participant_id);
        }
    }, [rtc]);

    /**************************************************************************************************************
     ** Set local storage ratings whenever ratings state changes.
     **************************************************************************************************************/
    useEffect(() => {
        localStorage.setItem(`Main:ratings`, JSON.stringify(ratings));
    }, [ratings]);

    /**************************************************************************************************************
     ** Request Test Set
     **************************************************************************************************************/
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const userStudyId = params?.get('id');

        // request test set from compute node
        let data_send = {
            command: "/getUserTestSetRequest",
            data: userStudyId
        };

        console.debug("SEND", `[COMPUTE NODE] Request user test set for user study ID: ${userStudyId} via command /getUserTestSetRequest`, data_send);
        rtc.sendMessage(JSON.stringify(data_send));
    }, []);

    /**************************************************************************************************************
     ** Checks if all tests have been rated and sets completed to true if so.
     **************************************************************************************************************/
    useEffect(() => {
        const numTests = tests.length;
        const numMetrics = metrics.length;

        if (Object.keys(ratings).length === numTests && numTests > 0) {
            for (const [key, value] of Object.entries(ratings)) {
                const numResultsPerTest = Object.keys(value).length;
                if (numResultsPerTest !== numMetrics) {
                    return;
                }
            }
            setCompleted(true);
        }
    }, [ratings, metrics]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     ** Set local ratings to local storage.
     **************************************************************************************************************/
    function setLocalRatings(username, ratings) {
        localStorage.setItem(`ratings_${username}` , JSON.stringify(ratings));
    }

    /**************************************************************************************************************
     ** Handler for ratings change
     **************************************************************************************************************/
    const handleRatingsChange = (ratingsArr) => {
        if (!selectedTestId) return;
        const newMap = { ...ratingsMap, [selectedTestId]: ratingsArr };
        setRatingsMap(newMap);
        setLocalRatings(username, newMap);
    };

    /**************************************************************************************************************
     ** Handler for Previous Button
     **************************************************************************************************************/
    const handlePrev = () => {
        setSelectedTestIdx(idx => Math.max(0, idx - 1));
    };

    /**************************************************************************************************************
     ** Handler for Next Button
     **************************************************************************************************************/
    const handleNext = () => {
        setSelectedTestIdx(idx => Math.min(tests.length - 1, idx + 1));
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="main">
            <TestArea 
                test={selectedTest} 
                metrics={metrics}
                participantID={participantID}
                setMetrics={setMetrics}
                setRatings={setRatings}
                completed={completed}
                ratings={ratings} 
                onRatingsChange={handleRatingsChange}
                onPrev={handlePrev} 
                onNext={handleNext} 
                disablePrev={selectedTestIdx === 0} 
                disableNext={selectedTestIdx === tests.length - 1} 
                setSubmitted={setSubmitted}
            />
            <ItemArea 
                tests={tests} 
                ratings={ratings}
                metrics={metrics}
                onTestSelect={setSelectedTestIdx} 
                selectedTestIdx={selectedTestIdx}
            />
        </div>
    )
}

export default Main
