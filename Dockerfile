# Use Node.js 20 Alpine Linux as base image
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build the application
FROM base AS build
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Provide temporary DATABASE_URL for build (won't be used, just prevents error)
ENV DATABASE_URL=/tmp/build.db

RUN pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

# Copy built application
COPY --from=build --chown=sveltekit:nodejs /app/build build/
COPY --from=build --chown=sveltekit:nodejs /app/node_modules node_modules/
COPY --from=build --chown=sveltekit:nodejs /app/package.json .
COPY --from=build --chown=sveltekit:nodejs /app/src/lib/server/db ./src/lib/server/db/
COPY --from=build --chown=sveltekit:nodejs /app/scripts ./scripts/

# Create data directory for SQLite database
RUN mkdir -p /app/data && chown -R sveltekit:nodejs /app/data

USER sveltekit

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL=/app/data/sqlite.db
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Start with database setup
CMD ["sh", "-c", "pnpm run db:setup && node build"]