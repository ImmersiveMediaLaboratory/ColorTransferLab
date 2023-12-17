# kill the process which uses port 3000
#sudo kill -9 `sudo lsof -t -i:3000`

source "server/env/bin/activate"

cd server
python main.py &

sleep 5

cd ../client
npm start &

sleep 2

#cd ..
python ../localapp.py

