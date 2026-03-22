/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./Searchbar.scss";
import SearchIcon from '@mui/icons-material/Search';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Search bar for filtering the file tree.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Searchbar({search, setSearch}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="searchbar">
            <SearchIcon className="searchbar-icon"/>
            <input
                className="searchbar-input"
                type="text"
                placeholder="Search files or folders..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
    );
}