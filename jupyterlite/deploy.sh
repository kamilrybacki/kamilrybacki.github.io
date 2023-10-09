#!/bin/bash

yum install wget

wget -qO- https://micromamba.snakepit.net/api/micromamba/linux-64/latest | tar -xvj bin/micromamba

./bin/micromamba shell init -s bash -p ~/micromamba
source ~/.bashrc

micromamba activate
micromamba install python=3.10 -c conda-forge -y

mkdir ./files
cp -r ../src/content/_jupyter/* ./files

python -m pip install -r requirements.txt
jupyter lite build --output-dir ./dist

cat ./dist/schemas/@retrolab/application-extension/top.json
