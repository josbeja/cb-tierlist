# Stage 1: Build
FROM node:20-alpine as build

WORKDIR /app

# Copy dependency definitions
COPY client/package*.json ./client/

# Install dependencies
WORKDIR /app/client
RUN npm install

# Copy source code
COPY client/ .

# Build the application
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/client/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
