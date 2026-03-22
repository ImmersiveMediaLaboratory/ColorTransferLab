/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './ItemArea.scss'
import { useState } from 'react'

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ** 
 ** Renders the right item area containing the list of tests.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function ItemArea({ tests, ratings, metrics, onTestSelect, selectedTestIdx}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [collapsed, setCollapsed] = useState(false)

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const numMetrics = metrics.length;

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="itemarea">
            <div className="itemarea-toggle-button" onClick={() => setCollapsed(c => !c)}>
                <span className={`itemarea-arrow${collapsed ? ' collapsed' : ''}`} />
            </div>
            <div className={`itemarea-item-list${collapsed ? ' collapsed' : ''}`}>
                {tests && tests.length > 0 ? (
                  tests.map((test, idx) => (
                    <button
                      key={test.id || idx}
                      className={`itemarea-item${selectedTestIdx === idx ? ' selected' : ''}${Object.keys(ratings[test.set_id] || {}).length === numMetrics ? ' completed' : ''}`}
                      onClick={() => onTestSelect(idx)}
                    >
                      {`Test #${idx+1}`}
                    </button>
                  ))
                ) : (
                  <div className="item">No tests available</div>
                )}
            </div>
        </div>
    )
}