# Unified Cloud Run Container for Personal Gemini Journal
FROM node:20-slim

WORKDIR /app

# Copy root and subdirectories
COPY . .

# Build Client
WORKDIR /app/client
RUN npm install
RUN npm run build

# Setup Server
WORKDIR /app/server
RUN npm install

ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "index.js"]
