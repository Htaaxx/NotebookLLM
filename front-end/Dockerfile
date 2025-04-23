# Use the official Node.js image as a base
FROM --platform=linux/amd64 node:18

# Define build-time arguments
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

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the Next.js application (create the `.next` folder)
RUN npm run build

# Expose port 3000 to allow access to the app
EXPOSE 3000

# Run the Next.js app
CMD ["npm", "run", "start"]