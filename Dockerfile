# Install dependencies and prepare runtime
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

ENV NODE_ENV=production

EXPOSE 3003

# Build, migrate, and start the application at container startup
CMD ["sh", "-c", "npm run build && npm start -- -p 3003"]