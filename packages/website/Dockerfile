FROM node:20-alpine AS build

ARG VITE_WSS_URL
ENV VITE_WSS_URL=$VITE_WSS_URL

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/website/package*.json ./packages/website/
COPY packages/game-client/package*.json ./packages/game-client/
COPY packages/game-shared/package*.json ./packages/game-shared/

# Install all dependencies
RUN npm ci

# Copy source files
COPY packages/game-shared ./packages/game-shared
COPY packages/game-client ./packages/game-client
COPY packages/website ./packages/website
COPY tsconfig.json ./

# Build the website
RUN npm run build -w packages/website

# Production stage
FROM node:20-alpine

WORKDIR /app/packages/website

# Copy built output and package files
COPY --from=build /app/packages/website/build ./build
COPY --from=build /app/packages/website/package*.json ./

# Install production dependencies only
RUN npm install @react-router/serve

# Expose port
EXPOSE 3000

CMD ["npx", "react-router-serve", "./build/server/index.js"]