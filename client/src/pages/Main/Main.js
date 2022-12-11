/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import Header from './../Header/Header'
import Footer from './../Footer/Footer'
import SideBarLeft from '../SideBarLeft/SideBarLeft';
import SideBarRight from '../SideBarRight/SideBarRight';
import Console from '../Console/Console';
import Body from '../Body/Body';
import './Main.scss';
import Requests from 'connection/utils_http';


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- CONSTRUCTOR
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {render: true};
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- Method "componentDidMount()" will be executed after this component is inserted into the DOM
    -------------------------------------------------------------------------------------------------------------*/
    componentDidMount() {
        Requests.initConsole()
        Requests.request_server_status();
        Requests.request_available_methods();
        Requests.request_available_metrics();
        Requests.request_database_content()
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    render() {
        return (
            <div>
                <Header/>
                <Console/>
                <SideBarLeft/>
                <SideBarRight/>
                <Footer/>
                <Body/>
            </div>
        );
    }
}

export default Main;