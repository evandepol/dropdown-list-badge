# Use official Playwright image
FROM mcr.microsoft.com/playwright:v1.54.2-jammy AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
#COPY package.json package-lock.json ./
COPY package.json ./
# Use npm install which is more forgiving of platform-specific optional dependencies
RUN npm install --omit=optional
# Install Playwright browsers
RUN npx playwright install --with-deps

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
# Copy dependencies from the previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /ms-playwright /ms-playwright
RUN apt-get update && apt-get install -y jq && rm -rf /var/lib/apt/lists/*
# Copy all source files
COPY . .

# Build the TypeScript files
RUN npm run build

# Stage 3: Final image for running tests/serving
FROM base
WORKDIR /app
# Copy the built application and dependencies from the builder stage
COPY --from=builder /app .

# Expose port for local dev (optional)
EXPOSE 5000

# Default command to serve the files, allowing tests to be run against it
CMD ["sh", "-c", "NPM_CONFIG_OMIT=optional npx serve -l 5000 ."]