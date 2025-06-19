# Étape 1 : Build Angular app
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
RUN npm run build --prod

# Étape 2 : Serve avec nginx
FROM nginx:alpine
COPY --from=builder /app/dist/QNB-front /usr/share/nginx/html

# Copie config nginx personnalisée (optionnelle)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
