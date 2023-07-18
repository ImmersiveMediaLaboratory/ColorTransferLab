/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, { useState, useEffect, Suspense, useRef} from 'react';
import { Canvas} from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import SysConf from "settings/SystemConfiguration"
import Utils from "utils/Utils"
import Axis from "rendering/Axis"
import PointCloud from "rendering/PointCloud"
import ColorDistribution from "rendering/ColorDistribution"
import VoxelGrid from "rendering/VoxelGrid"
import ColorHistogram from "rendering/ColorHistogram"
import Console from 'pages/Console/Console';
import './Renderer.scss';
import Images from "constants/Images";

/* ----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Renderer windows for (1) Source, (2) Reference, (3) Output and (4) Comparison
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Renderer(props) {
    /* ------------------------------------------------------------------------------------------------------------
    -- STATE VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const [enableUpdate, changeEnableupdate] = useState(0)
    const [grid, changeGrid] = useState(<gridHelper args={[20,20, 0x222222, 0x222222]}/>)
    const [axis, changeAxis] = useState(<Axis />)

    const ID = props.id;
    // Only Source, Reference and Comparison are droppable
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

            var filepath = SysConf.address + "data/" + fil[0] + "/" + fil[1]
            SysConf.data_config[TITLE]["filename"] = filepath
            SysConf.data_config[TITLE]["mesh"] = <PointCloud key={Math.random()} file_path={filepath} id={TITLE}/>

            getImageInformation("data/" + fil[0] + "/" + fil[1])

            SysConf.data_config[TITLE]["3D_color_distribution"] = <ColorDistribution key={Math.random()} 
                                                                    file_path={filepath} 
                                                                    from_image={false}
                                                                    id={TITLE}/>

            changeRendering(TITLE, "mesh")
            show3Dview(imageID, renderCanvasID)

        } else if(file_extension == "png" || file_extension == "jpg") {
            // change MODE to "Image" because an image was dropped
            MODE = "Image"

            var renderersrc_image_inner = document.getElementById(innerImageID)

            // change the visibility of the image canvas only if the RGB color space button is not checked
            var rgb_colorspace_button = document.getElementById("settings_rgbcolorspace")

            if(!rgb_colorspace_button.checked)
                show2Dview(imageID, renderCanvasID)
    
            var image_path = SysConf.address + "data/" + fil[0] + "/" + fil[1]
            renderersrc_image_inner.src = image_path

            getImageInformation("data" + fil[0] + "/" + fil[1])

            // Add 3D color Space
            // Has to be done within the onload functions because images are loaded asynchronously
            const img = new Image()
            img.onload = () => {
                SysConf.data_config[TITLE]["3D_color_distribution"] = <ColorDistribution key={Math.random()} 
                                                                            file_path={SysConf.address + "data/PointClouds/template.ply"} 
                                                                            from_image={true}
                                                                            image={img}
                                                                            id={TITLE}/>
                changeEnableupdate(Math.random())
            }
            img.crossOrigin = "Anonymous";
            img.src = image_path
        }

        // triggers the 2D color histogram to change
        SysConf.colorHistogramStateChange[TITLE](Math.random())
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function getImageInformation(object_path) {
        try {
            const xmlHttp = new XMLHttpRequest();
            const theUrl = SysConf.address + "object_info";
            xmlHttp.open( "POST", theUrl, true );

            xmlHttp.onload = function (e) {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {
                        var stat = xmlHttp.responseText.replaceAll("\'", "\"");
                        var stat_obj = JSON.parse(stat);
                        var eval_values = stat_obj["data"]["histogram"]
                        var voxelgrid_centers = stat_obj["data"]["voxelgrid_centers"]
                        var voxelgrid_colors = stat_obj["data"]["voxelgrid_colors"]
                        var voxelgrid_scale = stat_obj["data"]["scale"]
                        console.log(stat_obj["data"])
                        SysConf.data_config[TITLE]["3D_color_histogram"] = <ColorHistogram key={Math.random()} histogram={eval_values} />
                        SysConf.data_config[TITLE]["voxel_grid"] = <VoxelGrid key={Math.random()} 
                                                                    voxelgrid_centers={voxelgrid_centers}  
                                                                    voxelgrid_colors={voxelgrid_colors} 
                                                                    voxelgrid_scale={voxelgrid_scale}
                                                                    id={TITLE} />
                    } else {
                        console.error(xmlHttp.statusText);
                    }
                }
            };
            xmlHttp.onerror = function (e) {
                console.error(xmlHttp.statusText);
            };

            var out_dat = { "object_path": object_path}

            xmlHttp.send(JSON.stringify(out_dat));
        } catch (e) {
            console.log(e)
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
    function show3DColorDistribution(e){
        // if this method is called via the EventListener, <e> describes the event otherwise
        // <e> describes the checkbox
        if (typeof e.target !== 'undefined')
            var button_enabled = e.target.checked
        else
            var button_enabled = e.checked

        if(MODE == "Image") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_3dcolorhistogram", show3DColorHistogram)
                disableCheckbox("settings_voxelgrid", showVoxelGrid)
                show3Dview(imageID, renderCanvasID)
                changeRendering(TITLE, "3D_color_distribution")
            } else {
                show2Dview(imageID, renderCanvasID)
            }
        } else {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_3dcolorhistogram", show3DColorHistogram)
                disableCheckbox("settings_voxelgrid", showVoxelGrid)
                changeRendering(TITLE, "3D_color_distribution")
            } else {
                changeRendering(TITLE, "mesh")
            }
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function show3DColorHistogram(e){
        // if this method is called via the EventListener, <e> describes the event otherwise
        // <e> describes the checkbox
        if (typeof e.target !== 'undefined')
            var button_enabled = e.target.checked
        else
            var button_enabled = e.checked

        if(MODE == "Image") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_rgbcolorspace", show3DColorDistribution)
                disableCheckbox("settings_voxelgrid", showVoxelGrid)
                show3Dview(imageID, renderCanvasID)
                changeRendering(TITLE, "3D_color_histogram")
            } else {
                show2Dview(imageID, renderCanvasID)
            }
        }

        if(MODE == "PointCloud") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_rgbcolorspace", show3DColorDistribution)
                disableCheckbox("settings_voxelgrid", showVoxelGrid)
                changeRendering(TITLE, "3D_color_histogram")
            }               
            else
                changeRendering(TITLE, "mesh")
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function showVoxelGrid(e){
        // if this method is called via the EventListener, <e> describes the event otherwise
        // <e> describes the checkbox
        if (typeof e.target !== 'undefined')
            var button_enabled = e.target.checked
        else
            var button_enabled = e.checked

        if(MODE == "PointCloud") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_rgbcolorspace", show3DColorHistogram)
                disableCheckbox("settings_3dcolorhistogram", showVoxelGrid)
                changeRendering(TITLE, "voxel_grid")
            }
            else
                changeRendering(TITLE, "mesh")
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const apply_color_transfer = () => {
        try {
            var renderer_image_inner = document.getElementById("renderer_image_inner" + "renderer_out")
            show2Dview("renderer_image" + "renderer_out", "renderer_canvas" + "renderer_out")
            renderer_image_inner.src = Images.gif_loading

            const xmlHttp = new XMLHttpRequest();
            const theUrl = SysConf.address + "color_transfer";
            xmlHttp.open( "POST", theUrl, true );

            // output file has to be saved with a random name, otherwise the browser loads the cached object
            var rankey = Utils.getRandomID()

            xmlHttp.onload = function (e) {
                if (xmlHttp.readyState === 4) {
                  if (xmlHttp.status === 200) {
                    var stat = xmlHttp.responseText.replaceAll("\'", "\"");
                    var stat_obj = JSON.parse(stat);

                    var isTrueSet = (stat_obj["enabled"] === 'true');

                    if(!isTrueSet) {
                        show3Dview("renderer_image" + "renderer_out", "renderer_canvas" + "renderer_out")
                        Console.consolePrint("ERROR", stat_obj["data"]["message"])
                    }
                    else {
                        var output_extension = stat_obj["data"]["extension"]
            
                        if (output_extension == "ply" || output_extension == "obj") {    
                            show3Dview("renderer_image" + "renderer_out", "renderer_canvas" + "renderer_out")    
                            MODE = "PointCloud"
                            var filename = SysConf.address + "data/Output/" + rankey + ".ply" 
                            SysConf.execution_params["output"] = "/Output:" + rankey + ".ply"
                            SysConf.data_config[TITLE]["filename"] = filename 

                            getImageInformation("data/Output/" + rankey + ".ply" )

                            SysConf.data_config[TITLE]["mesh"] = <PointCloud key={rankey} file_path={filename} id={TITLE}/>

                            SysConf.data_config[TITLE]["3D_color_distribution"] = <ColorDistribution key={Math.random()} 
                                                                                    file_path={filename} 
                                                                                    from_image={false}
                                                                                    id={TITLE}/>

                            changeRendering(TITLE, "mesh")

                        } else if (output_extension == "png" || output_extension == "jpg") {
                            show2Dview("renderer_image" + "renderer_out", "renderer_canvas" + "renderer_out")
                            MODE = "Image"
                            var renderer_image_inner = document.getElementById("renderer_image_inner" + "renderer_out")
                            var image_path = SysConf.address + "data/Output/" + rankey + ".jpg"
                            SysConf.execution_params["output"] = "/Output:" + rankey + ".jpg"
                            renderer_image_inner.src = image_path

                            getImageInformation("data/Output/" + rankey + ".jpg")

                            // Add 3D color histogram
                            // Has to be done within the onload functions because images are loaded asynchronously
                            const img = new Image()
                            img.onload = () => {
                                SysConf.data_config[TITLE]["3D_color_distribution"] = <ColorDistribution key={Math.random()} 
                                                                                file_path={SysConf.address + "data/PointClouds/template.ply"} 
                                                                                from_image={true}
                                                                                image={img}
                                                                                id={TITLE}/>
                                // SysConf.data_config[TITLE]["3D_color_distribution"] = <PointCloud key={Math.random()} 
                                //                                                 file_path={SysConf.address + "data/PointClouds/template.ply"} 
                                //                                                 from_image={true}
                                //                                                 image={img} 
                                //                                                 id={TITLE}/>

                                changeEnableupdate(Math.random())
                            }
                            img.crossOrigin = "Anonymous";
                            img.src = image_path
                        }

                        
                        SysConf.colorHistogramStateChange["Output"](Math.random())
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
    ---------------------------------------------------------------------------------------------------------------
    -- HELPER METHODS
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    /* ------------------------------------------------------------------------------------------------------------
    -- Enables a given outputn type. Supported types are:
    -- (1) mesh
    -- (2) voxel_grid
    -- (3) 3D_color_distribution
    -- (4) 3D_color_histogram
    -------------------------------------------------------------------------------------------------------------*/
    function changeRendering(win, type) {
        SysConf.data_config[TITLE]["rendering"].pop()
        SysConf.data_config[TITLE]["rendering"].push(SysConf.data_config[win][type])
        changeEnableupdate(Math.random())
    }
    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function toggle2D3Dview(imageID, renderCanvasID) {
        var renderersrc_image = document.getElementById(imageID)
        var Renderer_renderer_canvas = document.getElementById(renderCanvasID)

        if(renderersrc_image.style.visibility == "visible") {
            renderersrc_image.style.visibility = "hidden"; 
            Renderer_renderer_canvas.style.visibility = "visible";
        } else {
            renderersrc_image.style.visibility = "visible"; 
            Renderer_renderer_canvas.style.visibility = "hidden";
        }
    }
    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function show3Dview(imageID, renderCanvasID) {
        var renderersrc_image = document.getElementById(imageID)
        var Renderer_renderer_canvas = document.getElementById(renderCanvasID)
        renderersrc_image.style.visibility = "hidden"; 
        Renderer_renderer_canvas.style.visibility = "visible";
    }
    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function show2Dview(imageID, renderCanvasID) {
        var renderersrc_image = document.getElementById(imageID)
        var Renderer_renderer_canvas = document.getElementById(renderCanvasID)
        renderersrc_image.style.visibility = "visible"; 
        Renderer_renderer_canvas.style.visibility = "hidden";
    }
    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function disableCheckbox(id, method) {
        var checkbox = document.getElementById(id, method)
        if(!checkbox.checked) method(checkbox)
        checkbox.checked = false;
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- Registration of EventListener
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
        color_space_button.addEventListener("change", show3DColorDistribution);

        var color_histogram_button = document.getElementById("settings_3dcolorhistogram")
        color_histogram_button.addEventListener("change", show3DColorHistogram);

        var voxel_grid_button = document.getElementById("settings_voxelgrid")
        voxel_grid_button.addEventListener("change", showVoxelGrid);
 
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
            <div id={imageID} className="renderer_image">
                <img id={innerImageID} className="renderer_image_inner"/>
            </div>
            <Canvas id={renderCanvasID}>
                <PerspectiveCamera position={[4, 4, 4]} makeDefault />
                <OrbitControls />
                {grid}
                {axis}
                <Suspense fallback={null}>
                    {<group>{SysConf.data_config[TITLE]["rendering"]}</group>}
                </Suspense>
            </Canvas>
        </div>
    );
}

/* ----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Allows dropping items on the renderer windows.
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
Renderer.defaultProps = {
    droppable: true
}

export default Renderer;