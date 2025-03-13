FROM node:18-alpine

WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Copy tsconfig files
COPY shared/tsconfig.json ./shared/
COPY frontend/tsconfig.json ./frontend/

# Copy source code
COPY shared/src ./shared/src
COPY frontend ./frontend

# Install dependencies and build
RUN npm install
RUN npm run build:shared
RUN cd frontend && npm install
RUN cd frontend && npm run build

# Expose the web port
EXPOSE 8081

# Start the app
CMD ["npm", "run", "frontend"] 