/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import './Database.scss';
import SysConf from 'settings/SystemConfiguration';
import Terminal from 'pages/Console/Terminal';
import $ from 'jquery';
import {consolePrint} from 'pages/Console/Terminal'
import {server_request} from 'utils/Utils'
import {active_server} from 'pages/SideBarLeft/Server'
import {createPreviewCard} from 'pages/Body/PreviewBoard'
import {pathjoin} from 'utils/Utils'

/*
example:
database_sets = [
    {"folder_name": "name1",
        "file_paths": ["file1", file2, file3]},
    {"folder_name": "name2",
        "file_paths": ["file1", file2, file3]},
]
*/
let database_sets = []

const icon_database = "assets/icons/icon_database_grey.png";
const icon_database_elem = "assets/icons/icon_database2.png";
const icon_items_elem = "assets/icons/icon_cloud.png";
const icon_items_elem2 = "assets/icons/icon_frames2.png";
const icon_items_mesh = "assets/icons/icon_mesh.png";
const sidebar_database = "DATABASE"

/*-------------------------------------------------------------------------------------------------------------
-- [ {"name": "images",
--    "folders": [
--      {
--        "name": "examples",
--        "folders": [],
--        "files": ["exp1.ply", "exp2.ply"]}
--      }    
-- ]
--    "files": ["file1.png", "file2.png"]}
--    {"name": "pointclouds",
--     "folders": []
--     "files": ["file1.ply", "file2.ply"]} 
-- ]
-------------------------------------------------------------------------------------------------------------*/
export const request_database_content = (server_address) => {
    let database_obj = server_request("GET", "database", server_address, null)
    if (database_obj["enabled"]) {
        consolePrint("INFO", "Database loaded")
        createDBButtons(database_obj)
    } else {
        consolePrint("WARNING", "Could not find database")
    }
}

/*-------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------*/
export const createDBButtons = (database_obj) => {
    database_sets = database_obj["data"]
    $("#database_body").html("")
    $("#items_body").html("")

    for (const folder of database_obj["data"][0]["folders"])
        create_folder_button(folder, 0, "")
}

/*-------------------------------------------------------------------------------------------------------------
-- function hide_subfolders
-------------------------------------------------------------------------------------------------------------*/
export const create_folder_button = (folder, count, folder_path) => {
    // add button to database area
    let database_elem = $("<div/>")
    database_elem.attr('class', 'database_elem').appendTo($("#database_body"));

    // add button icon
    $("<img/>").attr({class: "database_elem_icon", src: icon_database_elem, title: folder["name"]}).appendTo(database_elem)

    // add button text
    $("<div/>").html(folder["name"]).attr({class: "database_elem_text"}).appendTo(database_elem)

    // changes background color of button depending on hierarchy level
    // all folders with count > 0 are subfolders and should be hidden
    if(count != 0) {
        let colNum = 50 + count * 50
        database_elem.css("background-color", "RGB(" + 50 + "," + colNum + "," + colNum + ")")
        database_elem.on("mouseover", function() {database_elem.css("background-color",  "#1C6C90");}); 
        database_elem.on("mouseout", function() {database_elem.css("background-color",  "RGB(" + 50 + "," + colNum + "," + colNum + ")");}); 
        database_elem.css("display", 'none')
    }

    var arr_subs = []

    // check if folder contains 

    // if(folder["name"] == "Meshes") 
    //     database_elem.addEventListener("click", function() {show_files(folder, pathjoin(folder_path, folder["name"]))});

    let num_meshes = 0
    for (const subfolder of folder["folders"]){
        // folder with the start string "$mesh$" contains meshes, i.e, one obj, mtl and png file
        if(subfolder["name"].includes("$mesh$")) {
            num_meshes += 1
            // console.log("TTTTTTTT")
            // let obj_path = pathjoin(folder["name"], subfolder["name"].replace('$mesh$',''), subfolder["name"].replace('$mesh$','') + ".obj")
            // console.log(obj_path)
            // console.log("TTTTTTTT")
            // database_elem.on("click", function() {show_mesh_file(obj_path)});
            continue
        }
        // Folder "Meshes" contains only folders containing the meshes, i.e., obj, png and mtl files. No subfolder will be created
        // if(folder["name"] == "Meshes")
        //     continue 

        const new_folder = create_folder_button(subfolder, count + 1, pathjoin(folder_path, folder["name"]))
        arr_subs.push(new_folder[0])
        database_elem.on("click", function() {show_subfolders(new_folder)})
    }

    // additionally to each file, a new item has to be created for each mesh folder 
    if(folder["files"].length + num_meshes > 0 )
        database_elem.on("click", function() {show_files(folder, pathjoin(folder_path, folder["name"]))});

    return [database_elem, arr_subs]
}

