FROM node:20-slim AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build the app
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app

# Install a lightweight static file server
RUN npm install -g serve

# Copy built assets and expose the service port
COPY --from=builder /app/build ./build
EXPOSE 30002

# Serve the production build for the reverse proxy
CMD ["serve", "-s", "build", "-l", "30002", "--single"]
