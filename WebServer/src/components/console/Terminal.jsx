/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./Terminal.scss";
import { useState, useEffect } from "react";
import { useRef } from "react";


if (typeof window !== "undefined") {
    if (!window.__terminalBuffer) {
        window.__terminalBuffer = [];
    }
    // Default: buffer messages until Terminal is mounted
    if (!window.pushTerminal) {
        window.pushTerminal = (msg) => {
            window.__terminalBuffer.push(msg);
        };
    }
}

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Renders the Terminal tab content, listens for "terminal:add" events to update displayed lines.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Terminal({ activeTab }) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [lines, setLines] = useState([])

    /*------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const bottomRef = useRef(null);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /**************************************************************************************************************
     * Listen for "terminal:add" events to append new lines to the terminal display. Messages are timestamped.
     **************************************************************************************************************/
    useEffect(() => {
        const handler = (e) => {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, "0");
            const mm = String(now.getMinutes()).padStart(2, "0");
            const ss = String(now.getSeconds()).padStart(2, "0");
            const timestamp = `[${hh}:${mm}:${ss}]`;
            let msg = e.detail
                .replace(/\bINFO\b/g, '<span class="info">INFO</span>')
                .replace(/\bWARN\b/g, '<span class="warn">WARN</span>')
                .replace(/\bERRO\b/g, '<span class="error">ERRO</span>')
                .replace(/\bSEND\b/g, '<span class="send">SEND</span>')
                .replace(/\bRECV\b/g, '<span class="recv">RECV</span>')
                .replace(/\[([^\]]+)\]/g, '<span class="bracket">$&</span>')
            setLines(prev => [
                ...prev,
                `<span class="timestamp">${timestamp}</span> ${msg}`
            ]);
        };
        window.addEventListener("terminal:add", handler);
        return () => window.removeEventListener("terminal:add", handler);
    }, []);

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        if (typeof window === "undefined") return;

        // When Terminal is ready, flush buffered messages
        if (window.__terminalBuffer && window.__terminalBuffer.length > 0) {
            window.__terminalBuffer.forEach((msg) => {
                window.dispatchEvent(new CustomEvent("terminal:add", { detail: msg }));
            });
            window.__terminalBuffer = [];
        }

        // pushTerminal sends directly to the Terminal listener
        window.pushTerminal = (msg) => {
            window.dispatchEvent(new CustomEvent("terminal:add", { detail: msg }));
        };
    }, []);

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [lines]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="terminal" style={{display: activeTab === "terminal" ? "block" : "none"}}>
            <div className="terminal_content">
                <div className="terminal_text">
                    {lines.map((l, i) => (
                        <div key={i} dangerouslySetInnerHTML={{ __html: l }} />
                    ))}
                    <div ref={bottomRef} />
                </div>
            </div>
        </div>
    );
}