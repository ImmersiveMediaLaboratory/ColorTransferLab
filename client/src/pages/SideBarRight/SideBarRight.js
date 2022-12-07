/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/
import React from 'react';
import './SideBarRight.scss';
import Settings from './Settings'
import Database from './Database'
import Items from './Items'
import Objects from './Objects'


/* ----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class SideBarRight extends React.Component {
    constructor(props) {
      super(props);
      this.state = {render: true};
    }

    render() {
        return (
          <div id="SideBarRight_sidebarright">  
              <Database/> 
              <Items/> 
              {/* <Objects/>  */}
              <Settings/>
          </div>
        );
    }
  }

export default SideBarRight;