/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/


import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Main from './pages/Main/Main'
import './settings/Global.scss';


/******************************************************************************************************************
 ******************************************************************************************************************
 ** Entry point of the application.
 ******************************************************************************************************************
 ******************************************************************************************************************/
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/ColorTransferLab" exact element={<Main/>} />
            </Routes>
        </Router>
    );
}

export default App;

export const history = createBrowserHistory({
    basename: process.env.PUBLIC_URL
});