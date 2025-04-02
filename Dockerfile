# Build stage
FROM denoland/deno:latest AS builder
WORKDIR /app
COPY apps/tmdb-mcp ./apps/tmdb-mcp
COPY pkgs ./pkgs
COPY deno.json ./deno.json
COPY deno.lock ./deno.lock
RUN deno install
RUN deno cache ./apps/tmdb-mcp/main.ts

# Production stage
FROM denoland/deno:latest
WORKDIR /app/apps/tmdb-mcp

COPY --from=builder /app/apps/tmdb-mcp .
COPY --from=builder /app/pkgs /app/pkgs
COPY --from=builder /app/deno.json /app/deno.json
COPY --from=builder /app/deno.lock /app/deno.lock

ENV PORT=4242
ENV IS_DEV=false

EXPOSE 4242
CMD ["deno", "run", "--config", "/app/deno.json", "-REN", "main.ts"]
