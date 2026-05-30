/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./Information.scss";
import { useState, useEffect } from "react";

if (typeof window !== "undefined") {
    if (!window.__informationBuffer) {
        window.__informationBuffer = [];
    }
    // Default: buffer messages until Information component is mounted
    if (!window.pushInformation) {
        window.pushInformation = (msg) => {
            window.__informationBuffer.push(msg);
        };
    }
}

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** TO-DO
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Information({activeTab}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [lines, setLines] = useState([]);

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
            let msg = e.detail
                .replace(/\Publication\b/g, '<span class="highlight">Publication</span>')
                .replace(/\bAuthors\b/g, '<span class="highlight">Authors</span>')
                .replace(/\bScientific Venue\b/g, '<span class="highlight">Scientific Venue</span>')
                .replace(/\bYear\b/g, '<span class="highlight">Year</span>')
                .replace(/\bDOI\b/g, '<span class="highlight">DOI</span>')
                .replace(/\bAbstract\b/g, '<span class="highlight">Abstract</span>')
                .replace(/\bSupport\b/g, '<span class="highlight">Support</span>')
            setLines([msg]);
        };
        window.addEventListener("information:add", handler);
        return () => window.removeEventListener("information:add", handler);
    }, []);

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        if (typeof window === "undefined") return;

        // When Information is ready, flush buffered messages
        if (window.__informationBuffer && window.__informationBuffer.length > 0) {
            window.__informationBuffer.forEach((msg) => {
                window.dispatchEvent(new CustomEvent("information:add", { detail: msg }));
            });
            window.__informationBuffer = [];
        }

        // pushInformation sends directly to the Information listener
        window.pushInformation = (msg) => {
            window.dispatchEvent(new CustomEvent("information:add", { detail: msg }));
        };
    }, []);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div 
            className="information" 
            style={{ display: activeTab === "information" ? "block" : "none"}}>
            <div className="information-content">
                <div className="information-text">
                    {lines.map((l, i) => (
                        <div key={i} dangerouslySetInnerHTML={{ __html: l }} />
                    ))}
                </div>
            </div>
        </div>
    );
}