FROM node:22-alpine

RUN apk add --no-cache git bash curl sudo && \
    echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/node && \
    chmod 0440 /etc/sudoers.d/node

WORKDIR /workspace

USER node

CMD ["sleep", "infinity"]
