# Étape 1 : Build Angular app
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install --force
RUN npm run build --configuration=production

# Étape 2 : Serve app with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
