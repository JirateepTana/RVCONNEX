# Use Node.js LTS image
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build Next.js app
RUN npm run build

# Expose port (change if your app uses a different port)
EXPOSE 3001

# Start the Next.js server
CMD ["npm", "start"]