FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better rebuild caching.
COPY package*.json ./
RUN npm ci

# Source files (overridden by bind mount in docker-compose for dev).
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
