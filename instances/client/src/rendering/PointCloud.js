/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

/*
Reference for point cloud rendering: https://codesandbox.io/p/sandbox/points-ldpyw8?file=%2Fsrc%2Findex.js%3A14%2C12-14%2C56
*/

import React, {useMemo, useRef, useEffect, useState, forwardRef, useImperativeHandle} from 'react';
import {BufferAttribute} from "three";
import {useFrame} from "@react-three/fiber";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import * as THREE from 'three'
import PointShader from "shader/PointShader"
import { updateHistogram } from 'Utils/Utils';
import $ from 'jquery';


/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
const PointCloud = forwardRef((props, ref) => {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
    const [state, setState] = useState({
        pointsize: 1,
        colornormal: false,
        colordistribution: false,
        colorhistogram: false,
        info: {
            "#Vertices": 0
        }
    });

    const [complete, setComplete] = useState(false)

    let coords = useRef(new Float32Array(0))
    let normals = useRef(new Float32Array(0))
    let colors = useRef(new Float32Array(0))
    let position = useRef(new THREE.Vector3(0,0,0))
    let scaling = useRef(1.0)
    let center = useRef(new THREE.Vector3(0,0,0))
    let refPoints = useRef()
    const histogram3D = useRef([]);

    const vertexShader = PointShader.vertexShader
    const fragmentShader = PointShader.fragmentShader

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useImperativeHandle(ref, () => ({
        getState() {
            return state;
        },
        updateState(newState) {
            setState(prevState => ({
                ...prevState,
                ...newState,
            }));
        },
    }));

    /**************************************************************************************************************
     * Update the point size, color normal and color distribution each frame.
     **************************************************************************************************************/
    useFrame(() => {
        if(complete && refPoints.current) {
            refPoints.current.material.uniforms.pointsize = {value: state.pointsize}
            refPoints.current.material.uniforms.enableNormalColor = {value: state.colornormal}
            refPoints.current.material.uniforms.enableColorDistribution = {value: state.colordistribution}
        }
    })

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    let data = useMemo(
        () => ({
          uniforms: {
            Ka: { value: new THREE.Vector3(1, 1, 1) },
            Kd: { value: new THREE.Vector3(1, 1, 1) },
            Ks: { value: new THREE.Vector3(1, 1, 1) },
            LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
            LightIntensity: { value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
            LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
            Shininess: { value: 1.0 }
          },
          vertexShader,
          fragmentShader,
          
        }),
        []
    )

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    useEffect(() => {
        const loader = new PLYLoader();
        // load a resource
        loader.load(
            // resource URL
            props.file_path,
            // called when resource is loaded
            function ( obj ) {
                // calculate scaling factor to fit object into unit cube
                var boundingBox = new THREE.Box3();
                obj.computeBoundingBox();
                boundingBox.copy( obj.boundingBox );
            
                center.current = new THREE.Vector3(boundingBox.min.x + (boundingBox.max.x - boundingBox.min.x ) / 2.0, 
                                               boundingBox.min.y + (boundingBox.max.y - boundingBox.min.y ) / 2.0, 
                                               boundingBox.min.z + (boundingBox.max.z - boundingBox.min.z ) / 2.0)
            
                var radius = (obj.boundingBox.max.y - obj.boundingBox.min.y ) / 2.0

                position.current = new THREE.Vector3(-center.current.x*scaling.current, -center.current.y*scaling.current + 1.0, -center.current.z*scaling.current)
                scaling.current = 1.0 / radius

                let coord_buf = new Float32Array(obj.attributes.position.array)
                coords.current = new BufferAttribute(coord_buf, 3);
                let normals_buf = new Float32Array(obj.attributes.normal.array)
                normals.current = new BufferAttribute(normals_buf, 3);
                let colors_buf = new Float32Array(obj.attributes.color.array)
                colors.current = new BufferAttribute(colors_buf, 3);
                console.log(colors.current)

                setState(prevState => ({
                    ...prevState,
                    info: {
                        ...prevState.info,
                        "#Vertices": coord_buf.length / 3
                    }
                }));

                // Skalieren der Farbwerte von 0-1 auf 0-255
                // Berechnung des Mittelwerts und der Standardabweichung für jeden Kanal
                const { mean, stdDev } = calculateMeanAndStdDev(colors.current.array);

                // set the histogram data for 2D and 3D rendering
                const histograms = calculateColorHistograms(colors.current.array)
                const histogram2D = histograms[0]
                histogram3D.current = histograms[1]
                updateHistogram(histogram2D, mean, stdDev, props.view)

                // Resets the progress bar after loading is complete
                $(`#${props.renderBar}`).css("width", "0%")
                setComplete(true)
                props.setGLOComplete(Math.random())
                
            },
            // called when loading is in progresses
            function ( xhr ) {
                var progress = ( xhr.loaded / xhr.total * 100 );
                //setLoaded(progress)calc(100% - 2px)
                $(`#${props.renderBar}`).css("width", progress.toString() + "%")
            },
            // called when loading has errors
            function ( error ) {
                console.log(error)
                console.log( 'An error happened' );

            }
        );
    }, [])

    /**************************************************************************************************************
     **************************************************************************************************************
     ** FUNCTIONS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    function calculateMeanAndStdDev(colorsArray) {
        const r = [], g = [], b = [];
        for (let i = 0; i < colorsArray.length; i += 3) {
            r.push(colorsArray[i] * 255);
            g.push(colorsArray[i + 1] * 255);
            b.push(colorsArray[i + 2] * 255);
        }
    
        const calculateStats = (array) => {
            const sum = array.reduce((acc, value) => acc + value, 0);
            const mean = Math.round(sum / array.length);
    
            const squaredDifferences = array.map(value => Math.pow(value - mean, 2));
            const meanSquaredDifference = squaredDifferences.reduce((acc, value) => acc + value, 0) / array.length;
            const stdDev = Math.round(Math.sqrt(meanSquaredDifference));
    
            return { mean, stdDev };
        };
    
        const rStats = calculateStats(r);
        const gStats = calculateStats(g);
        const bStats = calculateStats(b);
    
        return {
            mean: [rStats.mean, gStats.mean, bStats.mean],
            stdDev: [rStats.stdDev, gStats.stdDev, bStats.stdDev]
        };
    }
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const calculateColorHistograms = (colorsArray) => {
        // create a histogram of colors for rendering in the histogram tab of the console
        const histogram = new Array(256).fill(null).map(() => new Array(3).fill(0));
        // Initialisieren Sie ein 3D-Array für die Bins
        const bins = new Array(10).fill(null).map(() => 
            new Array(10).fill(null).map(() => 
                new Array(10).fill(0)
            )
        );

        // Initialisieren Sie eine Variable für den maximalen Wert
        let maxValue = 0;
        for (let i = 0; i < colorsArray.length; i += 3) {
            const r = Math.min(Math.max(Math.round(colorsArray[i] * 255), 0), 255);
            const g = Math.min(Math.max(Math.round(colorsArray[i+1] * 255), 0), 255);
            const b = Math.min(Math.max(Math.round(colorsArray[i+2] * 255), 0), 255);
            histogram[r][0]++;
            histogram[g][1]++;
            histogram[b][2]++;

            // Bestimmen Sie die Bin-Indizes
            const rBin = Math.min(Math.floor(colorsArray[i] * 10), 9);
            const gBin = Math.min(Math.floor(colorsArray[i+1] * 10), 9);
            const bBin = Math.min(Math.floor(colorsArray[i+2] * 10), 9);

            // Erhöhen Sie die Zählung für das entsprechende Bin
            bins[rBin][gBin][bBin]++;
            if (bins[rBin][gBin][bBin] > maxValue) {
                maxValue = bins[rBin][gBin][bBin];
            }
        }

        // volume of largest sphere
        let maxVolume = 4/3 * Math.PI * Math.pow(0.5, 3)
        let spheres = []
        
        for (let r = 0; r < 10; r++) {
            for (let g = 0; g < 10; g++) {
                for (let b = 0; b < 10; b++) {
                    if (bins[r][g][b] > 0) {
                        const color = new THREE.Color(r / 10 + 0.05, g / 10 + 0.05, b / 10 + 0.05);


                        // 0.05 is added to the color values to place the sphere in the center of the bin
                        // Each bin has a size of 0.1.
                        const position = new THREE.Vector3((r / 10 + 0.05) * 4, (g / 10 + 0.05) * 4, (b / 10 + 0.05) * 4) ;
                        // caluculate radius of sphere based on the scaled volume of the sphere
                        const radius = Math.pow(bins[r][g][b] / maxValue  * maxVolume / Math.PI * 3/4, 1/3);
                        const scale = Math.max(radius / 10 * 4 * 2, 0.05)//bins[r][g][b] / maxValue / 10 * 4; // Skalierung, damit die größte Kugel das gesamte Bin ausfüllt

                        spheres.push(
                            <mesh key={`${r}-${g}-${b}`} position={position} scale={[scale, scale, scale]}>
                                <sphereGeometry args={[0.5, 32, 32]} />
                                <meshStandardMaterial color={color} />
                            </mesh>
                        );
                    }
                }
            }
        }

        return [histogram, spheres];
    }

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    if(!complete) {
        return (
            <group position={[0,0,0]} scale={1}/>
        )
    } else {
        return(
            <>
            {state.colorhistogram ? (
                <group> 
                    {histogram3D.current}
                </group>
            ) : (
                <points 
                    key={Math.random} 
                    ref={refPoints} 
                    {...(state.colordistribution ? {} : { position: position.current, scale: scaling.current })}
                >
                    <bufferGeometry>
                        <bufferAttribute attach={"attributes-position"} {...coords.current} />
                        <bufferAttribute attach={"attributes-normal"} {...normals.current} />
                        <bufferAttribute attach={"attributes-color"} {...colors.current} />
                    </bufferGeometry>
                    <shaderMaterial attach="material" {...data} />
                </points>
            )}
            </>
        );
    }
});

export default PointCloud;
