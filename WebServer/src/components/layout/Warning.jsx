/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./Warning.scss";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** ...
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Warning({handleContinue, handleAbort, warningText = "This is a warning message.", isActive = false}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="warning" style={{ display: isActive ? "flex" : "none" }}>
            <div className="warning-content">
                <div className="warning-header-title">
                    {handleAbort === null ? "Info" : "Warning"}
                </div>
                <div>
                    {warningText}
                </div>
                <div className="warning-buttons">
                    <button
                        className="warning-button"
                        onClick={handleContinue}
                    >
                        Continue
                    </button>
                    {handleAbort === null ? null : (
                        <button
                            className="warning-button"
                            onClick={handleAbort}
                        >
                            Abort
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}