/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./TestTypeButton.scss";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Buttons for the test type selection in the sidebar left.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function TestTypeButton({ activeTestType, val, onClick, children }) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <button
            className={`testtypebutton ${activeTestType === val ? "active" : ""}`}
            onClick={() => onClick(children)}
        >
            <div className="testtypebutton-content">
                <span>
                    {children}
                </span>
            </div>
        </button>
    );
}
