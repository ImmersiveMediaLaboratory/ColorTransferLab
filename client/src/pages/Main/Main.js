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
import Requests from 'utils/utils_http';


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- CONSTRUCTOR
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {render: true, innerWidth: window.innerWidth, innerHeight: window.innerHeight};
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- Method "componentDidMount()" will be executed after this component is inserted into the DOM
    -------------------------------------------------------------------------------------------------------------*/
    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this))
        this.resize()
        //Requests.initConsole()
        // Requests.request_server_status();
        // Requests.request_available_methods();
        // Requests.request_available_metrics();
        // Requests.request_database_content()
    }

    resize() {
        this.setState({innerWidth: window.innerWidth, innerHeight: window.innerHeight})
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    render() {
        if(this.state.innerHeight < 720 || this.state.innerWidth < 1280) {
            return (<div id="error_message">ColorTransferLab requires a minimum resolution of 1280x720 pixels to function properly.</div>)
        }
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