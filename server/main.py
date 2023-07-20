"""
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
"""

# Note: Tensorflow has to be imported before everything else otherwise a CUBLAS error appears
import tensorflow as tf
tf.compat.v1.disable_eager_execution()
#config = tf.compat.v1.ConfigProto()
#config.gpu_options.allow_growth = True
#session = tf.compat.v1.Session(config=config)
from socketserver import ThreadingMixIn
import threading
import multiprocessing

from http.server import BaseHTTPRequestHandler, HTTPServer, SimpleHTTPRequestHandler
import os
import json
import re
import numpy as np
from numba import cuda
import func_timeout
from ColorTransferLib.MeshProcessing.PLYLoader import PLYLoader
from ColorTransferLib.ImageProcessing.Image import Image
from ColorTransferLib.ColorTransfer import ColorTransfer, ColorTransferEvaluation
from Request.GetRequest import GetRequest
from Request.PostRequest import PostRequest
import zipfile36 as zipfile
import gdown
import requests

#init_path = "../../VSCodeProjects/color-transfer-tool/public/data"
init_path = "data"
PORT = 8001
ADDRESS = "localhost"
#ADDRESS = "192.168.178.37"
#ADDRESS = "192.168.178.45"


# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
#
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
class MyServer(SimpleHTTPRequestHandler):
    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    def do_GET(self):
        print("Receive...")
        if self.path == "/server_status" or self.path == "/available_methods" or \
           self.path == "/database" or self.path == "/available_metrics" or \
           self.path == "/check_availability":

            self.send_response(200)
            self.send_header("Content-type", "text/html")
            #self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

        response = {
            "service": None,
            "enabled": "false",
            "data": None
        }

        if self.path == "/server_status":
            response = GetRequest.server_status(self, response)
        elif self.path == "/available_methods":
            response = GetRequest.available_methods(response)
        elif self.path == "/available_metrics":
            response = GetRequest.available_metrics(response)
        elif self.path == "/database":
            response = GetRequest.database(init_path, response)
        elif self.path == "/check_availability":
            response = GetRequest.check_availability(init_path, response)
        else:
            return SimpleHTTPRequestHandler.do_GET(self)

        self.wfile.write(bytes(str(response), "utf-8"))

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    #@timeout_decorator.timeout(5, use_signals=False)
    def do_POST(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.send_header("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS")
        #self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        #self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        response = {
            "service": None,
            "enabled": "false",
            "data": {
                "histogram": [],
                "mean": [],
                "std": [],
                "extension": "",
                "message": ""
            }
        }

        # apply color transfer if this url is posted by user
        if self.path == "/color_transfer":
            response = PostRequest.color_transfer(self, init_path, response)
        elif self.path == "/color_histogram":
            response = PostRequest.color_histogram(self, init_path, response)
        elif self.path == "/upload":
            """Handle a POST request."""
            PostRequest.upload(self)
            # # Save files received in the POST
            # wasSuccess, files_uploaded = self.handle_file_uploads()
            # print(wasSuccess)

            # # Compose a response to the client
            # response_obj = {
            #     "wasSuccess": wasSuccess,
            #     "files_uploaded": files_uploaded,
            #     "client_address": self.client_address
            # }

            # response_str = json.dumps(response_obj)

            # self.log_message(response_str)

            # # Send our response code, header, and data
            # self.send_response(200)
            # self.send_header("Content-type", "Application/json")
            # self.send_header("Content-Length", len(response_str))
            # self.end_headers()
            # self.wfile.write(response_str.encode('utf-8'))
        elif self.path == "/evaluation":
            obj = self.getJson()

            folder_src, file_src = obj["source"].split(":")
            _, extension_src = file_src.split(".")
            src_path = init_path + folder_src + "/" + file_src
            src_img = Image(file_path=src_path)

            folder_ref, file_ref = obj["reference"].split(":")
            _, extension_ref = file_ref.split(".")
            ref_path = init_path + folder_ref + "/" + file_ref
            ref_img = Image(file_path=ref_path)

            folder_out, file_out = obj["output"].split(":")
            _, extension_out = file_out.split(".")
            out_path = init_path + folder_out + "/" + file_out
            out_img = Image(file_path=out_path)

            # print(src_path)
            # print(ref_path)
            # print(out_path)

            #check the source and reference types
            # if extension_com == "ply":
            #     loader_src = PLYLoader(com_path)
            #     src = loader_src.get_mesh()
            # elif extension_com == "png" or extension_com == "jpg":
            #     src = Image(file_path=com_path)

            # if extension_out == "ply":
            #     loader_ref = PLYLoader(out_path)
            #     ref = loader_ref.get_mesh()
            # elif extension_out == "png" or extension_out == "jpg":
            #     ref = Image(file_path=out_path)



            response["service"] = "evaluation"
            response["enabled"] = "true"
            response["data"] = {}

            # get all metrics and add to response["data"]
            cte = ColorTransferEvaluation(src_img, ref_img, out_img)
            metrics = ColorTransferEvaluation.get_available_metrics()
            for mm in metrics:
                print(mm)
                evalval = cte.apply(mm)
                if np.isinf(evalval) or np.isnan(evalval):
                    response["data"][mm] = 99999
                else:
                    response["data"][mm] = evalval
                print(response["data"][mm])
            print(response)

        elif self.path == "/object_info":
            obj = self.getJson()["object_path"]
            extensions = obj.split(".")[-1]
            if extensions == "ply":
                loader_src = PLYLoader(obj)
                src = loader_src.get_mesh()
                voxelgrid = src.get_voxel_grid()
            elif extensions == "png" or extensions == "jpg":
                src = Image(file_path=obj)
                voxelgrid = {"centers": np.empty([1]), "colors": np.empty([1]), "scale": 1}

            response["service"] = "object_info"
            response["enabled"] = "true"
            response["data"] = {
                "histogram": src.get_3D_color_histogram().tolist(),
                "voxelgrid_centers": voxelgrid["centers"].tolist(),
                "voxelgrid_colors": voxelgrid["colors"].tolist(),
                "scale": voxelgrid["scale"]
            }

        print("\033[92m" + "Request fulfilled" + "\033[0m")
        self.wfile.write(bytes(str(response), "utf-8"))

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    def getJson(self):
        datalen = int(self.headers['Content-Length'])
        data = self.rfile.read(datalen)
        obj = json.loads(data)
        return obj

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    def read_line(self):
        line_str = self.rfile.readline().decode('ISO-8859-1')
        self.char_remaining -= len(line_str)
        return line_str




