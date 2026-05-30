/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Info.scss';
import {useEffect, useState} from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

if (typeof window !== "undefined") {
    if (!window.__consoleInfoBuffer) {
        window.__consoleInfoBuffer = [];
    }
    if (!window.pushConsoleInfo) {
        // msg: string, slot: "src" | "ref" | "out"
        window.pushConsoleInfo = (msg, slot = "src") => {
            window.__consoleInfoBuffer.push({ slot, msg });
        };
    }
}

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** This component displays information about the loaded data.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Info({activeRenderer}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [srcLines, setSrcLines] = useState([]);
    const [refLines, setRefLines] = useState([]);
    const [outLines, setOutLines] = useState([]);

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const isMobile = useMediaQuery("(max-width:900px)");

    // Visibility: Desktop → all visible; Mobile → only activeRenderer
    const showSrc  = !isMobile || activeRenderer === "src";
    const showRef  = !isMobile || activeRenderer === "ref";
    const showOut  = !isMobile || activeRenderer === "out";

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        const handler = (e) => {
            const detail = e.detail;

            let slot = "src";
            let msg = "";

            // Fall 1: alter Aufruf mit reinem String
            if (typeof detail === "string") {
                msg = detail;

            // Fall 2: neues Schema: { slot, msg }
            } else if (detail && typeof detail === "object") {
                slot = detail.slot || "src";

                const payload = detail.msg;

                if (typeof payload === "string") {
                    // msg ist schon formatiert
                    msg = payload;

                } else if (payload && typeof payload === "object") {
                    // msg ist ein Objekt → in HTML-Tabelle mit Key/Value umwandeln
                    const rows = Object.entries(payload)
                        .map(([key, value]) =>
                            `<tr><td>${key}</td><td>${String(value)}</td></tr>`
                        )
                        .join("");

                    msg = `<table class="info_table" style="width: 100%">${rows}</table>`;
                }
            }

            if (!msg) return;

            if (slot === "src") {
                setSrcLines((prev) => [msg]);
            } else if (slot === "ref") {
                setRefLines((prev) => [msg]);
            } else if (slot === "out") {
                setOutLines((prev) => [msg]);
            } else {
                setSrcLines((prev) => [msg]);
            }
        };

        window.addEventListener("consoleInfo:add", handler);
        return () => window.removeEventListener("consoleInfo:add", handler);
    }, []);

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Puffer leeren
        if (window.__consoleInfoBuffer && window.__consoleInfoBuffer.length > 0) {
            window.__consoleInfoBuffer.forEach((entry) => {
                window.dispatchEvent(
                    new CustomEvent("consoleInfo:add", { detail: entry })
                );
            });
            window.__consoleInfoBuffer = [];
        }

        // Ab jetzt direkt Events senden
        window.pushConsoleInfo = (msg, slot = "src") => {
            window.dispatchEvent(
                new CustomEvent("consoleInfo:add", {
                    detail: { slot, msg },
                })
            );
        };
    }, []);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className='info-content'>
            {/* SRC-Infos */}
            <div
                className='info-content-sub'
                style={{ display: showSrc ? undefined : "none" }}
            >
                {srcLines.map((l, i) => (
                    <div key={i} dangerouslySetInnerHTML={{ __html: l }} />
                ))}
                
            </div>

            {/* REF-Infos */}
            <div
                className='info-content-sub'
                style={{ display: showRef ? undefined : "none" }}
            >
                {refLines.map((l, i) => (
                    <div key={i} dangerouslySetInnerHTML={{ __html: l }} />
                ))}
            </div>

            {/* OUT-Infos */}
            <div
                className='info-content-sub'
                style={{ display: showOut ? undefined : "none" }}
            >
                {outLines.map((l, i) => (
                    <div key={i} dangerouslySetInnerHTML={{ __html: l }} />
                ))}
            </div>
        </div>
    );
}