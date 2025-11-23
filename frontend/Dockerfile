# Etapa 1: Build
FROM node:22-slim AS builder
LABEL com.centurylinklabs.watchtower.enable="true"

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && apt-get clean && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare yarn@3.2.3 --activate


COPY . .

RUN yarn install

ENV NEXT_PUBLIC_API_URL=ttps://api.wolf-of-web3.xyz
ENV NEXT_PUBLIC_CIRCLE_APP_ID=5300d92b-3cff-50e4-b75e-ccb5fe0270d8
ENV NEXT_PUBLIC_FACEBOOK_APP_ID=2210580552770060
ARG NEXT_PUBLIC_WALLET_PROVIDER
ENV NEXT_PUBLIC_WALLET_PROVIDER=${NEXT_PUBLIC_WALLET_PROVIDER}


RUN yarn build


FROM node:22-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && apt-get clean && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare yarn@3.2.3 --activate

COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

RUN yarn install

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.ts ./


EXPOSE 3000
EXPOSE 3002

CMD ["sh", "-c", "PORT=3003; \
  if [ \"$NEXT_PUBLIC_WALLET_PROVIDER\" = \"celo\" ]; then PORT=3000; \
  elif [ \"$NEXT_PUBLIC_WALLET_PROVIDER\" = \"worldcoin\" ]; then PORT=3002; \
  fi; \
  echo \"Starting on port $PORT (provider: $NEXT_PUBLIC_WALLET_PROVIDER)\"; \
  yarn preview --host 0.0.0.0 --port $PORT"]
