FROM node:22.23.4-alpine3.24

RUN apk add --no-cache tini fontconfig ttf-dejavu \
 && npm install -g mint@4.2.1126 \
 && npm cache clean --force

WORKDIR /docs
COPY --chown=node:node . .
USER node

RUN (mint dev --no-open > /tmp/warm.log 2>&1 &) \
 && timeout 600 sh -c 'until grep -q "preview ready" /tmp/warm.log; do sleep 2; done' \
 && pkill -f "mint dev"; rm -rf /tmp/warm.log /home/node/.mintlify/preview-locks

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/favicon.svg || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["mint", "dev", "--no-open", "--host"]
