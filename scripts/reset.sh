#!/bin/bash
source ./utils.sh

reset(){
    printSection "Reset files and data"
    rm -rf ../volumes/fabric-ca-server/*
    checkFatalError $?
    docker rm $(docker ps --filter "status=exited" --filter "name=fabric" -q) &> /dev/null \
        || echo "No docker containers have been found"
    docker volume rm --force fabric-open-ca_fabric-openca-core-volume
    checkFatalError $?
}

reset
