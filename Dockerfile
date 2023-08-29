FROM node:18 as builder

COPY . .
RUN npm install
RUN npm run build

FROM node:18-slim as runtime

COPY --from=builder dist .

