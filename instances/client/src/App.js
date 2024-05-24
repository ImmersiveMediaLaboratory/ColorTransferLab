/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

//import logo from './logo.svg';
import './App.css';
import './settings/Global.scss';
import Main from './pages/Main/Main'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { useEffect, useState } from "react";


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