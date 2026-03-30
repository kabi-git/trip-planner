FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --production

COPY . .
RUN mkdir -p data

EXPOSE 3000
CMD ["bun", "src/index.ts"]
