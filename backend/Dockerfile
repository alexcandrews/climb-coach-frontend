FROM node:18-alpine

WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Copy tsconfig files
COPY shared/tsconfig.json ./shared/

# Copy source code
COPY shared/src ./shared/src
COPY backend ./backend

# Create necessary directories
RUN mkdir -p backend/uploads backend/frames

# Install dependencies and build
RUN npm install
RUN npm run build:shared
RUN cd backend && npm install

# Expose the API port
EXPOSE 8000

# Start the backend
CMD ["npm", "run", "backend:start"] 