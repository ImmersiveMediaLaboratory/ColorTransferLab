/*
Copyright 2025 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

/*
Reference for point cloud rendering: https://codesandbox.io/p/sandbox/points-ldpyw8?file=%2Fsrc%2Findex.js%3A14%2C12-14%2C56
*/

import {useMemo, useRef, useEffect, useState} from 'react';
import {BufferAttribute} from "three";
import {useFrame} from "@react-three/fiber";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import * as THREE from 'three'
import PointShader from "../shader/PointShader"
import { calculateColorHistograms, calculateMeanAndStdDev } from '@/Utils/Utils';
import { useSelection } from "@/contexts/SelectionContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function PointCloud({rid, fileBlobURL, setObjInfo, pointSize, showPointNormals}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /* ------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [complete, setComplete] = useState(false)

    /* ------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const coords = useRef(new Float32Array(0))
    const normals = useRef(new Float32Array(0))
    const colors = useRef(new Float32Array(0))
    const position = useRef(new THREE.Vector3(0,0,0))
    const scaling = useRef(1.0)
    const refPoints = useRef()

    /* ------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const { setSelectedColorDistribution, setSelectedHistogram3D, setSelectedHistogram2D } = useSelection();

    let data = useMemo(
        () => ({
            uniforms: {
                Ka: { value: new THREE.Vector3(1, 1, 1) },
                Kd: { value: new THREE.Vector3(1, 1, 1) },
                Ks: { value: new THREE.Vector3(1, 1, 1) },
                LightIntensity: { value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
                LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
                Shininess: { value: 1.0 }
            },
            vertexShader: PointShader.vertexShader,
            fragmentShader: PointShader.fragmentShader, 
        }), []
    )

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     * Update the point size, color normal and color distribution each frame.
     **************************************************************************************************************/
    useFrame(() => {
        if(complete && refPoints.current) {
            refPoints.current.material.uniforms.pointsize = {value: pointSize}
            refPoints.current.material.uniforms.enableNormalColor = {value: showPointNormals}
        }
    })

    /**************************************************************************************************************
     * Load the point cloud from the provided file URL and set up the necessary buffers and histograms.
     **************************************************************************************************************/
    useEffect(() => {
        setComplete(false)
        const loader = new PLYLoader();
        // load a resource
        loader.load(
            // resource URL
            fileBlobURL,
            // called when resource is loaded
            function ( obj ) {
                // calculate scaling factor to fit object into unit cube
                var boundingBox = new THREE.Box3();
                obj.computeBoundingBox();
                boundingBox.copy( obj.boundingBox );
            
                let center = new THREE.Vector3(boundingBox.min.x + (boundingBox.max.x - boundingBox.min.x ) / 2.0, 
                                               boundingBox.min.y + (boundingBox.max.y - boundingBox.min.y ) / 2.0, 
                                               boundingBox.min.z + (boundingBox.max.z - boundingBox.min.z ) / 2.0)
            
                var radius = (obj.boundingBox.max.y - obj.boundingBox.min.y ) / 2.0

                position.current = new THREE.Vector3(-center.x*scaling.current, -center.y*scaling.current + 1.0, -center.z*scaling.current)
                scaling.current = 1.0 / radius

                let coord_buf = new Float32Array(obj.attributes.position.array)
                coords.current = new BufferAttribute(coord_buf, 3);
                let normals_buf = new Float32Array(obj.attributes.normal.array)
                normals.current = new BufferAttribute(normals_buf, 3);
                let colors_buf = new Float32Array(obj.attributes.color.array)
                colors.current = new BufferAttribute(colors_buf, 3);
                console.debug("INFO", "Loaded point cloud with " + coord_buf.length / 3 + " vertices.")

                setObjInfo({"#Vertices": coord_buf.length / 3})
                
                // Sacling the color values from 0-1 to 0-255
                // Calculate the mean and standard deviation for each channel
                const { mean, stdDev } = calculateMeanAndStdDev(colors.current.array, true, 3);

                // set the histogram data for 2D and 3D rendering
                const histograms = calculateColorHistograms(colors.current.array, true, 3);

                setSelectedHistogram3D(prev => ({
                    ...(prev || {}),
                    [rid]: histograms[1]
                }));

                setSelectedColorDistribution(prev => ({
                    ...(prev || {}),
                    [rid]: new BufferAttribute(new Float32Array(colors_buf), 3)
                }));

                setSelectedHistogram2D(prev => ({
                    ...(prev || {}),
                    [rid]: { histogram: histograms[0], mean, stdDev }
                }));

                window.dispatchEvent(new CustomEvent("webrtc:loadingProgress", {
                    detail: {
                        rid: rid,
                        status: "end",
                        progress: 100
                    }
                }));

                setComplete(true)
            },
            // called when loading is in progresses
            function ( xhr ) {
                window.dispatchEvent(new CustomEvent("webrtc:loadingProgress", {
                    detail: {
                        rid: rid,
                        status: "progress",
                        progress: ( xhr.loaded / xhr.total * 100 )
                    }
                }));
            },
            // called when loading has errors
            function ( error ) {
                console.debug("ERRO", 'An error happened: ', error );
            }
        );
    }, [fileBlobURL])
    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return complete && (
        <points
            ref={refPoints} 
            position={position.current} 
            scale={scaling.current}
        >
            <bufferGeometry>
                <bufferAttribute attach={"attributes-position"} {...coords.current} />
                <bufferAttribute attach={"attributes-normal"} {...normals.current} />
                <bufferAttribute attach={"attributes-color"} {...colors.current} />
            </bufferGeometry>
            <shaderMaterial attach="material" {...data} />
        </points>
    );
};