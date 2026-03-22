import { createContext, useContext, useState } from "react";

/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

// Generic global selection context (algorithm, source/ref paths, etc.)
// NOTE: If you see the console warning, you are calling useSelection()
// without wrapping your app in <SelectionProvider> / <SelectedAlgorithmProvider>.
const SelectionContext = createContext({
    selectedAlgorithm: null,
    selectedOptions: null,
    selectedSourcePath: null,
    selectedReferencePath: null,
    selectedOutputPath: null,
    selectedColorDistribution: {src: null, ref: null, out: null},
    selectedHistogram3D: {src: null, ref: null, out: null},
    selectedHistogram2D: {src: null, ref: null, out: null},
    selectedSemanticList: [],

    contextConnectedNodes: null,

    setSelectedAlgorithm: () => {
        console.warn(
            "SelectionContext: setSelectedAlgorithm called without a Provider. " +
            "Wrap your app in <SelectionProvider> for global state."
        );
    },
    setSelectedOptions: () => {
        console.warn(
            "SelectionContext: setSelectedOptions called without a Provider. " +
            "Wrap your app in <SelectionProvider> for global state."
        );
    },
    setSelectedSourcePath: () => {
        console.warn(
            "SelectionContext: setSelectedSourcePath called without a Provider. " +
            "Wrap your app in <SelectionProvider> for global state."
        );
    },
    setSelectedReferencePath: () => {
        console.warn(
            "SelectionContext: setSelectedReferencePath called without a Provider. " +
            "Wrap your app in <SelectionProvider> for global state."
        );
    },
    setSelectedOutputPath: () => {
        console.warn(
            "SelectionContext: setSelectedOutputPath called without a Provider. " +
            "Wrap your app in <SelectionProvider> for global state."
        );
    },
    setSelectedSemanticList: () => {
        console.warn(
            "SelectionContext: setSelectedSemanticList called without a Provider. " +
            "Wrap your app in <SelectionProvider> for global state."
        );
    },
    setSelectedColorDistribution: () => {
        console.warn(
            "SelectionContext: setSelectedColorDistribution called without a Provider. " +
            "Wrap your app in <SelectionProvider> for global state."
        );
    },
    setSelectedHistogram3D: () => {
        console.warn(
            "SelectionContext: setSelectedHistogram3D called without a Provider. " +
            "Wrap your app in <SelectionProvider> for global state."
        );
    },
    setSelectedHistogram2D: () => {
        console.warn(
            "SelectionContext: setSelectedHistogram2D called without a Provider. " +
            "Wrap your app in <SelectionProvider> for global state."
        );
    },
    setContextConnectedNodes: () => {
        console.warn(
            "SelectionContext: setContextConnectedNodes called without a Provider. " +
            "Wrap your app in <SelectionProvider> for global state."
        );
    },
    resetSelection: () => {
        console.warn(
            "SelectionContext: resetSelection called without a Provider. " +
            "Wrap your app in <SelectionProvider> for global state."
        );
    },
});

// Primary, more generic provider
export function SelectionProvider({ children }) {
    const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState(null);
    const [selectedSourcePath, setSelectedSourcePath] = useState(null);
    const [selectedReferencePath, setSelectedReferencePath] = useState(null);
    const [selectedOutputPath, setSelectedOutputPath] = useState(null);
    const [selectedSemanticList, setSelectedSemanticList] = useState(null);
    const [selectedColorDistribution, setSelectedColorDistribution] = useState({src: null, ref: null, out: null});
    const [selectedHistogram3D, setSelectedHistogram3D] = useState({src: null, ref: null, out: null});
    const [selectedHistogram2D, setSelectedHistogram2D] = useState({src: null, ref: null, out: null});
    const [contextConnectedNodes, setContextConnectedNodes] = useState(null);

    const resetSelection = () => {
        setSelectedAlgorithm(null);
        setSelectedOptions(null);
        setSelectedSourcePath(null);
        setSelectedReferencePath(null);
        setSelectedOutputPath(null);
        setSelectedSemanticList(null);
        setSelectedColorDistribution({src: null, ref: null, out: null});
        setSelectedHistogram3D({src: null, ref: null, out: null});
        setSelectedHistogram2D({src: null, ref: null, out: null});
        setContextConnectedNodes(null);
    };

    const value = {
        selectedAlgorithm,
        selectedOptions,
        selectedSourcePath,
        selectedReferencePath,
        selectedOutputPath,
        selectedSemanticList,
        selectedColorDistribution,
        selectedHistogram3D,
        selectedHistogram2D,
        contextConnectedNodes,
        setSelectedAlgorithm,
        setSelectedOptions,
        setSelectedSourcePath,
        setSelectedReferencePath,
        setSelectedOutputPath,
        setSelectedSemanticList,
        setSelectedColorDistribution,
        setSelectedHistogram3D,
        setSelectedHistogram2D,
        setContextConnectedNodes,
        resetSelection,
    };

    return (
        <SelectionContext.Provider value={value}>
            {children}
        </SelectionContext.Provider>
    );
}

// Generic hook
export function useSelection() {
    const ctx = useContext(SelectionContext);
    return ctx;
}
