# Use the official Node.js image as a base
FROM --platform=linux/amd64 node:18

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