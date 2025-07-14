FROM node:18-alpine

WORKDIR /app

# Install dependencies for running Docker commands from within container
RUN apk add --no-cache docker-cli

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["npm", "start"]