/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React, { useState, useEffect, Suspense, useRef} from 'react';
import $ from 'jquery';
import { VRButton, VRCanvas, ARButton, XR, Hands, DefaultXRControllers, XRButton} from '@react-three/xr'
import { Canvas} from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from "@react-three/drei";

import SysConf from "settings/SystemConfiguration"
import Axis from "rendering/Axis"
import PointCloud from "rendering/PointCloud"
import ColorDistribution from "rendering/ColorDistribution"
import ColorDistribution2 from "rendering/ColorDistribution2"
import VoxelGrid from "rendering/VoxelGrid"
import ColorHistogram from "rendering/ColorHistogram"
import TriangleMesh from "rendering/TriangleMesh"
import CustomCanvas from 'rendering/CustomCanvas';
import Terminal, { consolePrint } from 'pages/Console/Terminal';
import {active_server} from 'pages/SideBarLeft/Server'
import {updateHistogram} from 'pages/Console/ColorHistogram'
import {pathjoin, request_file_existence, server_request, server_post_request} from 'utils/Utils';
import {execution_params_objects} from 'pages/Console/Console'

import './Renderer.scss';
import { AmbientLight } from 'three';


let canv = null;

export const active_reference = "Single Input"

// Description of the <data_config> object
// rendering -> contains the current render object
export const data_config = {}
for(let renderer_obj of ["Source", "Reference", "Output"]) {
    data_config[renderer_obj] = {
        "filename": null,
        "rendering": [],
        "mesh": null,
        "3D_color_histogram": null,
        "3D_color_distribution": null,
        "voxel_grid": null,
        "pc_center": null,
        "pc_scale":null
    }
}

