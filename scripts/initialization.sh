##########################################################################################################
# Removes all previous in- and outputs
##########################################################################################################
clear

##########################################################################################################
# Define a template for the settings.json
##########################################################################################################
json_data='{
  "SI1": {
    "protocol": "https",
    "lan": "192.168.178.182",
    "wan": "192.168.178.182",
    "port": 9000
  },
  "SI2": {
    "name": "GPU Server",
    "protocol": "https",
    "lan": "192.168.178.182",
    "wan": "192.168.178.182",
    "port": 9001,
    "visibility": "private"
  }
}'

# json_file="../ressources/settings/settings.json"
# SE1_PORT=90030
# SE2_WAN="HEHEHE"

# json_data=$(jq --argjson SE1_PORT "$SE1_PORT" '.SI1.port = $SE1_PORT' < "$json_file")
# json_data=$(jq --arg SE2_WAN "$SE2_WAN" '.SI2.wan = $SE2_WAN' <<< "$json_data")
# #json_data=$(jq --arg SE2_PORT "$SE2_PORT" '.SI2.port = $SE2_PORT' <<< "$json_data")
# echo "$json_data" > "$json_file"
# exit

##########################################################################################################
# Define color for printing
##########################################################################################################
RED='\033[0;31m'
GREEN='\033[0;32m'
LIGHTGREEN='\033[1;32m'
YELLOW='\033[1;33m'
BROWN='\033[0;33m'
NC='\033[0m' # No Color

##########################################################################################################
# Print Intro
##########################################################################################################

echo -e "################################################################################################"
echo -e "# ${GREEN}Initialization of COLORTRANSFERLAB${NC}                                                           #"
echo -e "#----------------------------------------------------------------------------------------------#"
echo -e "# This tool was published as part of the publication 'A software test bed for sharing and      #"
echo -e "# evaluating color transfer algorithms for images and 3D objects' from Potechius et al.        #"
echo -e "# If you utilize this code in your research, kindly provide a citation.                        #"
echo -e "#----------------------------------------------------------------------------------------------#"
echo -e "# The following steps will initialize the project for you.                                     #"
echo -e "################################################################################################"
echo -e ""
echo -e "${YELLOW}[1] How do you want to use this web app?${NC}"
echo -e "    ${BROWN}(1) I want to host the system locally but make it available remotely.${NC}"
echo -e "    ${BROWN}(2) I want to run the system as a local app.${NC}"
echo -e "    ${BROWN}(3) I want to use the provided frontend and run my own Server Instance 2.${NC}"
while true; do
    echo -e "    INPUT: \c"
    read usecase
    if [[ ${usecase} != 1 ]] && [[ ${usecase} != 2 ]] && [[ ${usecase} != 3 ]] ; then
        echo -e "    ${RED}Invalid response!${NC}"
        continue
    fi
    break
done
echo -e ""

##########################################################################################################
# Ask the user if a virtual environment has to be created.
##########################################################################################################
echo -e "${YELLOW}[2] Create a virtual environment at <project_root>/ressources?${NC} (y/n)"
while true; do
    echo -e "    INPUT: \c"
    read createENV

    if [[ ${createENV} == "y" ]]; then
        echo -e "    ${BROWN}OUTPUT: Creation of virtual environment named env at <project_root>/ressources....${NC}"
        # If the environment already exists, ask the user if he/she wants to replace it
        DIR="../ressources/env/"
        if [ -d "$DIR" ]; then
            echo -e "    ${RED}OUTPUT: The environment already exists. Do you want to replace it?${NC} (y/n)"
            while true; do
                echo -e "    Input: \c"
                read replaceENV
                if [[ ${replaceENV} == "y" ]]; then
                    python3 -m venv ../ressources/env
                    echo -e "    ${GREEN}OUTPUT: SUCCESS.${NC}"
                    break
                elif [[  ${replaceENV} == "n" ]]; then
                    break
                else
                    echo -e "    ${RED}Invalid response!${NC}"
                fi
            done
        else
            python3 -m venv ../ressources/env
            echo -e "    ${GREEN}OUTPUT: SUCCESS.${NC}"
        fi
    elif [[  ${createENV} == "n" ]]; then
        echo -e "    ${BROWN}OUTPUT: No environment will be created.${NC}"
    else
        echo -e "    ${RED}Invalid response!${NC}"
        continue
    fi

    if [[ ${createENV} == "y" ]] || [[ ${createENV} == "n" ]] ; then
        echo -e "    ${BROWN}OUTPUT: Activation of environment...${NC}"
        source ../ressources/env/bin/activate
        echo -e "    ${GREEN}OUTPUT: SUCCESS.${NC}"
        echo -e "    ${BROWN}OUTPUT: Do you want to install the requirements?${NC} (y/n)"

        while true; do
            echo -e "    Input: \c"
            read installREQ
            if [[ ${installREQ} == "y" ]]; then
                echo -e "    ${BROWN}OUTPUT: Installation of requirements...${NC}"

                # Define a temporary file as a flag
                flag_file="/tmp/pip_install_complete.flag"

                gnome-terminal -- bash -c "pip install -U -r ../ressources/requirements/requirements.txt && touch $flag_file"

                # Wait until the flag file is created, indicating completion of pip install
                while [ ! -e "$flag_file" ]; do
                    sleep 1
                done

                # Remove the flag file
                rm "$flag_file"

                echo -e "    ${GREEN}OUTPUT: SUCCESS.${NC}"
                break
            elif [[  ${installREQ} == "n" ]]; then
                break
            else
                echo -e "    ${RED}Invalid response!${NC}"
            fi
        done
    fi
    break
