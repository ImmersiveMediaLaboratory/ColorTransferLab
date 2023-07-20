/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, { useState, useEffect, Suspense, useRef} from 'react';
import './ColorHistogram.scss';
import SysConf from "settings/SystemConfiguration"
import Server from 'pages/SideBarLeft/Server';

/* ----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
--
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function ColorHistogram(props) {
    /* ------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [enableUpdate, changeEnableupdate] = useState(0)
    SysConf.colorHistogramStateChange[props.TITLE] = changeEnableupdate

    const notInitialRender = useRef(false)
    const ID = props.id
    const canvasID = "canvas" + ID
    const histogramstatsID = "histogramstats" + ID

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
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
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    useEffect(() => {
        var c = document.getElementById(canvasID);
        var ctx = c.getContext("2d");
        var imageData = ctx.createImageData(256, 100);
        for (let x = 0; x < 256; x++) {
            if(x % 64 == 0 && x != 0){
                for (let y=0; y < 100; y++){
                    setPixel(x, y, 256, 100, imageData.data, 128, 128, 128, "all")
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }, [])

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    useEffect(() => {
        // <notInitialRender> prevents the first execution of useEffect
        if (notInitialRender.current) {              
            try {
                const xmlHttp = new XMLHttpRequest();
                const theUrl = Server.active_server + "color_histogram";
                xmlHttp.open( "POST", theUrl, false );

                var out_dat = SysConf.execution_params[props.TITLE.toLowerCase()]

                xmlHttp.send(JSON.stringify(out_dat));
                var stat = xmlHttp.responseText.replaceAll("\'", "\"");
                var stat_obj = JSON.parse(stat);

                var histogram = stat_obj["data"]["histogram"]
                var mean = stat_obj["data"]["mean"]
                var std = stat_obj["data"]["std"]

                var maxV = Math.max.apply(null, histogram.map(function(row){ return Math.max.apply(Math, row); }))


                var histogram_scaled = []
                for(var i = 0; i < histogram.length; i++){
                    histogram_scaled[i] = [Math.floor(histogram[i][0]/maxV*100),
                                            Math.floor(histogram[i][1]/maxV*100),
                                            Math.floor(histogram[i][2]/maxV*100)];
                }

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
                }

                var c = document.getElementById(canvasID);
                var ctx = c.getContext("2d");
                c.height = 100

                var imageData = ctx.createImageData(256, 100);
                for (let x = 0; x < 256; x++) {
                    if(x % 64 == 0 && x != 0){
                        for (let y=0; y < 100; y++){
                            setPixel(x, y, 256, 100, imageData.data, 128, 128, 128, "all")
                        }
                    }

                    for (let y=0; y < histogram_scaled[x][0]; y++){
                        setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "red")
                    }
                    for (let y=0; y < histogram_scaled[x][1]; y++){
                        setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "green")
                    }
                    for (let y=0; y < histogram_scaled[x][2]; y++){
                        setPixel(x, y, 256, 100, imageData.data, 255, 0, 0, "blue")
                    }
                }
                ctx.putImageData(imageData, 0, 0);

                var stats_color = document.getElementById("histogramstatsout_histogram");
                stats_color.innerHTML = "Mean: (" + mean[0] + ", " + mean[1] + ", " + mean[2] + ") - " +
                                        "Std: (" + std[0] + ", " + std[1] + ", " + std[2] + ")"

            }
            catch (e) {
                console.log(e)
            }
        } else {
            notInitialRender.current = true
        }
    }, [enableUpdate])

    return(
        <div id={ID} className="color_histogram">
            <canvas id={canvasID} className="canvas" width="256" height="100"></canvas>
            <div id={histogramstatsID} className="histogram_stats">Mean: (0, 0, 0) - Std: (0, 0, 0)</div>
        </div>
    );

}

export default ColorHistogram;