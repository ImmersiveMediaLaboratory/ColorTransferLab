/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import * as THREE from "three";
import {TextureLoader} from 'three';

/******************************************************************************************************************
 * 
 ******************************************************************************************************************/
export const getInitialValue = (key) => {
    // console.log("Getting initial value for key:", key);
    const savedValue = localStorage.getItem(key);
    // console.log("Retrieved value from localStorage:", savedValue);
    return savedValue ? JSON.parse(savedValue) : null;
};

/******************************************************************************************************************
 * Combines the given path elements to a single path.
 ******************************************************************************************************************/
export const pathjoin = (...vals) => {
    let joinedpath = "";
    let init = true;
    for (let val of vals) {
        let seperator = "/"
        // ignore empty strings
        if(val === "")
            continue
        // prevent adding a seperator at the beginning
        if(init)
            seperator = ""
        joinedpath  += seperator + val;
        init = false
    }
    return joinedpath;
}

/******************************************************************************************************************
 * Get a random ID.
 ******************************************************************************************************************/
export const getRandomID = () => {
    var rid = Math.random().toString().replace(".", "OUTPUT")
    return rid
}

/******************************************************************************************************************
 * 
 ******************************************************************************************************************/
// export const updateHistogram = (stat_obj, mean, std, window) => {
//     const setPixel = (x, y, w, h, image, r, g, b, val) => {
//         if(val === "all") {
//             image[(x + (h-y) * w) * 4 + 0] = r;
//             image[(x + (h-y) * w) * 4 + 1] = g;
//             image[(x + (h-y) * w) * 4 + 2] = b;
//         } else if (val === "red")
//             image[(x + (h-y) * w) * 4 + 0] = r; 
//         else if (val === "green")
//             image[(x + (h-y) * w) * 4 + 1] = r; 
//         else if (val === "blue")
//             image[(x + (h-y) * w) * 4 + 2] = r;
    
//         image[(x + (h-y) * w) * 4 + 3] = 255;
//     }

//     let canvasid = "histogram_canvas_" + window
//     let histostatsid = "histogram_stats_" + window
//     var histogram = stat_obj

//     function findMaxIn2DArray(array) {
//         let max = -Infinity;
//         for (let i = 0; i < array.length; i++) {
//             for (let j = 0; j < array[i].length; j++) {
//                 if (array[i][j] > max) {
//                     max = array[i][j];
//                 }
//             }
//         }
//         return max;
//     }

//     const maxV = findMaxIn2DArray(histogram)
//     var histogram_scaled = []
//     for(var i = 0; i < histogram.length; i++)
//         histogram_scaled[i] = [Math.floor(histogram[i][0]/maxV*100), Math.floor(histogram[i][1]/maxV*100), Math.floor(histogram[i][2]/maxV*100)];

//     var c = document.getElementById(canvasid);
//     var ctx = c.getContext("2d");
//     c.height = 100

//     var imageData = ctx.createImageData(256, 100);
//     for (let x = 0; x < 256; x++) {
//         if(x % 64 === 0 && x !== 0){
//             for (let y=0; y < 100; y++){
//                 setPixel(x, y, 256, 100, imageData.data, 128, 128, 128, "all")
//             }
//         }

//         for (let y=0; y < histogram_scaled[x][0]; y++)
//             setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "red")
//         for (let y=0; y < histogram_scaled[x][1]; y++)
//             setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "green")
//         for (let y=0; y < histogram_scaled[x][2]; y++)
//             setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "blue")
//     }
//     ctx.putImageData(imageData, 0, 0);

//     var stats_color = document.getElementById(histostatsid);
//     stats_color.innerHTML = "Mean: (" + mean[0] + ", " + mean[1] + ", " + mean[2] + ") <br/> " +
//                             "Std: (" + std[0] + ", " + std[1] + ", " + std[2] + ")"
// }

/**************************************************************************************************************
 * 
 **************************************************************************************************************/
export const calculateMeanAndStdDev = (colorsArray, normalized, channels) => {
    let scale = 1.0
    if(normalized)
        scale = 255.0

    const r = [], g = [], b = [];
    for (let i = 0; i < colorsArray.length; i += channels) {
        const rValue = colorsArray[i] * scale;
        const gValue = colorsArray[i + 1] * scale;
        const bValue = colorsArray[i + 2] * scale;
        let aValue = 255.0
        if(channels === 4){
            aValue = colorsArray[i + 3] * scale;
        }

        if (!isNaN(rValue) && !isNaN(gValue) && !isNaN(bValue) && aValue > 0) {
            r.push(rValue);
            g.push(gValue);
            b.push(bValue);
        }
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
export const calculateColorHistograms = (colorsArray, normalized, channels) => {
    // create a histogram of colors for rendering in the histogram tab of the console
    const histogram = new Array(256).fill(null).map(() => new Array(3).fill(0));
    // Initialise a 3D array for the bins
    const bins = new Array(10).fill(null).map(() => 
        new Array(10).fill(null).map(() => 
            new Array(10).fill(0)
        )
    );

    let scale = 255.0
    if(normalized)
        scale = 1.0

    // Initialisieren Sie eine Variable für den maximalen Wert
    let maxValue = 0;
    for (let i = 0; i < colorsArray.length; i += channels) {

        const rScale = colorsArray[i] / scale
        const gScale = colorsArray[i+1] / scale
        const bScale = colorsArray[i+2] / scale
        let aValue = 1.0

        if(channels === 4){
            aValue = colorsArray[i + 3] / scale;
        }

        const r = Math.min(Math.max(Math.round(rScale * 255), 0), 255);
        const g = Math.min(Math.max(Math.round(gScale * 255), 0), 255);
        const b = Math.min(Math.max(Math.round(bScale * 255), 0), 255);
        if (isNaN(r) || isNaN(g) || isNaN(b) || aValue === 0)
            continue

        histogram[r][0]++;
        histogram[g][1]++;
        histogram[b][2]++;

        // Determining the bin indices
        const rBin = Math.min(Math.floor(rScale * 10), 9);
        const gBin = Math.min(Math.floor(gScale * 10), 9);
        const bBin = Math.min(Math.floor(bScale * 10), 9);

        // Increase the count for the corresponding bin
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
                    // Sacling so that the largest sphere fills the entire bin
                    const scale = Math.max(radius / 10 * 4 * 2, 0.05)//bins[r][g][b] / maxValue / 10 * 4; 

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
 * Function to load a texture and convert it into an array.
 * Is used to create the 2D and 3D histograms.
 **************************************************************************************************************/
export const loadTextureAndConvertToArray = (url, callback) => {
    const loader = new TextureLoader();
    loader.load(
        url,
        (texture) => {
            // Create a canvas element
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Set the canvas size to the texture size
            canvas.width = texture.image.width;
            canvas.height = texture.image.height;

            // Draw the texture onto the canvas
            context.drawImage(texture.image, 0, 0);

            // Extract the pixel data from the canvas
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const pixelArray = imageData.data;

            // The amount of channels is 4 (RGBA) for a standard canvas
            const numberOfChannels = imageData.data.length / (canvas.width * canvas.height);

            // Call the callback function with the pixel array
            callback(pixelArray, canvas.width, canvas.height, numberOfChannels);
        },
        undefined,
        (error) => {
            console.error('Error loading texture:', error);
        }
    );
}