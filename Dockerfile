FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm
ENV PNPM_CONFIG_ENABLE_PRE_POST_SCRIPTS=true
COPY package.json ./
RUN pnpm install
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
