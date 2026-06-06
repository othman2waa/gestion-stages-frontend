FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# --legacy-peer-deps : npm 10 refuse le conflit de peer deps (ng2-charts vs Angular 18)
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/gestion-stages-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80