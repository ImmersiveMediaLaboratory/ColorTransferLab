/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {useState, useEffect} from 'react';
import $ from 'jquery';

import Header from './../Header/Header'
import Footer from './../Footer/Footer'
import SideBarLeft from '../SideBarLeft/SideBarLeft';
import SideBarRight from '../SideBarRight/SideBarRight';
import Console from '../Console/Console';
import Body from '../Body/Body';
import {consolePrint} from 'pages/Console/Terminal'
import './Main.scss';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import * as THREE from 'three';

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- CONSTRUCTOR
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Main(props) {
    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- STATES
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/
    const [width, setWidth] = useState(window.innerWidth);
    const [darkmode, setDarkmode] = useState(true);
    const [mobileLandscape, setMobileLandscape] = useState(false);

    const [singleView, setSingleView] = useState(false)
    //const didMount = useRef(false)


    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- HOOKS
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    /*-------------------------------------------------------------------------------------------------------------
    -- Method "componentDidMount()" will be executed after this component is inserted into the DOM
    -------------------------------------------------------------------------------------------------------------*/
    useEffect(() => {
        $( window ).on( "resize", function(){resize(); checkWindowSize();});

        const checkWindowSize = () => {
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);
            const isLandscape = window.innerWidth > window.innerHeight;
            //consolePrint("WARNING", "Land:" + isLandscape)
            //consolePrint("WARNING", "Mobile:" + isMobile)
            setMobileLandscape(isMobile && isLandscape);
        };
        checkWindowSize();

        // window.addEventListener('resize', checkWindowSize);

        // // Clean up the event listener when the component is unmounted
        // return () => {
        //     window.removeEventListener('resize', checkWindowSize);
        // };
    }, []);


    useEffect(() => {
        // if (didMount.current) {
        //     if(darkmode) {
        //         document.body.style.setProperty('--backgroundcolor', "#2B2C34");
        //         document.documentElement.style.setProperty('--backgroundcolor', '#FFFFFF');
        //         document.body.style.setProperty('--headercolor', "#1F2124");
        //         document.body.style.setProperty('--fontcolor', "#B4B4B8");
        //         // document.body.style.setProperty('--backgroundcolor', "green");
        //         // document.body.style.setProperty('--headercolor', "blue");
        //         // document.body.style.setProperty('--fontcolor', "red");

        //     } else {
        //         document.body.style.setProperty('--backgroundcolor', "#FFFFFF");
        //         document.documentElement.style.setProperty('--backgroundcolor', '#2B2C34');
        //         document.body.style.setProperty('--headercolor', "#B4B4B8");
        //         document.body.style.setProperty('--fontcolor', "#2B2C34");
        //         // document.body.style.setProperty('--backgroundcolor', "white");
        //         // document.body.style.setProperty('--headercolor', "yellow");
        //         // document.body.style.setProperty('--fontcolor', "pink");

        //     }
        //     console.log(getComputedStyle(document.documentElement).getPropertyValue('--backgroundcolor'))
        // } else {
        //     didMount.current = true;
        // }
    }, [darkmode]);
    
    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- FUNCTIONS
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/
    function resize() {
        //setHeight(window.innerHeight)
        setWidth(window.innerWidth)

        const doc = document.documentElement
        doc.style.setProperty('--app-height', `${window.innerHeight}px`)
    }



    // useEffect(() => {
    //     const renderWidth = 800;
    //     const renderHeight = 600;
        
    //     const rootElement = document.createElement('div');
    //     rootElement.style.width = renderWidth + 'px';
    //     rootElement.style.height = renderHeight + 'px';
    //     document.body.appendChild(rootElement);
        
    //     const renderer = new THREE.WebGLRenderer({
    //         antialias: false
    //     });
    //     renderer.setSize(renderWidth, renderHeight);
    //     rootElement.appendChild(renderer.domElement);
        
    //     const camera = new THREE.PerspectiveCamera(65, renderWidth / renderHeight, 0.1, 500);
    //     camera.position.copy(new THREE.Vector3().fromArray([-3.15634, -0.16946, -0.51552]));
    //     camera.up = new THREE.Vector3().fromArray([0, -1, -0.54]).normalize();
    //     camera.lookAt(new THREE.Vector3().fromArray([1.52976, 2.27776, 1.65898]));
        
    //         const viewer = new GaussianSplats3D.Viewer({
    //             'renderer': renderer,
    //             "camera": camera,
    //             'sphericalHarmonicsDegree': 2,
    //             'sharedMemoryForWorkers': false,
    //         });
    //         //viewer.addSplatScene('data/GaussianSplatting/$gaussiansplat$Tree/Tree.ply')
    //         viewer.addSplatScene('data/GaussianSplatting/$gaussiansplat$Garden/Garden.ksplat', {
    //             'progressiveLoad': false
    //           })
    //         .then(() => {
    //             requestAnimationFrame(update);
    //         })
    //         .catch(err => {
    //             console.error('Error loading splat scene:', err);
    //         });  
        
        
    //         function update() {
    //             requestAnimationFrame(update);
    //             viewer.update();
    //             viewer.render();
    //         }
    // }, []);


    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- RENDERING
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/
    return (
        <div id="mainbody">
            <Header darkmode={darkmode} toggleDarkmode={setDarkmode}/>
            <Console/>
            <Body width={width} singleView={singleView}/>
            <SideBarLeft/>
            <SideBarRight setSingleView={setSingleView}/>

            {mobileLandscape ? <div id="landscapeOverlay">Landscape mode is not supported!</div> : <></>}

            <Footer/>
        </div>
    );
    
}

export default Main;
