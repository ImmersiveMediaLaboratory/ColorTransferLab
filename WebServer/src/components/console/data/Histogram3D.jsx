/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Histogram3D.scss';
import {Suspense} from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Canvas} from "@react-three/fiber";
import {OrbitControls, PerspectiveCamera} from "@react-three/drei"
import Axes from "../../viewer/elements/Axes"
import { useSelection } from "@/contexts/SelectionContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** This component displays a 3D histogram for the loaded data.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Histogram3D({activeRenderer}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    
    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const isMobile = useMediaQuery("(max-width:900px)");

    const { selectedHistogram3D } = useSelection();

    const showRenderers = [
        {
            showRenderer: !isMobile || activeRenderer === "src",
            colorHistogram3D: selectedHistogram3D.src,
        },
        {
            showRenderer: !isMobile || activeRenderer === "ref",
            colorHistogram3D: selectedHistogram3D.ref,
        },
        {
            showRenderer: !isMobile || activeRenderer === "out",
            colorHistogram3D: selectedHistogram3D.out,
        }
    ];

    const grid = <gridHelper args={[20,20, 0x222222, 0x222222]}/>;
    const axis = <Axes/>;
    const camera = <PerspectiveCamera position={[-8, 8, 8]} makeDefault />;

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className='histogram3d-content'>
            {showRenderers.map((renderer, idx) => (
                <Canvas 
                    key={idx}
                    className='histogram3d-canvas'
                    style={{ display: renderer.showRenderer ? undefined : "none" }}
                >
                    <ambientLight/>
                    <OrbitControls />
                    {camera}
                    {grid}
                    {axis}
                    <Suspense fallback={null}>
                        {renderer.colorHistogram3D &&
                            <group>{renderer.colorHistogram3D}</group>
                        }
                    </Suspense>
                </Canvas> 
            ))}
        </div>
    );
}