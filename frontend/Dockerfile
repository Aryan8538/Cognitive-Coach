# Use official Node runtime
FROM node:18-alpine

# Set work directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Run production build
CMD ["npm", "run", "start"]
