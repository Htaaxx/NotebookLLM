# Use the official Node.js image
FROM --platform=linux/amd64 node:20-alpine

# define build-time arguments
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_BACKEND_API_URL
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_BACKEND_DB_URL
ARG FRONTEND_API_URL
ARG PORT_BACKEND

# Set environment variables that will be available during the build and runtime
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_BACKEND_API_URL=$NEXT_PUBLIC_BACKEND_API_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXT_PUBLIC_BACKEND_DB_URL=$NEXT_PUBLIC_BACKEND_DB_URL
ENV FRONTEND_API_URL=$FRONTEND_API_URL
ENV PORT_BACKEND=$PORT_BACKEND

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["node", "src/server.js"]