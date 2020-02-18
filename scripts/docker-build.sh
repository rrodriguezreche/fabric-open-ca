#!/bin/bash
source ./utils.sh

build(){
    printSection "Creating docker images"
    cd ../ca
    docker build -t fabric-openca-core ./
    checkFatalError $?
    cd -
}

build
