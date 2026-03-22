/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Histogram.scss';
import {useEffect, useRef} from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSelection } from "@/contexts/SelectionContext";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Renders the histogram for the selected renderers. On desktop, all renderers are shown, 
 ** on mobile only the active renderer.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Histogram({activeRenderer="src"}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const canvasSrcRef = useRef(null);
    const canvasRefRef = useRef(null);
    const canvasOutRef = useRef(null);


    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const isMobile = useMediaQuery("(max-width:900px)");
    const { selectedHistogram2D } = useSelection();

    const showRenderers = [
        {
            showRenderer: !isMobile || activeRenderer === "src",
            colorHist: selectedHistogram2D.src,
            canvasRef: canvasSrcRef,
            histogramID: "histogram_canvas_src",
            histogramStatsID: "histogram_stats_src"
        },
        {
            showRenderer: !isMobile || activeRenderer === "ref",
            colorHist: selectedHistogram2D.ref,
            canvasRef: canvasRefRef,
            histogramID: "histogram_canvas_ref",
            histogramStatsID: "histogram_stats_ref"
        },
        {
            showRenderer: !isMobile || activeRenderer === "out",
            colorHist: selectedHistogram2D.out,
            canvasRef: canvasOutRef,
            histogramID: "histogram_canvas_out",
            histogramStatsID: "histogram_stats_out"
        }
    ];

    /**************************************************************************************************************
     ** Draws the histogram data onto the canvas.
     **************************************************************************************************************/
    const updateHistogram = (histogram, canvas) => {
        function findMaxIn2DArray(array) {
            let max = -Infinity;
            for (let i = 0; i < array.length; i++) {
                for (let j = 0; j < array[i].length; j++) {
                    if (array[i][j] > max) {
                        max = array[i][j];
                    }
                }
            }
            return max;
        }

        const maxV = findMaxIn2DArray(histogram)
        var histogram_scaled = []
        for(var i = 0; i < histogram.length; i++)
            histogram_scaled[i] = [Math.floor(histogram[i][0]/maxV*100), Math.floor(histogram[i][1]/maxV*100), Math.floor(histogram[i][2]/maxV*100)];

        var ctx = canvas.getContext("2d");
        canvas.height = 100

        var imageData = ctx.createImageData(256, 100);
        for (let x = 0; x < 256; x++) {
            if(x % 64 === 0 && x !== 0){
                for (let y=0; y < 100; y++){
                    setPixel(x, y, 256, 100, imageData.data, 128, 128, 128, "all")
                }
            }

            for (let y=0; y < histogram_scaled[x][0]; y++)
                setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "red")
            for (let y=0; y < histogram_scaled[x][1]; y++)
                setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "green")
            for (let y=0; y < histogram_scaled[x][2]; y++)
                setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "blue")
        }
        ctx.putImageData(imageData, 0, 0);
    }

    /**************************************************************************************************************
     ** Sets a pixel in the image data.
     **************************************************************************************************************/
    const setPixel = (x, y, w, h, image, r, g, b, val) => {
        if(val == "all") {
            image[(x + (h-y) * w) * 4 + 0] = r;
            image[(x + (h-y) * w) * 4 + 1] = g;
            image[(x + (h-y) * w) * 4 + 2] = b;
        } else if (val == "red")
            image[(x + (h-y) * w) * 4 + 0] = r; 
        else if (val == "green")
            image[(x + (h-y) * w) * 4 + 1] = r; 
        else if (val == "blue")
            image[(x + (h-y) * w) * 4 + 2] = r;
    
        image[(x + (h-y) * w) * 4 + 3] = 255;
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** HOOKS
     **************************************************************************************************************
     **************************************************************************************************************/

    /**************************************************************************************************************
     ** Draws the grid on the histogram canvases once on mount.
     **************************************************************************************************************/
    useEffect(() => {
        const canvasRefs = [canvasSrcRef, canvasRefRef, canvasOutRef];
        for(let i = 0; i < canvasRefs.length; i++){
            const c = canvasRefs[i]?.current;
            if (!c) continue;
            const ctx = c.getContext("2d");
            const imageData = ctx.createImageData(256, 100);
            for (let x = 0; x < 256; x++) {
                if(x % 64 === 0 && x !== 0){
                    for (let y=0; y < 100; y++){
                        setPixel(x, y, 256, 100, imageData.data, 128, 128, 128, "all")
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }
    }, []);

    /**************************************************************************************************************
     ** Update the drawn histograms whenever the histogram data changes.
     **************************************************************************************************************/
    useEffect(() => {
        {showRenderers.map((renderer) => {
            if(renderer.colorHist?.histogram)
                updateHistogram(renderer.colorHist.histogram, renderer.canvasRef.current);
        })}
    }, [selectedHistogram2D]);

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className='histogram-content'>
            {showRenderers.map((renderer, idx) => (
                <div
                    key={idx}
                    className='histogram-color'
                    style={{ display: renderer.showRenderer ? undefined : "none" }}
                >
                    <canvas
                        id={renderer.histogramID}
                        ref={renderer.canvasRef}
                        className="histogram-canvas"
                        width="256"
                        height="100"
                    />
                    <div   
                        id={renderer.histogramStatsID}                             
                        className="histogram-stats"
                    >
                        Mean: ({renderer.colorHist?.mean[0]}, {renderer.colorHist?.mean[1]}, {renderer.colorHist?.mean[2]}) <br/> Std: ({renderer.colorHist?.stdDev[0]}, {renderer.colorHist?.stdDev[1]}, {renderer.colorHist?.stdDev[2]})
                    </div>
                </div>
            ))}
        </div>
    );
}