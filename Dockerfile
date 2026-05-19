# Stage 1: Build the React application using Node
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm ci

# Copy source code
COPY . .

# Build the production bundles
RUN npm run build

# Stage 2: Serve the build artifacts using Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
