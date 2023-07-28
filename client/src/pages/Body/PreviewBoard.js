/*
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import React from 'react';
import $ from 'jquery';

import './PreviewBoard.scss';


export const createPreviewCard = (file_path, file_name) => {
    let preview_board = $("#body_preview")
    let preview_card = $("<div/>").addClass('preview_card');

    let preview_name = $("<div/>").addClass('preview_name').html(file_name)

    let [file_name_no_ext, ext] = file_name.split(".")

    let preview_img = $("<img/>").addClass('preview_img').attr("src", file_path + "/" + file_name_no_ext + ".png")

    $(preview_board).append($(preview_card))
    $(preview_card).append($(preview_name))
    $(preview_card).append($(preview_img))
}

/*-----------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------
-- 
-------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------*/
function PreviewBoard(props) {
    return (
      <div id={props.id}>

      </div>
    );
}

export default PreviewBoard;