class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread."""

# ------------------------------------------------------------------------------------------------------------------
# method description
# ------------------------------------------------------------------------------------------------------------------
def run(server_address, server_port, server_class=HTTPServer, handler_class=BaseHTTPRequestHandler):
    url = (server_address, server_port)
    httpd = ThreadedHTTPServer(url, handler_class)
    httpd.serve_forever()

# ------------------------------------------------------------------------------------------------------------------
# send the IP address and port to the proxy server
# ------------------------------------------------------------------------------------------------------------------
def sendServerInfo(proxy_address, proxy_port, ressource, server_name, my_address, my_port, server_visibility):
    url = "http://" + proxy_address + ":" + str(proxy_port) + ressource
    myobj = {
        "name": server_name,
        "address": my_address,
        "port": my_port,
        "visibility": server_visibility
    }

    try:
        x = requests.post(url, json = myobj)
    except:
        print("No connection to the proxy server can be established.")
        exit(1)

# ------------------------------------------------------------------------------------------------------------------
# read settings file, i.e. proxy address and port
# ------------------------------------------------------------------------------------------------------------------
def read_settings(path):
    with open(path, 'r') as f:
        data = json.load(f)
        server_name = data["server"]["name"]
        server_address = data["server"]["address"]
        server_port = data["server"]["port"]
        proxy_address = data["proxy"]["address"]
        proxy_port = data["proxy"]["port"]
        server_visibility = data["server"]["visibility"]
        return server_name, server_address, server_port, server_visibility, proxy_address, proxy_port

# ------------------------------------------------------------------------------------------------------------------
# method description
# ------------------------------------------------------------------------------------------------------------------
def main():
    # download Models folder
    if not os.path.exists("Models") and not os.path.exists("data"):
        print("Download DATA.zip ...")
        url = "https://drive.google.com/file/d/1TuWldLgf00A5tcLdftTy2g-XDdSXBFuG/view?usp=share_link"
        output_path = 'DATA.zip'
        gdown.download(url, output_path, quiet=False, fuzzy=True)
        # Extract DATA.zip
        print("Extract DATA.zip ...")
        with zipfile.ZipFile("DATA.zip","r") as zip_ref:
            zip_ref.extractall()
        # Delete DATA.zip
        print("Delete DATA.zip ...")
        os.remove("DATA.zip")

    server_name, server_address, server_port, server_visibility, proxy_address, proxy_port = read_settings("../ressources/settings.json")
    print("#################################################################")
    print("# Server " + server_name + " is running on " + server_address + ":" + str(server_port) + " ...")
    print("#################################################################")

    sendServerInfo(proxy_address, proxy_port, "/ip_update", server_name, server_address, server_port, server_visibility)
           
    run(server_address, server_port, handler_class=MyServer)


if __name__ == '__main__':
    main()
