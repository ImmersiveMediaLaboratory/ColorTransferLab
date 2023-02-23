"""
Copyright 2022 by Herbert Potechius,
Ernst-Abbe-Hochschule Jena - University of Applied Sciences - Department of Electrical Engineering and Information
Technology - Immersive Media and AR/VR Research Group.
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
"""

import os
import func_timeout
import json
import re

from ColorTransferLib.ColorTransfer import ColorTransfer
from ColorTransferLib.MeshProcessing.PLYLoader import PLYLoader
from ColorTransferLib.ImageProcessing.Image import Image

class PostRequest():
    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    @staticmethod
    def color_transfer(server, init_path, response):
        obj = server.getJson()

        folder_src, file_src = obj["source"].split(":")
        folder_ref, file_ref = obj["reference"].split(":")
        _, extension_src = file_src.split(".")
        _, extension_ref = file_ref.split(".")
        approach = obj["approach"]

        src_path = init_path + "/" + folder_src + "/" + file_src
        ref_path = init_path + "/" + folder_ref + "/" + file_ref
        # check the source and reference types
        if extension_src == "ply":
            loader_src = PLYLoader(src_path)
            src = loader_src.get_mesh()
        elif extension_src == "png" or extension_src == "jpg":
            src = Image(file_path=src_path)

        if extension_ref == "ply":
            loader_ref = PLYLoader(ref_path)
            ref = loader_ref.get_mesh()
        elif extension_ref == "png" or extension_ref == "jpg":
            ref = Image(file_path=ref_path)

        ct = ColorTransfer(src, ref, obj["approach"])
        ct.set_options(obj["options"])
        #output = ct.apply(approach)

        try:
            output = func_timeout.func_timeout(60, ct.apply, args=(), kwargs=None)
            output = output["object"]
        except func_timeout.FunctionTimedOut:
            response["service"] = "color_transfer"
            response["enabled"] = "false"
            response["data"]["message"] = "Algorithms takes longer than 1 minute. Change the Configuration parameters to reduce execution time."
            print("\033[92m" + "Request fulfilled" + "\033[0m")
            self.wfile.write(bytes(str(response), "utf-8"))
            return


        if extension_src == "ply":
            out_loader = PLYLoader(mesh=output)
            out_loader.write(init_path + "/Output/" + obj["output"] + ".ply")
            response["data"]["extension"] = "ply"
        elif extension_src == "png" or extension_src == "jpg":
            output.write(init_path + "/Output/" + obj["output"] + ".jpg")
            response["data"]["extension"] = "jpg"

        response["service"] = "color_transfer"
        response["enabled"] = "true"
        response["data"]["histogram"] = output.get_color_statistic()[0].tolist()
        response["data"]["mean"] = output.get_color_statistic()[1].tolist()
        response["data"]["std"] = output.get_color_statistic()[2].tolist()

        return response

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    @staticmethod
    def color_histogram(server, init_path, response):
        datalen = int(server.headers['Content-Length'])
        data = server.rfile.read(datalen)
        obj = json.loads(data)
        folder, file = obj.split(":")
        _, extension = file.split(".")

        path = init_path + "/" + folder + "/" + file

        if extension == "ply":
            loader_src = PLYLoader(path)
            src = loader_src.get_mesh()
        elif (extension == "png" or extension == "jpg"):
            src = Image(file_path=path)

        response["service"] = "color_histogram"
        response["enabled"] = "true"
        response["data"] = {
            "histogram": src.get_color_statistic()[0].tolist(),
            "mean": src.get_color_statistic()[1].tolist(),
            "std": src.get_color_statistic()[2].tolist()
        }
        return response

    # ------------------------------------------------------------------------------------------------------------------
    # 
    # ------------------------------------------------------------------------------------------------------------------
    @staticmethod
    def upload(server):
        # Save files received in the POST
        wasSuccess, files_uploaded = PostRequest.handle_file_uploads(server)
        print(wasSuccess)

        # Compose a response to the client
        response_obj = {
            "wasSuccess": wasSuccess,
            "files_uploaded": files_uploaded,
            "client_address": server.client_address
        }

        response_str = json.dumps(response_obj)

        server.log_message(response_str)

        # Send our response code, header, and data
        server.send_response(200)
        server.send_header("Content-type", "Application/json")
        server.send_header("Content-Length", len(response_str))
        server.end_headers()
        server.wfile.write(response_str.encode('utf-8'))

    # ------------------------------------------------------------------------------------------------------------------
    # ------------------------------------------------------------------------------------------------------------------
    # Helper methods
    # ------------------------------------------------------------------------------------------------------------------
    # ------------------------------------------------------------------------------------------------------------------

    # ------------------------------------------------------------------------------------------------------------------
    # method description
    # ------------------------------------------------------------------------------------------------------------------
    @staticmethod
    def handle_file_uploads(server):
        """
        Take the post request and save any files received to the same folder
        as this script.
        Returns
            wasSuccess: bool: whether the process was a success
            files_uploaded: list of string: files that were created
        """
        server.char_remaining = int(server.headers['content-length'])
        # Find the boundary from content-type, which might look like:
        # 'multipart/form-data; boundary=----WebKitFormBoundaryUI1LY7c2BiEKGfFk'
        boundary = server.headers['content-type'].split("=")[1]

        basepath = server.translate_path(server.path)
        # Strip this script's name from the path so it's just a folder
        basepath = os.path.dirname(basepath)

        # ----WebKitFormBoundaryUI1LY7c2BiEKGfFk
        line_str = server.read_line()
        if not boundary in line_str:
            print("Content did NOT begin with boundary as it should")
            return False, []

        files_uploaded = []
        while server.char_remaining > 0:
            # Breaking out of this loop on anything except a boundary
            # an end-of-file will be a failure, so let's assume that
            wasSuccess = False

            # Content-Disposition: form-data; name="file"; filename="README.md"
            line_str = server.read_line()
            filename = re.findall('Content-Disposition.*name="file"; ' +
                                  'filename="(.*)"', line_str)
            if not filename:
                server.log_message("Can't find filename " + filename)
                break
            else:
                filename = filename[0]
            filepath = os.path.join(basepath, "data/Uploads/" + filename)
            try:
                outfile = open(filepath, 'wb')
            except IOError:
                server.log_message("Can't create file " + str(filepath) +
                                 " to write; do you have permission to write?")
                break

            # Content-Type: application/octet-stream
            line_str = server.read_line()

            # Blank line
            line_str = server.read_line()

            # First real line of code
            preline = server.read_line()
            # Loop through the POST until we find another boundary line,
            # signifying the end of this file and the possible start of another
            while server.char_remaining > 0:
                line_str = server.read_line()

                # ----WebKitFormBoundaryUI1LY7c2BiEKGfFk
                if boundary in line_str:
                    preline = preline[0:-1]
                    if preline.endswith('\r'):
                        preline = preline[0:-1]
                    outfile.write(preline.encode('ISO-8859-1'))
                    outfile.close()
                    server.log_message("File '%s' upload success!" % filename)
                    files_uploaded.append(filename)
                    # If this was the last file, the session was a success!
                    wasSuccess = True
                    break
                else:
                    outfile.write(preline.encode('ISO-8859-1'))
                    preline = line_str

        return wasSuccess, files_uploaded