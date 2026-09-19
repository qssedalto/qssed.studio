FROM node:22-bookworm-slim

ARG CODEX_VERSION=0.154.0
RUN npm install -g "@openai/codex@${CODEX_VERSION}" \
    && mkdir -p /app /data/codex-home /data/chat-workspace \
    && chown -R node:node /app /data

WORKDIR /app
COPY --chown=node:node cloud-codex/server.mjs /app/server.mjs

ENV NODE_ENV=production
ENV PORT=8080
ENV CODEX_HOME=/data/codex-home
ENV QSSEDA_CODEX_CHAT_ROOT=/data/chat-workspace

USER node
EXPOSE 8080

CMD ["node", "/app/server.mjs"]
