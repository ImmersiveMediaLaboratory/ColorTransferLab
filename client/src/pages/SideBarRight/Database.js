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
import {server_request} from 'utils/utils_http'
import Images from "constants/Images"
import Texts from 'constants/Texts';
import SysConf from 'settings/SystemConfiguration';
import Requests from 'utils/utils_http';
import Terminal from 'pages/Console/Terminal';
import $ from 'jquery';

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- Contains texts
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
class Database extends React.Component {
    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- Public methods
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

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
    static request_database_content(server_address) {
        let database_obj = Requests.server_request("database", server_address)
        if (database_obj["enabled"]) {
            Terminal.consolePrint("INFO", "Database loaded")
            Database.#createDBButtons(database_obj)
        } else {
            Terminal.consolePrint("WARNING", "Could not find database")
        }
    }

    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- Private methods
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    static #createDBButtons(database_obj) {
        SysConf.database_sets = database_obj["data"]
        $("#database_body").html("")
        $("#items_body").html("")

        for (const folder of database_obj["data"][0]["folders"]) {
            Database.#create_folder_button(folder, 0, "")
        }
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- function hide_subfolders
    -------------------------------------------------------------------------------------------------------------*/
    static #create_folder_button(folder, count, folder_path) {
        let database_body = document.getElementById("database_body")
        var database_elem = document.createElement("div");

        var colNum = 50 + count * 50
        database_elem.style.backgroundColor = "RGB(" + 50 + "," + colNum + "," + colNum + ")"
        database_elem.addEventListener("mouseover", function() {
            database_elem.style.backgroundColor = "#1C6C90";
        });                    
        database_elem.addEventListener("mouseout", function() {
            database_elem.style.backgroundColor = "RGB(" + 50 + "," + colNum + "," + colNum + ")";
        });

        database_elem.className = "database_elem";
        var database_elem_icon = document.createElement("img");
        database_elem_icon.className = "database_elem_icon"
        database_elem_icon.src = Images.icon_database_elem
        database_elem.title = folder["name"]


        const database_elem_text = document.createElement("div");
        database_elem_text.innerHTML = folder["name"]
        database_elem_text.className = "database_elem_text"
        database_elem.appendChild(database_elem_icon)
        database_elem.appendChild(database_elem_text)
        database_body.appendChild(database_elem)

        // all folders with count > 0 are subfolders and should be hidden
        if(count != 0)
           database_elem.style.display = 'none';

        var arr_subs = []

        if(folder["name"] == "Meshes") {
            database_elem.addEventListener("click", function() {Database.#show_files(folder, folder_path + "/" + folder["name"])});
        }

        for (const subfolder of folder["folders"]){
            // Folder "Meshes" contains only folders containing the meshes, i.e., obj, png and mtl files. No subfolder will be created
            if(folder["name"] == "Meshes") {
                continue
            }

            const new_folder = Database.#create_folder_button(subfolder, count + 1, folder_path + "/" + folder["name"], database_body)
            arr_subs.push(new_folder[0])

            
            database_elem.addEventListener("click", function() {Database.#show_subfolders(new_folder)});

        }

        if(folder["files"].length > 0 ) {
            database_elem.addEventListener("click", function() {Database.#show_files(folder, folder_path + "/" + folder["name"])});
        }

        return [database_elem, arr_subs]
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    static #show_subfolders(fold) {
        $("#items_body").html("")
        if(fold[0].style.display == "none")
            fold[0].style.display = 'block';
        else {
            fold[0].style.display = 'none';
            // hides all subfolders
            for(const el of fold[1])
                el.style.display = 'none';
        }
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    static #show_files(fold, file_path) {
        var items_body = document.getElementById("items_body")
        items_body.innerHTML = ""

        // handle the folders within the "Meshes" folder differntly
        if(fold["name"] == "Meshes") {
            for (const element of fold["folders"]) {
                var items_elem = document.createElement("div");
                items_elem.title = element["name"]
                
                items_elem.draggable="true"
                items_elem.addEventListener('dragstart', function(event) {
                    event.dataTransfer.setData('text', file_path + "/" + element["name"] + ":" + element["name"] + ".obj");
                }); 

                items_elem.className = "items_elem";
                //items_elem.addEventListener("click", function(){show_folder_content(folder)});
                var items_elem_icon = document.createElement("img");
                items_elem_icon.className = "items_elem_icon"
                // get file extension to choose correct image in "ITEMS"
                items_elem_icon.src = Images.icon_items_elem
 
                var items_elem_text = document.createElement("div");
                items_elem_text.innerHTML = element["name"]
                items_elem_text.className = "items_elem_text"
                items_elem.appendChild(items_elem_icon)
                items_elem.appendChild(items_elem_text)
                items_body.appendChild(items_elem)
            }
        } else {
            for (const element of fold["files"]) {
                var items_elem = document.createElement("div");
                items_elem.title = element
                
                items_elem.draggable="true"
                items_elem.addEventListener('dragstart', function(event) {
                    event.dataTransfer.setData('text', file_path + ":" + element);
                }); 

                items_elem.className = "items_elem";
                //items_elem.addEventListener("click", function(){show_folder_content(folder)});
                var items_elem_icon = document.createElement("img");
                items_elem_icon.className = "items_elem_icon"
                var file_extension = element.split(".")[1]
                // get file extension to choose correct image in "ITEMS"
                if (file_extension == "ply" || file_extension == "obj") {
                    items_elem_icon.src = Images.icon_items_elem
                } 
                else if(file_extension == "png" || file_extension == "jpg") {
                    items_elem_icon.src = Images.icon_items_elem2
                }
                var items_elem_text = document.createElement("div");
                items_elem_text.innerHTML = element
                items_elem_text.className = "items_elem_text"
                items_elem.appendChild(items_elem_icon)
                items_elem.appendChild(items_elem_text)
                items_body.appendChild(items_elem)
            }
        }
    }

    /*-------------------------------------------------------------------------------------------------------------
    ---------------------------------------------------------------------------------------------------------------
    -- Mounting and Updating methods
    ---------------------------------------------------------------------------------------------------------------
    -------------------------------------------------------------------------------------------------------------*/

    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    constructor(props) {
      super(props);
      this.state = {render: true, database: {}};
    }

    /*-------------------------------------------------------------------------------------------------------------
    -- 
    -------------------------------------------------------------------------------------------------------------*/
    render() {
        return (
            <div id="database_main">
                <div id="database_header">
                    <img id='database_header_logo' src={Images.icon_database}/>
                    <div id='database_header_name'>{Texts.sidebar_database}</div>
                </div>
                <div id="database_body">
                    <div className="database_elem">
                        <img className="database_elem_icon" src={Images.icon_database_elem} />
                        <div className="database_elem_text">PLACEHOLDER</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Database;