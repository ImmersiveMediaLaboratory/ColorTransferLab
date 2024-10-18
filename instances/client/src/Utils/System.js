/*
Copyright 2024 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

export let active_server = "";
export let SE1_server = "https://proxy.potechius.com";
//export let SE1_server = "http://192.168.178.191:8002";

// export const execution_params_options = []

// // these parameters will be sent to the python server
// export const execution_params_objects = {
//     "src": "",
//     "ref": "",
//     "out": ""
// }

// export const execution_approach = {
//     "method": "",
//     "options": ""
// }

export const execution_data = {
    "source": "",
    "reference": "",
    "output": "",
    "approach": "",
    "options": ""
}

export let evaluation_results = {}
export let available_metrics = []