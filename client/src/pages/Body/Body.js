/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import './Body.scss';
import Renderer from './Renderer';

import Tabs from "../Tabs/Tabs";
import './TabsRendererRef.scss';
import SystemConfiguration from 'settings/SystemConfiguration';

class Body extends React.Component {
  constructor(props) {
    super(props);
    this.state = {render: true};
  }

  render() {
    return (
      <div id='Body_body'>
        <Renderer id="renderer_src" title="Source"/>

        <div id='rendererref_main'>
            <Tabs id="rendererref">
                <div label="Single Input" >
                    <div id="RendererRef_single_input">
                        <Renderer id="renderer_ref" title="Reference"/>
                    </div>
                </div>
                <div label="Multi Input">
                    <div id="RendererRef_test2">test2</div>
                </div>
                <div label="Color Theme">
                    <div id="RendererRef_test3">test3</div>
                </div>
                <div label="Comparison">
                    <div id="RendererRef_com">
                        <Renderer id="renderer_com" title="Comparison"/>
                    </div>
                </div>
            </Tabs>
        </div>

        <Renderer id="renderer_out" title="Output" droppable={false}/>
      </div>
    );
  }
}

export default Body;