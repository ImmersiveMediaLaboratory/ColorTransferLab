"""
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
"""

import json
import psycopg
from psycopg.rows import dict_row
from .utils import Utils
import datetime

# ------------------------------------------------------------------------------------------------------------------
# Handles the submission of user test results from the client and stores them in the database.
# ------------------------------------------------------------------------------------------------------------------
async def handlerPutSubmission(client, message, client_id):
    data_recv_string = json.loads(message)
    command_recv = data_recv_string["command"]
    data_recv = data_recv_string["data"]
    Utils.printRECV(f"Client submits test results: {command_recv}.", client.window)

    conn = psycopg.connect("dbname=userstudy user=postgres password=postgres host=localhost port=5432")

    # get list of all available metrics
    metric_names_id_map = {}
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute("SELECT * FROM metric;")
        rows = cur.fetchall()
        for row in rows:
            metric_names_id_map[row["name"]] = row["id"]

    # interate over the received ratings and insert them into the database
    for set_id, metric_ratings in data_recv["ratings"].items():
        for metric_name, result in metric_ratings.items():
            metric_id = metric_names_id_map[metric_name]
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute("INSERT INTO response (set_item_id, metric_id, participant_id, value) VALUES (%s, %s, %s, %s);", (set_id, metric_id, data_recv["participant_id"], result))
    
    # mark participant as invalid to prevent multiple submissions
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            "UPDATE participant SET valid = FALSE, end_time = %s WHERE id = %s;",
            (datetime.datetime.now(), data_recv["participant_id"])
        )

    # get the completion code for the participant
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute("SELECT completion_code FROM participant WHERE id = %s;", (data_recv["participant_id"],))
        completion_code = cur.fetchone()["completion_code"]

    conn.commit()
    conn.close()

    # return the completion code to the client
    client.send_datachannel_message({
        "message": "/putSubmissionResponse",
        "data" : {"completion_code": completion_code}
    }, client_id)

# ------------------------------------------------------------------------------------------------------------------
# Handles the retrieval of the user test set for a participant based on a provided test link.
# ------------------------------------------------------------------------------------------------------------------
async def handlerGetUserTestSet(client, message, client_id):
    data_recv_string = json.loads(message)
    command_recv = data_recv_string["command"]
    data_recv = data_recv_string["data"] # <-- this is the test link
    Utils.printRECV(f"Client requests retrieval of user test set via command: {command_recv}.", client.window)

    conn = psycopg.connect("dbname=userstudy user=postgres password=postgres host=localhost port=5432")

    test_set_structure = {"participant_id": None, "test_set": []}

    # Retrieve participant id based on the test link provided by the client
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute("SELECT * FROM participant WHERE test_link = %s;", (data_recv, ))
        participant_id = cur.fetchone()["id"]
        test_set_structure["participant_id"] = participant_id

    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute("SELECT * FROM participant WHERE test_link = %s;", (data_recv, ))
        test_number = cur.fetchone()["test_number"]

    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute("SELECT * FROM set WHERE name = %s;", (test_number, ))
        set_id = cur.fetchone()["id"]

    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute("SELECT * FROM set_item WHERE set_id = %s;", (set_id,))
        set_items = cur.fetchall()

    for set_item in set_items:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM item WHERE id = %s;", (set_item["item_id"],))
            item = cur.fetchone()
            item["set_id"] = set_item["id"]
            test_set_structure["test_set"].append(item)

    client.send_datachannel_message({
        "message": "/getUserTestSetResponse",
        "data" : test_set_structure
    }, client_id)

    conn.close()

# ------------------------------------------------------------------------------------------------------------------
# Handles the submission of user info for a participant
# ------------------------------------------------------------------------------------------------------------------
async def handlerPutUserInfo(client, message, client_id):
    data_recv_string = json.loads(message)
    command_recv = data_recv_string["command"]
    data_recv = data_recv_string["data"]

    Utils.printRECV(f"Client submits user info: {command_recv}.", client.window)

    conn = psycopg.connect("dbname=userstudy user=postgres password=postgres host=localhost port=5432")

    # mark participant as invalid to prevent multiple submissions
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute("UPDATE participant SET worker_id = %s, age = %s, gender = %s, nationality = %s, vision = %s, start_time = %s WHERE test_link = %s;", (data_recv["worker_id"], data_recv["age"], data_recv["gender"], data_recv["nationality"], data_recv["vision"], data_recv["start_time"], data_recv["test_link"]))

    conn.commit()
    conn.close()

# ------------------------------------------------------------------------------------------------------------------
#  Handles the retrieval of a user study file (e.g., an image) based on a provided file path.
# ------------------------------------------------------------------------------------------------------------------
async def handlerGetRatingFile(client, message, client_id):
    data_recv_string = json.loads(message)
    command_recv = data_recv_string["command"]
    data_recv = data_recv_string["data"]
    Utils.printRECV(f"Client requests user study file via: {command_recv}.", client.window)
    await client.sendFiles(data_recv, "Image", client_id)