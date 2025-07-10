# Use official Playwright image
FROM mcr.microsoft.com/playwright:v1.53.2-jammy

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Install Playwright browsers
RUN npx playwright install --with-deps

# Copy all files (including test and source)
COPY . .

# Expose port for local dev (optional)
EXPOSE 5000

# Default: run tests
CMD ["npx", "serve", "-l", "5000", "."]