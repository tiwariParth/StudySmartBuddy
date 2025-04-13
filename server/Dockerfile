FROM node:18-alpine
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source
COPY . .

# Create required directories
RUN mkdir -p uploads exports

# Build TypeScript
RUN pnpm build

EXPOSE 5000
CMD ["pnpm", "start"]
