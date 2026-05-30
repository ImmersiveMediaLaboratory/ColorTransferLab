/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Settings.scss';
import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** This component displays settings for the loaded data.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Settings({activeRenderer, settings}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const isMobile = useMediaQuery("(max-width:900px)");

    const settingsTable = {
        src: {
            settings: settings.src,
            show: !isMobile || activeRenderer === "src"            
        },
        ref: {
            settings: settings.ref,
            show: !isMobile || activeRenderer === "ref"
        },
        out: {
            settings: settings.out,
            show: !isMobile || activeRenderer === "out"
        }
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className='settings'>
            {Object.values(settingsTable).map(({settings, show}, i) => (
                <div
                    key={i}
                    className='settings-content'
                    style={{ display: show ? undefined : "none" }}
                >
                    <table className="settings-table">
                        <tbody> 
                            {(settings || []).map((el, i) =>
                                React.cloneElement(el, { key: el.key || i })
                            )}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}