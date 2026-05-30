/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import { createContext, useContext, useState } from "react";

// Generic global selection context (algorithm, source/ref paths, etc.)
// NOTE: If you see the console warning, you are calling useSelection()
// without wrapping your app in <SelectionProviderUserStudy> / <SelectedAlgorithmProvider>.
const SelectionContextUserStudy = createContext({
    selectedTestType: null,
    selectedUserStudyDatabaseStructure: null,
    selectedTestSets: {rating: null, comparison: null, ranking: null},


    selectedSettings: {rating: {num: 10, scale: 5, databaseFolder: null}, comparison: null, ranking: null},
    contextMetrics: [],

    offerState: false,

    setSelectedTestType: () => {
        console.warn(
            "SelectionContextUserStudy: setSelectedTestType called without a Provider. " +
            "Wrap your app in <SelectionProviderUserStudy> for global state."
        );
    },
    setSelectedUserStudyDatabaseStructure: () => {
        console.warn(
            "SelectionContextUserStudy: setSelectedUserStudyDatabaseStructure called without a Provider. " +
            "Wrap your app in <SelectionProviderUserStudy> for global state."
        );
    },
    setSelectedTestSets: () => {
        console.warn(
            "SelectionContextUserStudy: setSelectedTestSets called without a Provider. " +
            "Wrap your app in <SelectionProviderUserStudy> for global state."
        );
    },
    setSelectedSettings: () => {
        console.warn(
            "SelectionContextUserStudy: setSelectedSettings called without a Provider. " +
            "Wrap your app in <SelectionProviderUserStudy> for global state."
        );
    },
    setContextMetrics: () => {
        console.warn(
            "SelectionContextUserStudy: setContextMetrics called without a Provider. " +
            "Wrap your app in <SelectionProviderUserStudy> for global state."
        );
    },
    setOfferState: () => {
        console.warn(
            "SelectionContextUserStudy: setOfferState called without a Provider. " +
            "Wrap your app in <SelectionProviderUserStudy> for global state."
        );
    },
    resetSelection: () => {
        console.warn(
            "SelectionContextUserStudy: resetSelection called without a Provider. " +
            "Wrap your app in <SelectionProviderUserStudy> for global state."
        );
    },
});

// Primary, more generic provider
export function SelectionProviderUserStudy({ children }) {
    const [selectedTestType, setSelectedTestType] = useState(null);
    const [selectedUserStudyDatabaseStructure, setSelectedUserStudyDatabaseStructure] = useState(null);
    const [selectedTestSets, setSelectedTestSets] = useState({rating: null, comparison: null, ranking: null});
    const [selectedSettings, setSelectedSettings] = useState({rating: {num: 10, scale: 5, databaseFolder: null}, comparison: null, ranking: null});
    const [contextMetrics, setContextMetrics] = useState([]);
    const [offerState, setOfferState] = useState(false);
    const resetSelection = () => {
        setSelectedTestType(null);
        setSelectedUserStudyDatabaseStructure(null);
        setSelectedTestSets({rating: null, comparison: null, ranking: null});
        setSelectedSettings({rating: {num: 10, scale: 5, databaseFolder: null}, comparison: null, ranking: null});
        setContextMetrics([]);
        setOfferState(false);
    };

    const value = {
        selectedTestType,
        selectedUserStudyDatabaseStructure,
        selectedTestSets,
        selectedSettings,
        contextMetrics,
        offerState,
        setSelectedTestType,
        setSelectedUserStudyDatabaseStructure,
        setSelectedTestSets,
        setSelectedSettings,
        setContextMetrics,
        setOfferState,
        resetSelection,
    };

    return (
        <SelectionContextUserStudy.Provider value={value}>
            {children}
        </SelectionContextUserStudy.Provider>
    );
}

// Generic hook
export function useSelectionUserStudy() {
    const ctx = useContext(SelectionContextUserStudy);
    return ctx;
}
