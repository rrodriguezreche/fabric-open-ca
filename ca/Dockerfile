# FROM ubuntu:xenial
# RUN mkdir /etc/hyperledger

FROM hyperledger/fabric-ca:1.4
RUN groupadd -r fabric && useradd --no-log-init -r -g fabric fabric --uid 1000
RUN mkdir -p /etc/hyperledger/fabric-ca-server
RUN chown fabric:fabric -R /etc/hyperledger

USER fabric
# CMD ls -lah /etc/hyperledger
ENTRYPOINT ls -lah /etc/hyperledger && fabric-ca-server start -b ${FABRIC_CA_ADMIN_CREDENTIALS}
