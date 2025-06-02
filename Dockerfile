# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first (to leverage caching)
COPY package*.json ./

# Install dependencies inside container
RUN npm install --verbose

# Now copy the rest of the code
COPY . .

# Expose the port
EXPOSE 3000

# Start your app
CMD ["npm", "start"]
