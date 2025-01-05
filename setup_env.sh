#!/bin/bash

# Exit on any error
set -e

# Install git
sudo yum install git -y

# Install Node.js and npm
echo "Updating system and installing Node.js..."
#sudo yum update -y
#sudo amazon-linux-extras enable nodejs
sudo yum install -y nodejs

# Install Python 3 and pip3
sudo yum install -y python3
sudo python3 -m ensurepip --upgrade

# Install pipenv
pip3 install --user pipenv