done
echo -e ""

##########################################################################################################
# Update the server information based on the use case.
##########################################################################################################
echo -e "${YELLOW}[3] The server information has to be updated. Ports are set to 9000 for SE1 and 9001 for SE2.${NC}"
echo -e "${YELLOW}    If necessary, enable port forwarding for the ports 9000 and 9001.${NC}"
echo -e "${YELLOW}    Change it in settings.json if necessary. Please provide the following information:${NC}"

#read localAddress
SE1_LAN=$(ifconfig | grep -oE 'inet ([0-9]{1,3}\.){3}[0-9]{1,3}' | awk '$2 != "127.0.0.1" {print $2}')

if [[ ${usecase} == 1 ]]; then
    SE1_PORT=9000
    SE2_PORT=9001
    SE1_PROTOCOL="https"
    SE2_PROTOCOL="https"
    echo -e "    WAN Address of SE1 (e.g. yourdomain.com): \c"
    read SE1_wanAddress
    SE1_WAN=${SE1_wanAddress}
elif [[ ${usecase} == 2 ]]; then
    SE1_PORT=3000
    SE2_PORT=3001
    SE1_PROTOCOL="http"
    SE2_PROTOCOL="http"
    SE1_WAN=${SE1_LAN}
elif [[ ${usecase} == 3 ]]; then
    SE1_PORT=8003
    SE2_PORT=9001
    SE1_PROTOCOL="https"
    SE2_PROTOCOL="https"
    echo -e "    WAN Address of SE1 (e.g. yourdomain.com): \c"
    read SE1_wanAddress
    SE1_WAN=${SE1_wanAddress}
fi


SE2_LAN=${SE1_LAN}
SE2_WAN=${SE1_WAN}

echo -e "    SE2 name (e.g. Testserver): \c"
read SE2_name
SE1_NAME=${SE2_name}


echo -e "    ${BROWN}OUTPUT: Update settings.json...${NC}"

json_file="../ressources/settings/settings.json"

#json_data=$(jq --arg SE1_PORT "$SE1_PORT" '.SI1.port = $SE1_PORT' <<< "$json_data")
json_data=$(jq --argjson SE1_PORT "$SE1_PORT" --argjson SE2_PORT "$SE2_PORT" '.SI1.port = $SE1_PORT | .SI2.port = $SE2_PORT' < "$json_file")
# json_data=$(jq --argjson SE2_PORT "$SE2_PORT" '.SI2.port = $SE2_PORT' < "$json_file")
# json_data=$(jq --argjson SE1_PORT "$SE1_PORT" '.SI1.port = $SE1_PORT' < "$json_file")
#json_data=$(jq --arg SE2_PORT "$SE2_PORT" '.SI2.port = $SE2_PORT' <<< "$json_data")

