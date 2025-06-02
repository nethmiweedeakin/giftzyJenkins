# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
