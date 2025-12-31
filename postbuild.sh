#!/bin/bash
 
rm -rf ./.amplify-hosting
 
mkdir -p ./.amplify-hosting/compute
 
cp -vr ./server/lib/ ./.amplify-hosting/compute/default
cp -r ./server/node_modules ./.amplify-hosting/compute/default
 
cp -vr ./client/dist/* ./.amplify-hosting/static
 
cp server/deploy-manifest.json ./.amplify-hosting/deploy-manifest.json
