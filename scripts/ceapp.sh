##########################################################################################################
# Removes all previous in- and outputs
##########################################################################################################
clear


RED='\033[0;31m'
GREEN='\033[0;32m'
LIGHTGREEN='\033[1;32m'
YELLOW='\033[1;33m'
BROWN='\033[0;33m'
NC='\033[0m' # No Color


source "../ressources/env/bin/activate"


##########################################################################################################
#  Run Server Instance 1
##########################################################################################################
echo -e "${GREEN}[1] Run Server Instance 2${NC}"
cd ../instances/server_2

gnome-terminal -- bash -c "python main.py"

sleep 5

##########################################################################################################
#  Show User URL
##########################################################################################################
echo -e "${GREEN}[3] Open app via https://potechius.com/ColorTransferLab/${NC}"

# URL of the webpage you want to open
webpage_url="https://potechius.com/ColorTransferLab/"

# Open the webpage in the default web browser
xdg-open "$webpage_url"