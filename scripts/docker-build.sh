#!/bin/bash
source ./utils.sh

build(){
    printSection "Creating docker images"
    cd ../ca
    docker build -t fabric-openca-core ./
    checkFatalError $?
    cd -

    cd ../app
    docker build -t fabric-openca-registrar ./
    checkFatalError $?
    cd -
}

build
