/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './ColorDistribution.scss';
import {Suspense, useMemo} from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Canvas} from "@react-three/fiber";
import {OrbitControls, PerspectiveCamera} from "@react-three/drei"
import Axes from "../../viewer/elements/Axes"
import * as THREE from "three";
import PointShader from '../../viewer/shader/PointShader.js';
import { useSelection } from "@/contexts/SelectionContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Renders the color distribution for the selected renderer.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function ColorDistribution({activeRenderer="src"}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const grid = <gridHelper args={[20,20, 0x222222, 0x222222]}/>;
    const axis = <Axes />;
    const camera = <PerspectiveCamera position={[-8, 8, 8]} makeDefault />;

    const isMobile = useMediaQuery("(max-width:900px)");

    const { selectedColorDistribution } = useSelection();


    const showRenderers = [
        {
            showRenderer: !isMobile || activeRenderer === "src",
            colorDistribution: selectedColorDistribution.src,

        },
        {
            showRenderer: !isMobile || activeRenderer === "ref",
            colorDistribution: selectedColorDistribution.ref,
        },
        {
            showRenderer: !isMobile || activeRenderer === "out",
            colorDistribution: selectedColorDistribution.out,
        }
    ];
    
    const vertexPointShader = PointShader.vertexShader
    const fragmentPointShader = PointShader.fragmentShader

    let data = useMemo(
        () => ({
          uniforms: {
            Ka: { value: new THREE.Vector3(1, 1, 1) },
            Kd: { value: new THREE.Vector3(1, 1, 1) },
            Ks: { value: new THREE.Vector3(1, 1, 1) },
            LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
            LightIntensity: { value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
            LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
            Shininess: { value: 1.0 },
            enableNormalColor: { value: false },
            enableColorDistribution: { value: true },
            pointsize: { value: 1.0}
          },
          vertexShader:vertexPointShader,
          fragmentShader:fragmentPointShader,
          
        }),
        []
    )

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/    
    return (
        <div className='colordistribution-content'>
            {showRenderers.map((renderer, idx) => (
                <Canvas
                    key={idx}
                    className={"colordistribution-canvas"}
                    style={{ display: renderer.showRenderer ? undefined : "none" }}
                >
                    <ambientLight/>
                    <OrbitControls />
                    {camera}
                    {grid}
                    {axis}
                    <Suspense fallback={null}>
                        {renderer.colorDistribution &&
                            <points
                                key={renderer.colorDistribution.id}
                            >
                                <bufferGeometry>
                                    <bufferAttribute attach={"attributes-position"} {...renderer.colorDistribution} />
                                    <bufferAttribute attach={"attributes-color"} {...renderer.colorDistribution} />
                                </bufferGeometry>
                                <shaderMaterial attach="material" args={[data]} />
                            </points>
                        }
                    </Suspense>
                </Canvas> 
            ))}
        </div>
    );
}