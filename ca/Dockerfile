# FROM ubuntu:xenial
# RUN mkdir /etc/hyperledger

FROM hyperledger/fabric-ca:1.4
RUN groupadd -r fabric && useradd --no-log-init -r -g fabric fabric
RUN mkdir -p /etc/hyperledger/fabric-ca-server

USER fabric
ENTRYPOINT fabric-ca-server start -b ${FABRIC_CA_ADMIN_CREDENTIALS}