json_data=$(jq --arg SE1_PROTOCOL "$SE1_PROTOCOL" '.SI1.protocol = $SE1_PROTOCOL' <<< "$json_data")
json_data=$(jq --arg SE1_LAN "$SE1_LAN" '.SI1.lan = $SE1_LAN' <<< "$json_data")
json_data=$(jq --arg SE1_WAN "$SE1_WAN" '.SI1.wan = $SE1_WAN' <<< "$json_data")
json_data=$(jq --arg SE2_PROTOCOL "$SE2_PROTOCOL" '.SI2.protocol = $SE2_PROTOCOL' <<< "$json_data")
json_data=$(jq --arg SE2_LAN "$SE2_LAN" '.SI2.lan = $SE2_LAN' <<< "$json_data")
json_data=$(jq --arg SE2_WAN "$SE2_WAN" '.SI2.wan = $SE2_WAN' <<< "$json_data")
json_data=$(jq --arg SE1_NAME "$SE1_NAME" '.SI2.name = $SE1_NAME' <<< "$json_data")
echo "$json_data" > "$json_file"


##########################################################################################################
# Update the server information in the javascript file Server.js
##########################################################################################################
if [[ ${usecase} == 1 ]] || [[ ${usecase} == 2 ]]; then
    javascript_file="../instances/client/src/pages/SideBarLeft/Server.js"
    new_value="${SE1_PROTOCOL}://${SE1_WAN}:${SE1_PORT}"
    # Use sed to replace the value of someVariable with the new value
    awk -v new_value="$new_value" '/export let SE1_server/ {$5 = "\"" new_value "\";"} 1' "$javascript_file" > tmpfile && mv tmpfile "$javascript_file"

    echo -e "    ${GREEN}OUTPUT: SUCCESS.${NC}"
    echo -e ""
fi

##########################################################################################################
# Compile the server instance 1
##########################################################################################################
echo -e "${YELLOW}[4] Building of the React Code of Server Instance 1.${NC}"
cd ../instances/client
if [[ ${usecase} == 3 ]]; then
    echo -e "    ${BROWN}OUTPUT: SKIP${NC}"
fi

##########################################################################################################
# Installation of libraries for Server Instance 1
##########################################################################################################
if [[ ${usecase} == 1 ]] || [[ ${usecase} == 2 ]]; then
    echo -e "    ${BROWN}OUTPUT: Do you want to install the libraries for Server Instance 1?${NC} (y/n)"

    while true; do
        echo -e "    Input: \c"
        read buildSE1
        if [[ ${buildSE1} == "y" ]]; then
            echo -e "    ${BROWN}OUTPUT: Install libraries for Server Instance 1...${NC}"
            # Define a temporary file as a flag
            flag_file="/tmp/npm_build_complete.flag"
            gnome-terminal -- bash -c "npm install && touch $flag_file"
            # Wait until the flag file is created, indicating completion of pip install
            while [ ! -e "$flag_file" ]; do
                sleep 1
            done
            # Remove the flag file
            rm "$flag_file"
            echo -e "    ${GREEN}OUTPUT: SUCCESS.${NC}"

            break
        elif [[  ${buildSE1} == "n" ]]; then
            break
        else
            echo -e "    ${RED}Invalid response!${NC}"
        fi
    done
fi

##########################################################################################################
# Building for Server Instance 1
##########################################################################################################
if [[ ${usecase} == 1 ]] || [[ ${usecase} == 2 ]]; then
    echo -e "    ${BROWN}OUTPUT: Do you want to build Server Instance 1?${NC} (y/n)"
    while true; do
        echo -e "    Input: \c"
        read buildSE1
        if [[ ${buildSE1} == "y" ]]; then
            echo -e "    ${BROWN}OUTPUT: Build Server Instance 1...${NC}"
            # Define a temporary file as a flag
            flag_file="/tmp/npm_build_complete.flag"
            gnome-terminal -- bash -c "npm run build && touch $flag_file"
            # Wait until the flag file is created, indicating completion of pip install
            while [ ! -e "$flag_file" ]; do
                sleep 1
            done
            # Remove the flag file
            rm "$flag_file"
            echo -e "    ${GREEN}OUTPUT: SUCCESS.${NC}"

            echo -e "    ${BROWN}OUTPUT: Copy build of Server Instance 1 to <project_root>/instances/server_1/ColorTransferLab ...${NC}"
            cp -a build/. ../server_1/ColorTransferLab
            echo -e "    ${GREEN}OUTPUT: SUCCESS.${NC}"
            break
        elif [[  ${buildSE1} == "n" ]]; then
            break
        else
            echo -e "    ${RED}Invalid response!${NC}"
        fi
    done

    echo -e ""
fi

