FROM node:20-alpine

ARG VITE_WSS_URL
ENV VITE_WSS_URL=$VITE_WSS_URL

WORKDIR /app

# Copy all package.json files first for better caching
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/website/package*.json ./packages/website/
COPY packages/game-client/package*.json ./packages/game-client/
COPY packages/game-shared/package*.json ./packages/game-shared/
COPY packages/game-server/package*.json ./packages/game-server/

# Install all dependencies
RUN npm ci

# Copy source files and tsconfig files
COPY packages/game-shared ./packages/game-shared
COPY packages/game-client ./packages/game-client
COPY packages/website ./packages/website
COPY packages/game-server/tsconfig.json ./packages/game-server/

# Build the website
WORKDIR /app/packages/website
RUN npm run build

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "start"]