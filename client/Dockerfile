# --- Build Stage ---
FROM node:22.14-alpine AS base

RUN apk update && apk upgrade && apk add --no-cache libc6-compat

WORKDIR /app

COPY client/package*.json ./

RUN npm i

COPY client/ .

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

EXPOSE 3000

# Run the app
CMD ["npm", "start"]