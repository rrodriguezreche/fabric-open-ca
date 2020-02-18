FROM hyperledger/fabric-ca:1.4
RUN groupadd -r fabric && useradd --no-log-init -r -g fabric fabric --uid 1000
RUN mkdir -p /etc/hyperledger/fabric-ca-server
RUN chown fabric:fabric -R /etc/hyperledger
ADD --chown=fabric:fabric fabric-ca-server-config.yaml /var
USER fabric
ENTRYPOINT cp /var/fabric-ca-server-config.yaml /etc/hyperledger/fabric-ca-server \
    && fabric-ca-server start