##########################################################################################################
# Download weights for Server Instance 2
##########################################################################################################
echo -e "${YELLOW}[5] Download necessary files for Server Instance 2.${NC}"
echo -e "    ${BROWN}OUTPUT: Download and Unzip Models.zip...${NC}"
cd ../server_2
# check if folder Models already exist
# If the environment already exists, ask the user if he/she wants to replace it
DIR_MODELS="Models/"
if [ -d "$DIR_MODELS" ]; then
    echo -e "    ${RED}OUTPUT: The Models folder already exists. Do you want to replace it?${NC} (y/n)"
    while true; do
        echo -e "    INPUT: \c"
        read replaceMODELS
        if [[ ${replaceMODELS} == "y" ]]; then
        
            # Define a temporary file as a flag
            flag_file="/tmp/download_model_complete.flag"
            gnome-terminal -- bash -c "wget https://potechius.com/Downloads/Models.zip; unzip Models.zip; rm Models.zip && touch $flag_file"
            # Wait until the flag file is created, indicating completion of pip install
            while [ ! -e "$flag_file" ]; do
                sleep 1
            done
            # Remove the flag file
            rm "$flag_file"

            echo -e "    ${GREEN}OUTPUT: SUCCESS.${NC}"
            break
        elif [[  ${replaceMODELS} == "n" ]]; then
            break
        else
            echo -e "    ${RED}Invalid response!${NC}"
        fi
    done
else
    # Define a temporary file as a flag
    flag_file="/tmp/download_model_complete.flag"
    gnome-terminal -- bash -c "wget https://potechius.com/Downloads/Models.zip; unzip Models.zip; rm Models.zip && touch $flag_file"
    # Wait until the flag file is created, indicating completion of pip install
    while [ ! -e "$flag_file" ]; do
        sleep 1
    done
    # Remove the flag file
    rm "$flag_file"
    echo -e "    ${GREEN}OUTPUT: SUCCESS.${NC}"
fi

##########################################################################################################
# Download testdata for Server Instance 2
##########################################################################################################
echo -e "    ${BROWN}OUTPUT: Download and Unzip Testdata.zip...${NC}"
cd ../server_2
# check if folder Models already exist
# If the environment already exists, ask the user if he/she wants to replace it
DIR_DATA="data/"
DIR_PREVIEWS="previews/"
if [ -d "$DIR_DATA" ] && [ -d "$DIR_PREVIEWS" ]; then
    echo -e "    ${RED}OUTPUT: The data and the previews folder already exists. Do you want to replace it?${NC} (y/n)"
    while true; do
        echo -e "    INPUT: \c"
        read replaceDATA
        if [[ ${replaceDATA} == "y" ]]; then
        
            # Define a temporary file as a flag
            flag_file="/tmp/download_model_complete.flag"
            gnome-terminal -- bash -c "wget https://potechius.com/Downloads/Testdata.zip; unzip Testdata.zip; rm Testdata.zip && touch $flag_file"
            # Wait until the flag file is created, indicating completion of pip install
            while [ ! -e "$flag_file" ]; do
                sleep 1
            done
            # Remove the flag file
            rm "$flag_file"

            echo -e "    ${GREEN}OUTPUT: SUCCESS.${NC}"
            break
        elif [[  ${replaceDATA} == "n" ]]; then
            break
        else
            echo -e "    ${RED}Invalid response!${NC}"
        fi
    done
else
    # Define a temporary file as a flag
    flag_file="/tmp/download_model_complete.flag"
    gnome-terminal -- bash -c "wget https://potechius.com/Downloads/Testdata.zip; unzip Testdata.zip; rm Testdata.zip && touch $flag_file"
    # Wait until the flag file is created, indicating completion of pip install
    while [ ! -e "$flag_file" ]; do
        sleep 1
    done
    # Remove the flag file
    rm "$flag_file"
    echo -e "    ${GREEN}OUTPUT: SUCCESS.${NC}"
fi

##########################################################################################################
# Provision of information how to run the app
##########################################################################################################
if [[ ${usecase} == 1 ]]; then
    echo -e "${YELLOW}[6] Run the application by running the script ./remoteapp.sh${NC}"
elif [[ ${usecase} == 2 ]]; then 
    echo -e "${YELLOW}[6] Run the application by running the script ./localapp.sh${NC}"
elif [[ ${usecase} == 3 ]]; then 
    echo -e "${YELLOW}[6] Run the application by running the script ./ceapp.sh${NC}"
fi