/*-------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------*/
export const show_subfolders = (fold) => {
    console.log(fold)
    $("#items_body").html("")
    if(fold[0].css("display") == "none")
        fold[0].css("display", 'block');
    else {
        fold[0].css("display", 'none');
        // hides all subfolders
        for(const el of fold[1])
            el.css("display", 'none');
    }
}
/*-------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------*/
export const show_files = (fold, file_path) => {
    console.log("Hello FRED")
    console.log(fold)
    console.log(file_path)
    var items_body = $("#items_body").html("")

    // empty preview board
    $("#body_preview").html("")

    // check if folder has a $mesh$ identifier -> the folder will be displayed as item
    let iterate_fold_obj = fold["folders"];
    for (const element of iterate_fold_obj) {
        if(element["name"].includes("$mesh$")){
            let file_name = element["name"].replace("$mesh$", "")
            let items_elem = $("<div/>").attr("title", file_name).attr("draggable", "true").addClass("items_elem");
            let items_elem_icon = $("<img/>").addClass("items_elem_icon").attr("src", icon_items_mesh)
            var items_elem_text = $("<div/>").html(file_name).addClass("items_elem_text")

            $(items_elem).on("dragstart", function(e){
                let data = file_path + "/" + element["name"] + ":" + file_name + ".obj";
                e.originalEvent.dataTransfer.setData('text', data);
            });

            items_elem.append(items_elem_icon)
            items_elem.append(items_elem_text)
            items_body.append(items_elem)  


            // objects which are created and uploaded have no preview
            if(file_path != "Output" && file_path != "Uploads")
                createPreviewCard(pathjoin(active_server, "previews", file_path), file_name)
        }
    }


    let iterate_obj = fold["files"];
    for (const element of iterate_obj) {
        let file_name = element;
        let items_elem = $("<div/>").attr("title", file_name).attr("draggable", "true").addClass("items_elem");
        
        $(items_elem).on("dragstart", function(e){
            let data = file_path + ":" + file_name;
            e.originalEvent.dataTransfer.setData('text', data);
        });

        // choose item image depending on object type
        let items_elem_icon = $("<img/>").addClass("items_elem_icon")
        

        var file_extension = element.split(".")[1]
        // get file extension to choose correct image in "ITEMS"
        if (file_extension == "ply" || file_extension == "obj")
            $(items_elem_icon).attr("src", icon_items_elem)
        else if(file_extension == "png" || file_extension == "jpg")
            $(items_elem_icon).attr("src", icon_items_elem2)
            
        var items_elem_text = $("<div/>").html(file_name).addClass("items_elem_text")
        
        items_elem.append(items_elem_icon)
        items_elem.append(items_elem_text)
        items_body.append(items_elem)  

        // objects which are created and uploaded have no preview
        if(file_path != "Output" && file_path != "Uploads")
            createPreviewCard(pathjoin(active_server, "previews", file_path), file_name)
    }
}


/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function Database(props) {
    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- Public methods
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/



    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- Private methods
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/



    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- Mounting and Updating methods
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    // constructor(props) {
    //   super(props);
    //   this.state = {render: true, database: {}};
    // }

    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    return (
        <div id="database_main">
            <div id="database_header">
                <img id='database_header_logo' src={icon_database}/>
                <div id='database_header_name'>{sidebar_database}</div>
            </div>
            <div id="database_body">
                <div className="database_elem">
                    <img className="database_elem_icon" src={icon_database_elem} />
                    <div className="database_elem_text">PLACEHOLDER</div>
                </div>
            </div>
        </div>
    );
}

export default Database;