# Single-container image with the gateway and all services (free Render deployment).
# The per-service Dockerfiles are still used for the AWS ECS deployment.
FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends redis-server \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY gateway/package*.json ./gateway/
COPY services/auth/package*.json ./services/auth/
COPY services/chat/package*.json ./services/chat/
COPY services/agent/package*.json ./services/agent/
COPY services/billing/package*.json ./services/billing/
RUN for d in gateway services/auth services/chat services/agent services/billing; do \
      (cd $d && npm ci --omit=dev) || exit 1; \
    done

COPY . .

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "start-all.js"]
