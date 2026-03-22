/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './RenderBar.scss';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** A render bar that shows the progress of the download and the file processing.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function RenderBar({downloadProgress, loadingProgress}) {    
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div
            className="renderbar" 
            style={downloadProgress.status === "end" && loadingProgress.status === "end" ? { display: "none" } : { display: "block" }}
        >
            <div className="renderbar-text">
                {downloadProgress.status === "progress" && `Download: ${downloadProgress.progress.toFixed(2)}%`}
                {loadingProgress.status === "progress" && `Processing: ${loadingProgress.progress.toFixed(2)}%`}
            </div>
            <div 
                className="renderbar-download"
                style={{ width: downloadProgress.status === "progress" ? `${downloadProgress.progress}%` : "0%" }}
            />
            <div 
                className="renderbar-processing"
                style={{ width: loadingProgress.status === "progress" ? `${loadingProgress.progress}%` : "0%" }}
            />
        </div>
    )
}