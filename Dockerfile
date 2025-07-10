# Use official Playwright image as a base
FROM mcr.microsoft.com/playwright:v1.53.2-jammy as base

# Stage 1: Install dependencies
FROM base as deps
WORKDIR /app
#COPY package.json package-lock.json ./
COPY package.json ./
# Use npm install which is more forgiving of platform-specific optional dependencies
RUN npm install --omit=optional

# Stage 2: Build the application
FROM base as builder
WORKDIR /app
# Copy dependencies from the previous stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all source files
COPY . .
# Install Playwright browsers
RUN npx playwright install --with-deps
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
CMD ["npx", "serve", "-l", "5000", "."]