/* ------------------------------------------------------------------------------------------------------------
-- Shows either the 2D or 3D renderer
-------------------------------------------------------------------------------------------------------------*/
export const showView = (imageID, videoID, renderCanvasID, view) => {
    if(view === "3D") {
        $("#" + imageID).css("visibility", "hidden")
        $("#" + videoID).css("visibility", "hidden")
        $("#" + renderCanvasID).css("visibility", "visible")
        // stop the video if it is still running
        try {
            $("#" + videoID).children("video").get(0).pause();
        }
        catch (error) {
        }
    } else if(view === "video") {
        $("#" + imageID).css("visibility", "hidden")
        $("#" + videoID).css("visibility", "visible")
        $("#" + renderCanvasID).css("visibility", "hidden")
    } else {
        $("#" + imageID).css("visibility", "visible")
        $("#" + videoID).css("visibility", "hidden")
        $("#" + renderCanvasID).css("visibility", "hidden")
        // stop the video if it is still running
        try {
            $("#" + videoID).children("video").get(0).pause();
        }
        catch (error) {
        }
    }
}

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
    const [perspectiveView, setPerspectiveView] = useState(true)


    const [init, setInit] = useState(false)
    const [view, setView] = useState(null)

    /* ------------------------------------------------------------------------------------------------------------
    -- REFERENCED VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    // Describes which data type is displayed
    // Possible values: ["", "Image", "PointCloud", "Mesh"]
    const mode = useRef("")
    // stores object information like: width, height, etc. 
    const objInfo = useRef(null)
    const data = useRef("")
    // stores the current mesh or pointcloud
    const mesh = useRef([])
    // stores the mesh for the 3D color histogram
    const histogram3D = useRef(null)
    const colorDistribution3D = useRef(null)
    const object3D = useRef(null)
    const voxel3D = useRef(null)
    // stores pointcloud information for voxel rendering
    const ref_pc_center = useRef(null)
    const ref_pc_scale = useRef(null)



    const obj_path = useRef("xxx")
    const infoBoxEnabled = useRef(false)

    const icon_mesh_texture_button = "assets/icons/icon_mesh_texture.png";
    const icon_info_button = "assets/icons/icon_info2.png";
    const gif_loading = "assets/gifs/loading3.gif"

    const ID = props.id;
    const window = props.window;
    // Only Source, Reference and Comparison are droppable
    const DROPPABLE = props.droppable;
    const TITLE = props.title

    const imageID = "renderer_image" + ID
    const videoID = "renderer_video" + ID
    const innerImageID = "renderer_image_inner" + ID
    const innerVideoID = "renderer_video_inner" + ID
    const renderCanvasID = "renderer_canvas" + ID
    const infoboxID = "renderer_info" + ID
 

    const initPath = "data"

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function drop_method(event) {
        event.preventDefault();
        // E.g. data = /Meshes/GameBoy_medium:GameBoy_medium.obj
        // I.e. <path_to_file>:<file>
        var data = event.dataTransfer.getData('text');
        var [file_path, file_name_with_ext] = data.split(":")
        var [file_name, file_ext] = file_name_with_ext.split(".")

        updateRenderer(file_path, file_name, file_name_with_ext, file_ext)
    }
    function click_method(data) {
        // E.g. data = /Meshes/GameBoy_medium:GameBoy_medium.obj
        // I.e. <path_to_file>:<file>
        var [file_path, file_name_with_ext] = data.split(":")
        var [file_name, file_ext] = file_name_with_ext.split(".")

        updateRenderer(file_path, file_name, file_name_with_ext, file_ext)
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    function updateRenderer(file_path, file_name, file_name_with_ext, file_ext) {
        // inserts a loading screen before updating the image, because loading large images can take some time
        $("#" + innerImageID).attr("src", gif_loading)
        
        // check for object type
        // Images have the extensions "png" and "jpg"
        // Pointclouds have the extensions "obj" and "ply"
        // Meshes have the extension "obj" and a corresponding png texture has to exist
        if(file_ext === "png" || file_ext === "jpg") {
            mode.current = "Image"
            // change the visibility of the image canvas only if the RGB color space button is not checked
            if(!$("#settings_rgbcolorspace").checked)
                showView(imageID, videoID, renderCanvasID, "2D")

            // show the dropped image
            var image_path = pathjoin(active_server, initPath, file_path, file_name_with_ext)
            $("#" + innerImageID).attr("src", image_path)

            obj_path.current = pathjoin(file_path, file_name_with_ext)

        } else if(file_ext === "mp4") {
            mode.current = "Video"
            // change the visibility of the image canvas only if the RGB color space button is not checked
            if(!$("#settings_rgbcolorspace").checked)
                showView(imageID, videoID, renderCanvasID, "video")

            var video_path = pathjoin(active_server, initPath, file_path, file_name_with_ext)

            console.log(video_path)

            $("#" + innerVideoID).attr("src", video_path)

            obj_path.current = pathjoin(file_path, file_name_with_ext)

        } else if(file_ext == "obj" || file_ext == "ply") {
            // check if texture for mesh exists -> if not, it is a pointcloud
            console.log(pathjoin(active_server, initPath, file_path, file_name + ".png"))
            let texture_path = pathjoin(active_server, initPath, file_path, file_name + ".png")
            let file_exist = request_file_existence("HEAD", texture_path)
            if(file_exist) {
                mode.current = "Mesh"
                var filepath = pathjoin(active_server, initPath, file_path, file_name)
                obj_path.current = pathjoin(file_path, file_name_with_ext)
                object3D.current = <TriangleMesh key={Math.random()} file_name={filepath}></TriangleMesh>
                changeRendering(object3D.current)
                showView(imageID, videoID, renderCanvasID, "3D")

            } else {
                mode.current = "PointCloud"
                var filepath = pathjoin(active_server, initPath, file_path, file_name_with_ext)
                obj_path.current = pathjoin(file_path, file_name_with_ext)
                object3D.current = <PointCloud key={Math.random()} file_path={filepath} id={TITLE} center={ref_pc_center} scale={ref_pc_scale}/>
                changeRendering(object3D.current)
                //changeEnableupdate(Math.random())
                showView(imageID, videoID, renderCanvasID, "3D")
            }
        } else if(file_ext == "volu") {
            console.log("GEGE")
            console.log(pathjoin(active_server, initPath, file_path, file_name))
            let texture_path = pathjoin(active_server, initPath, file_path, file_name + "_00000.jpg")
            let file_exist = request_file_existence("HEAD", texture_path)


            let texture_path2 = pathjoin(active_server, initPath, file_path, file_name + "_00001.jpg")
            let file_exist2 = request_file_existence("HEAD", texture_path)
            if(file_exist && file_exist2) {
                mode.current = "VolumetricVideo"
                var filepath = pathjoin(active_server, initPath, file_path, file_name + "_00000")
                var filepath2 = pathjoin(active_server, initPath, file_path, file_name + "_00001")
                //obj_path.current = pathjoin(file_path, file_name_with_ext)
                //obj_path.current = pathjoin(file_path2, file_name_with_ext)
                var obj3D = <TriangleMesh key={Math.random()} file_name={filepath}></TriangleMesh>
                var obj3D2 = <TriangleMesh key={Math.random()} file_name={filepath2}></TriangleMesh>
                changeRendering2([obj3D, obj3D2])
                showView(imageID, videoID, renderCanvasID, "3D")

            }
        }

        //server_post_request(active_server, "color_distribution", pathjoin(initPath, file_path, file_name_with_ext), updateColorDistribution, window)
        //server_post_request(active_server, "color_histogram", pathjoin(initPath, file_path, file_name_with_ext), updateHistogram, window)
        //server_post_request(active_server, "object_info", pathjoin(initPath, file_path, file_name_with_ext), updateObjectInfo, null)
 
        // if the infobox is visible, disable and rerender it if a new object is loaded
        if(infoBoxEnabled.current) {
            infoBoxEnabled.current = false
            showObjectInfo()
        }

        // set the execution parameters
        execution_params_objects[window] = obj_path.current
    }
    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const updateColorDistribution = (data, parameters) => {
        var dist_vals = data["data"]["distribution"]
        let scaled_dist_vals = (dist_vals.flat()).map(function(x) { return x / 255.0; })
        colorDistribution3D.current = <ColorDistribution2 key={Math.random()} file_path={pathjoin(active_server, initPath, "PointClouds/template.ply")} dist_vals={scaled_dist_vals} id={TITLE}/>
    }


    /* ------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    const updateObjectInfo = (data, parameters) => {
        objInfo.current = data

        // set 3D color histogram
        var eval_values = data["data"]["histogram"]
        histogram3D.current = <ColorHistogram key={Math.random()} histogram={eval_values} />

        // set 3D voxel grid
        var voxelgrid_centers = data["data"]["voxelgrid_centers"]
        var voxelgrid_colors = data["data"]["voxelgrid_colors"]
        var voxelgrid_scale = data["data"]["scale"]
        voxel3D.current = <VoxelGrid key={Math.random()} 
                            voxelgrid_centers={voxelgrid_centers}  
                            voxelgrid_colors={voxelgrid_colors} 
                            voxelgrid_scale={voxelgrid_scale}
                            center={ref_pc_center}
                            scale={ref_pc_scale}/>
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

        if(mode.current == "Image") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_3dcolorhistogram", show3DColorHistogram)
                disableCheckbox("settings_voxelgrid", showVoxelGrid)
                showView(imageID, videoID, renderCanvasID, "3D")
                changeRendering(colorDistribution3D.current)
            } else {
                showView(imageID, videoID, renderCanvasID, "2D")
            }
        } else {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_3dcolorhistogram", show3DColorHistogram)
                disableCheckbox("settings_voxelgrid", showVoxelGrid)
                changeRendering(colorDistribution3D.current)
            } else {
                changeRendering(object3D.current)
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

        if(mode.current == "Image") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_rgbcolorspace", show3DColorDistribution)
                disableCheckbox("settings_voxelgrid", showVoxelGrid)
                showView(imageID, videoID, renderCanvasID, "3D")
                changeRendering(histogram3D.current)
            } else {
                showView(imageID, videoID, renderCanvasID, "2D")
            }
        }

        if(mode.current == "PointCloud" || mode.current == "Mesh") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_rgbcolorspace", show3DColorDistribution)
                disableCheckbox("settings_voxelgrid", showVoxelGrid)
                changeRendering(histogram3D.current)
            }               
            else
                changeRendering(object3D.current)
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

        if(mode.current == "PointCloud") {
            if(button_enabled) {
                // disable all the other checkboxes
                disableCheckbox("settings_rgbcolorspace", show3DColorHistogram)
                disableCheckbox("settings_3dcolorhistogram", showVoxelGrid)
                changeRendering(voxel3D.current)
            }
            else
                changeRendering(object3D.current)
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- HELPER METHODS
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    /* ------------------------------------------------------------------------------------------------------------
    -- Enables a given output type. Supported types are:
    -- (1) mesh
    -- (2) voxel_grid
    -- (3) 3D_color_distribution
    -- (4) 3D_color_histogram
    -------------------------------------------------------------------------------------------------------------*/
    // TODO: Reduce to one method
    function changeRendering(obj) {
        //mesh.current.pop()
        mesh.current.length = 0;
        mesh.current.push(obj)
        changeEnableupdate(Math.random())
        console.log(mesh.current[0])
    }

    function changeRendering2(objs) {
        //mesh.current.pop()
        mesh.current.length = 0;
        objs.forEach((obj) => {
            mesh.current.push(obj);
        });
        //mesh.current.push(obj)
        changeEnableupdate(Math.random())
        //console.log(mesh.current[0])
    }


    /* ------------------------------------------------------------------------------------------------------------
    -- Disables the checkbox with the given ID
    -------------------------------------------------------------------------------------------------------------*/
    function disableCheckbox(id, method) {
        let checkbox = $("#" + id)
        if(checkbox.prop("checked")) method(checkbox)
        checkbox.prop("checked", false);
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- Registration of EventListener
    -------------------------------------------------------------------------------------------------------------*/
    function observer_updateOutputRenderer(mutations) {
        let out_renderer = $("#renderer_image_innerrenderer_out")
        let pat = out_renderer.attr("data-src")
        let file_name_with_ext = pat.split("/").pop()
        let [file_name, file_ext] = file_name_with_ext.split(".")
        var file_path = "Output"

        // check if the string in data-src contains the identifier $mesh$
        if(pat.includes("$mesh$"))
            file_path = "Output/$mesh$" + file_name

        updateRenderer(file_path, file_name, file_name_with_ext, file_ext)

    }
    /* ------------------------------------------------------------------------------------------------------------
    -- Registration of EventListener
    -------------------------------------------------------------------------------------------------------------*/
    useEffect(() => {
        if(DROPPABLE) {
            $("#" + ID).on("dragover", function(e) {e.preventDefault();})
            $("#" + ID).on("drop", (e) => {drop_method(e.originalEvent)})
            $("#" + ID).on("itemClicked", function(e, data){click_method(data)});
        } else {
            let out_renderer_id = "renderer_image_inner" + "renderer_out"
            let out_renderer = document.getElementById(out_renderer_id)
            var observer = new MutationObserver(observer_updateOutputRenderer);
            let options = {
            attributes: true,
            attributeFilter: ["data-update"]
            };
            observer.observe(out_renderer, options);
        }

        $("#settings_rgbcolorspace").on("change", show3DColorDistribution)
        $("#settings_3dcolorhistogram").on("change", show3DColorHistogram)
        $("#settings_voxelgrid").on("change", showVoxelGrid)
        $("#settings_grid").on("change", function(e){
            if(e.target.checked) {
                changeGrid(<gridHelper args={[20,20, 0x222222, 0x222222]}/>)
            } else {
                changeGrid(null)
            }
        })
        $("#settings_axis").on("change", function(e){
            if(e.target.checked) {changeAxis(<Axis />)}
            else {changeAxis(null)}
        })
        $("#settings_orthographicview").on("change", function(e){
            setPerspectiveView(!e.target.checked)
        })

    }, []);

    /* ------------------------------------------------------------------------------------------------------------
    -- ...
    -------------------------------------------------------------------------------------------------------------*/
    function showMeshTexture() {
        if(mode.current == "Mesh") {
            // change the visibility of the image canvas only if the RGB color space button is not checked
            $("#" + innerImageID).attr("src", gif_loading)
            showView(imageID, renderCanvasID, "2D")
            $("#" + innerImageID).attr("src", pathjoin(active_server, initPath, obj_path.current.split(".")[0] + ".png"))
            mode.current = "Texture"
        } else if(mode.current == "Texture") {
            showView(imageID, renderCanvasID, "3D")
            mode.current = "Mesh"
        } else {
            consolePrint("WARNING", "No object with texture is available...")
        }
    }

    /* ------------------------------------------------------------------------------------------------------------
    -- ...
    -------------------------------------------------------------------------------------------------------------*/
    function showObjectInfo() {
        let curinfo = objInfo.current["data"]
        let infos;
        if(mode.current == "Image")
            infos = {
                "height": curinfo["height"],
                "width": curinfo["width"],
                "channels": curinfo["channels"],
            }
        else if(mode.current == "PointCloud")
            infos = {
                "num_vertices": curinfo["num_vertices"],
                "vertexcolors": curinfo["vertexcolors"],
                "vertexnormals": curinfo["vertexnormals"],
            }
        else if(mode.current == "Mesh")
            infos = {
                "num_vertices": curinfo["num_vertices"],
                "num_faces": curinfo["num_faces"],
                "trianglenormals": curinfo["trianglenormals"],
                "vertexcolors": curinfo["vertexcolors"],
                "vertexnormals": curinfo["vertexnormals"],
            }

        // check if object was selected and the object information is requested
        if(objInfo.current == null) {
            consolePrint("WARNING", "No object is selected...");
            return;
        }

        if (objInfo.current["enabled"]) {
            if(infoBoxEnabled.current) 
                $("#" + infoboxID).css("opacity", 0.0)
            else 
                $("#" + infoboxID).css("opacity", 0.75)
            infoBoxEnabled.current = !infoBoxEnabled.current
            let output_text = ""
            for (let k in infos){
                output_text += "<b>"+k+"</b>" + ": " + infos[k] + "<br />"
            }

            $("#" + infoboxID).html(output_text)
        }
        else 
            consolePrint("WARNING", "No object is selected...")
    }


    // Choose between perspective and orthographic view
    let cameraview;
    if(perspectiveView)
        cameraview = <PerspectiveCamera position={[4, 4, 4]} makeDefault />
    else
        cameraview = <OrthographicCamera position={[10, 10, 10]} zoom={40} makeDefault />


    
    if(!init) {
        canv = <CustomCanvas id={renderCanvasID} view={TITLE} rendering={mesh.current}>
                <ambientLight/>
                <OrbitControls />
                {cameraview}
                {grid}
                {axis}
            </CustomCanvas>
        setInit(true)
    }

    return(
        <div id={ID} style={props.style}>
            <div className="renderer_title">{TITLE}</div>
            <div className='renderer_mesh_texture_button' onClick={showMeshTexture}>
                <img className="renderer_mesh_texture_icon" src={icon_mesh_texture_button}/>
            </div>
            <div className='renderer_info_button' onClick={showObjectInfo}>
                <img className="renderer_info_icon" src={icon_info_button}/>
            </div>
            <div id={infoboxID} className='renderer_info_box'>
                fasefs
            </div>

            <div id={imageID} className="renderer_image">
                <img id={innerImageID} className="renderer_image_inner" data-update={0}  data-src={""}/>
            </div>


            <div id={videoID} className="renderer_video">
                <video id={innerVideoID} className="renderer_video_inner" width="320" height="240" controls>
                    <source src={""} type="video/mp4"/>
                </video>
            </div>

            {/* {canv} */}
            <CustomCanvas id={renderCanvasID} view={TITLE} rendering={mesh.current}>
                <ambientLight/>
                <OrbitControls />
                {cameraview}
                {grid}
                {axis}
            </CustomCanvas>
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