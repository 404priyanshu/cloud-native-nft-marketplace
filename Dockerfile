FROM node:22-alpine AS workspace

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY . .

ARG APP_FILTER
RUN pnpm --filter "${APP_FILTER}" build

ENV NODE_ENV=production
ENV APP_FILTER=${APP_FILTER}

CMD ["sh", "-c", "pnpm --filter \"$APP_FILTER\" start"]
