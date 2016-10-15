sudo mongod --dbpath=/data
sudo ./usr/local/Cellar/mongodb/3.2.10/bin/mongo

Set Up
======

git clone https://github.com/andrewhannebrink/emoji-data-visualizer
cd emoji-data-visualizer
npm install
cd app
bower install
cd ..

# Install nvm
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
nvm install 6.6.0
nvm use 6.6.0

# Parse emoji-data.txt
npm run parse

# Install MongoDB
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start
