/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import { createContext, useContext, useState } from "react";
import Warning from "@/components/layout/Warning";

export const WarningContext = createContext();
export function useWarning() { return useContext(WarningContext); }

export function WarningProvider({ children }) {
    const [warning, setWarning] = useState({ isActive: false, text: "", onContinue: null, onAbort: null });

    const showWarning = (text) => {
        return new Promise((resolve) => {
            setWarning({
                isActive: true,
                text,
                onContinue: () => { setWarning(w => ({ ...w, isActive: false })); resolve("continue"); },
                onAbort: () => { setWarning(w => ({ ...w, isActive: false })); resolve("abort"); }
            });
        });
    };

    const showInfo = (text) => {
        return new Promise((resolve) => {
            setWarning({
            isActive: true,
            text,
            onContinue: () => { setWarning(w => ({ ...w, isActive: false })); resolve("continue"); },
            onAbort: null
            });
        });
    };

    const hideWarning = () => setWarning({ ...warning, isActive: false });

    return (
        <WarningContext.Provider value={{ warning, showWarning, showInfo, hideWarning }}>
            {children}
            <Warning
            isActive={warning.isActive}
            warningText={warning.text}
            handleContinue={warning.onContinue}
            handleAbort={warning.onAbort}
            />
        </WarningContext.Provider>
    );
}