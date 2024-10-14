/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, {useMemo, useRef, useEffect, useState, forwardRef, useImperativeHandle} from 'react';
import {updateHistogram, loadTextureAndConvertToArray, calculateColorHistograms, calculateMeanAndStdDev} from 'Utils/Utils';
import {BufferAttribute} from 'three';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 ******************************************************************************************************************
 ******************************************************************************************************************/
const Image = forwardRef((props, ref) => {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/
     const [state, setState] = useState({
        greyscale: false,
        histogram3D: [],
        colordistribution: [],
        info: {
            "width": 0,
            "height": 0,
            "channels": 0
        }
    });

    const [imagePath, setImagePath] = useState(null)
    const [textureloaded, setTextureloaded] = useState(false)

    //const histogram3D = useRef([]);

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
     * 
     **************************************************************************************************************/
    useEffect(() => {
        setImagePath(props.filePath)
        if(props.filePath !== null){
            const textureUrl = props.filePath;
            loadTextureAndConvertToArray(textureUrl, (pixelArray, width, height, channels) => {
                console.log(textureUrl)
                console.log(pixelArray)
                // set the histogram data for 2D and 3D rendering
                const histograms = calculateColorHistograms(pixelArray, false, 4)
                const { mean, stdDev } = calculateMeanAndStdDev(pixelArray, false, 4);
                const histogram2D = histograms[0]

                //console.log(histogram3D.current)
                updateHistogram(histogram2D, mean, stdDev, props.view)

                let colors_buf = new Float32Array(pixelArray)
                // Entfernen jedes vierten Wertes aus colors_buf und Teilen der verbleibenden Werte durch 255
                const filteredColorsBuf = colors_buf
                    .filter((_, index) => (index + 1) % 4 !== 0)
                    .map(value => value / 255);

                //colors.current = new BufferAttribute(new Float32Array(filteredColorsBuf), 3);

                //histogram3D.current = histograms[1]
                setState(prevState => ({
                    ...prevState,
                    histogram3D: histograms[1],
                    colordistribution: new BufferAttribute(new Float32Array(filteredColorsBuf), 3),
                    info: {
                        width: width,
                        height: height,
                        channels: channels
                    }
                }));

                setTextureloaded(true)

            });
        }

    }, [props.filePath])

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div 
            className="image-container" 
            style={{
                overflow: "hidden", 
                width: "100%", 
                height: "100%", 
                display: props.visibility ? "block" : "none"
            }}
        >
            <img 
                //ref={imageRef} 
                id={props.innerid} 
                className="renderer_image_inner" 
                data-update={0}  
                data-src={imagePath}
                src={imagePath}
            />
        </div>
    );
})

export default Image;