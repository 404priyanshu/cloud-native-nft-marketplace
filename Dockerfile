FROM node:22-alpine AS base

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ─── Install dependencies ───
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

# ─── Build ───
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /pnpm /pnpm
COPY . .

ARG APP_FILTER
RUN pnpm --filter "${APP_FILTER}" build

# Prune dev dependencies for production
RUN pnpm prune --prod --no-optional 2>/dev/null || true

# ─── Production ───
FROM node:22-alpine AS runner

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy built app and production node_modules
COPY --from=builder --chown=appuser:appgroup /app ./
COPY --from=builder --chown=appuser:appgroup /pnpm /pnpm

ARG APP_FILTER
ENV APP_FILTER=${APP_FILTER}

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD if echo "$APP_FILTER" | grep -q "api"; then \
        wget --no-verbose --spider http://localhost:${PORT:-3001}/health || exit 1; \
      else \
        exit 0; \
      fi

CMD ["sh", "-c", "pnpm --filter \"$APP_FILTER\" start"]
