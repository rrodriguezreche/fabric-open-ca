#!/bin/bash
source ./utils.sh

build(){
    printSection "Creating docker images"
    docker build -t fabric-openca-core ../ca
    checkFatalError $?
}

build
