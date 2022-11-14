/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas} from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import SysConf from "settings/SystemConfiguration"
import Axis from "rendering/Axis"
import PointCloud from "rendering/PointCloud"
import Console from 'pages/Console/Console';
import './Renderer.scss';
import Images from "constants/Images";


/* ----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Renderer(props) {
    const [enableUpdate, changeEnableupdate] = useState(0)
    const [grid, changeGrid] = useState(<gridHelper args={[20,20, 0x222222, 0x222222]}/>)
    const [axis, changeAxis] = useState(<Axis />)

    const ID = props.id;
    const DROPPABLE = props.droppable;
    const TITLE = props.title

    // Describes which data type is displayed
    // Possible values: ["Empty", "Image", "PointCloud"]
    var MODE = "Empty"

    const imageID = "renderer_image" + ID
    const innerImageID = "renderer_image_inner" + ID
    const renderCanvasID = "renderer_canvas" + ID
 
    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function drop_method(event) {
        event.preventDefault();
        var data = event.dataTransfer.getData('text');
        SysConf.execution_params[TITLE.toLowerCase()] = data
        var fil = data.split(":")
        var file_extension = fil[1].split(".")[1]

        if (file_extension == "obj" || file_extension == "ply") {
            // change MODE to "Pointcloud" because a pointcloud was dropped
            MODE = "PointCloud"

            var filename = "data/" + fil[0] + "/" + fil[1]
            var filename = SysConf.address + filename

            SysConf.meshes[TITLE.toLowerCase()].pop()
            SysConf.meshes[TITLE.toLowerCase()].push(<PointCloud key={Math.random()} file_path={filename} from_image={false}/>)
            
            changeEnableupdate(Math.random())

            var renderersrc_image = document.getElementById(imageID)
            renderersrc_image.style.visibility = "hidden"; 
            var Renderer_renderer_canvas = document.getElementById(renderCanvasID)
            Renderer_renderer_canvas.style.visibility = "visible";
        } else if(file_extension == "png" || file_extension == "jpg") {
            // change MODE to "Image" because an image was dropped
            MODE = "Image"

            var Renderer_renderer_canvas = document.getElementById(renderCanvasID)
            var renderersrc_image_inner = document.getElementById(innerImageID)
            var renderersrc_image = document.getElementById(imageID)

            // change the visibility of the image canvas only if the RGB color space button is not checked
            var rgb_colorspace_button = document.getElementById("settings_rgbcolorspace")
            if(!rgb_colorspace_button.checked){
                Renderer_renderer_canvas.style.visibility = "hidden";
                renderersrc_image.style.visibility = "visible"; 
            }

            var image_path = SysConf.address + "data/" + fil[0] + "/" + fil[1]
            renderersrc_image_inner.src = image_path

            // Add 3D color histogram
            // Has to be done within the onload functions because images are loaded asynchronously
            const img = new Image()
            img.onload = () => {
                SysConf.meshes[TITLE.toLowerCase()].pop()
                SysConf.meshes[TITLE.toLowerCase()].push(<PointCloud key={Math.random()} 
                                                                          file_path={SysConf.address + "data/PointClouds/template.ply"} 
                                                                          from_image={true}
                                                                          image={img}/>)
                changeEnableupdate(Math.random())
            }
            img.crossOrigin = "Anonymous";
            img.src = image_path
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function handleClickPlay(e) {
        if (SysConf.execution_params["source"] != "" && SysConf.execution_params["reference"] != "" && SysConf.execution_params["approach"] != "") {
            Console.consolePrint("INFO", "Apply " + SysConf.execution_params["approach"])
            apply_color_transfer()
        } else {
            Console.consolePrint("WARNING", "Input selection incomplete or no color transfer approach selected")
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function show3DColorHistogram(e){
        var button_enabled = e.target.checked
        var renderersrc_image = document.getElementById(imageID)
        var Renderer_renderer_canvas = document.getElementById(renderCanvasID)

        if(MODE == "Image") {
            if(button_enabled) {
                renderersrc_image.style.visibility = "hidden"; 
                Renderer_renderer_canvas.style.visibility = "visible";
            } else {
                renderersrc_image.style.visibility = "visible"; 
                Renderer_renderer_canvas.style.visibility = "hidden";
            }
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const apply_color_transfer = () => {
        try {
            var renderer_canvas = document.getElementById("renderer_canvas" + "renderer_out")
            var renderer_image = document.getElementById("renderer_image" + "renderer_out")
            var renderer_image_inner = document.getElementById("renderer_image_inner" + "renderer_out")
            renderer_canvas.style.visibility = "hidden";
            renderer_image.style.visibility = "visible";
            renderer_image_inner.src = Images.gif_loading

            const xmlHttp = new XMLHttpRequest();
            const theUrl = SysConf.address + "color_transfer";
            xmlHttp.open( "POST", theUrl, true );

            // output file has to be saved with a random name, otherwise the browser loads the cached object
            var rankey = Math.random().toString().replace(".", "-")


            xmlHttp.onload = function (e) {
                if (xmlHttp.readyState === 4) {
                    console.log("A")
                  if (xmlHttp.status === 200) {
                    console.log("B")
                    var stat = xmlHttp.responseText.replaceAll("\'", "\"");
                    var stat_obj = JSON.parse(stat);
                    console.log(stat_obj["enabled"])
                    console.log(typeof stat_obj["enabled"]);

                    var isTrueSet = (stat_obj["enabled"] === 'true');

                    if(!isTrueSet) {
                        console.log("ERROR")
                        var renderer_canvas = document.getElementById("renderer_canvas" + "renderer_out")
                        var renderer_image = document.getElementById("renderer_image" + "renderer_out")
                        renderer_image.style.visibility = "hidden";
                        renderer_canvas.style.visibility = "visible";
                        Console.consolePrint("ERROR", stat_obj["data"]["message"])
                    }
                    else {


                        var output_extension = stat_obj["data"]["extension"]
                        var renderer_canvas = document.getElementById("renderer_canvas" + "renderer_out")
                        var renderer_image = document.getElementById("renderer_image" + "renderer_out")
            
                        if (output_extension == "ply" || output_extension == "obj") {        
                            renderer_image.style.visibility = "hidden";
                            renderer_canvas.style.visibility = "visible";
                            MODE = "PointCloud"
                            var filename = SysConf.address + "data/Output/" + rankey + ".ply" 
                            SysConf.execution_params["output"] = "/Output:" + rankey + ".ply"
                            SysConf.meshes[TITLE.toLowerCase()].pop()
                            SysConf.meshes[TITLE.toLowerCase()].push(<PointCloud key={rankey} file_path={filename}/>)
                            changeEnableupdate(rankey)
                        } else if (output_extension == "png" || output_extension == "jpg") {
                            renderer_canvas.style.visibility = "hidden";
                            renderer_image.style.visibility = "visible"; 
                            MODE = "Image"
                            var renderer_image_inner = document.getElementById("renderer_image_inner" + "renderer_out")
                            var image_path = SysConf.address + "data/Output/" + rankey + ".jpg"
                            SysConf.execution_params["output"] = "/Output:" + rankey + ".jpg"
                            renderer_image_inner.src = image_path

                            // Add 3D color histogram
                            // Has to be done within the onload functions because images are loaded asynchronously
                            const img = new Image()
                            img.onload = () => {
                                SysConf.meshes[TITLE.toLowerCase()].pop()
                                SysConf.meshes[TITLE.toLowerCase()].push(<PointCloud key={Math.random()} 
                                                                                                file_path={"http://localhost:8001/data//PointClouds/table.ply"} 
                                                                                                from_image={true}
                                                                                                image={img}/>)
                                changeEnableupdate(Math.random())
                            }
                            img.crossOrigin = "Anonymous";
                            img.src = image_path
                        }


                        // Change histogram of output
                        // TODO Has to be moved to ColorHistogram.js
                        //########################################################################################
                        //########################################################################################
                        
                        try {
                            const xmlHttp = new XMLHttpRequest();
                            const theUrl = SysConf.address + "color_histogram";
                            xmlHttp.open( "POST", theUrl, false );

                            if (output_extension == "ply" || output_extension == "obj")
                                var out_dat = "Output:" + rankey + ".ply"
                            else
                                var out_dat = "Output:" + rankey + ".jpg"

                            console.log(out_dat)
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

                            var c = document.getElementById("canvasout_histogram");
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
                        
                        //########################################################################################
                        //########################################################################################
                    }

                  } else {
                    console.error(xmlHttp.statusText);
                  }
                }
              };
              xmlHttp.onerror = function (e) {
                console.error(xmlHttp.statusText);
              };
              xmlHttp.onloadend = function (e) {
                changeEnableupdate(Math.random())
              };


            var out_dat = {
                "source": SysConf.execution_params["source"],
                "reference": SysConf.execution_params["reference"],
                "output": rankey,
                "approach": SysConf.execution_params["approach"],
                "options": SysConf.execution_params["options"]
            }

            xmlHttp.send(JSON.stringify(out_dat));
        } catch (e) {
            console.log(e)
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    useEffect(() => {
        if(DROPPABLE) {
            var renderer_source = document.getElementById(ID)
            renderer_source.addEventListener("dragover", (event) => {
                event.preventDefault();
            });
    
            renderer_source.addEventListener("drop", drop_method);
        } else {
            var console_play_button = document.getElementById("console_play_button")
            console_play_button.addEventListener("click", handleClickPlay);
        }

        var color_space_button = document.getElementById("settings_rgbcolorspace")
        color_space_button.addEventListener("change", show3DColorHistogram);
 
        var settings_grid = document.getElementById("settings_grid")
        settings_grid.addEventListener("change", (event) => {
            if(event.target.checked) {changeGrid(<gridHelper args={[20,20, 0x222222, 0x222222]}/>)}
            else {changeGrid(null)}
        });

        var settings_axis = document.getElementById("settings_axis")
        settings_axis.addEventListener("change", (event) => {
            if(event.target.checked) {changeAxis(<Axis />)}
            else {changeAxis(null)}
        });
    }, []);

    return(
        <div id={ID}>
            <div className="renderer_title">{TITLE}</div>
            <div id={imageID} className="renderer_image"><
                img id={innerImageID} className="renderer_image_inner"/>
                </div>
            <Canvas id={renderCanvasID}>
                <ambientLight />
                <PerspectiveCamera position={[2, 2, 2]} makeDefault />
                <OrbitControls />
                {grid}
                {axis}
                <Suspense fallback={null}>
                    {<group>{SysConf.meshes[TITLE.toLowerCase()]}</group>}
                </Suspense>
            </Canvas>
        </div>
    );
}


/* ----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
Renderer.defaultProps = {
    droppable: true
}

export default Renderer;