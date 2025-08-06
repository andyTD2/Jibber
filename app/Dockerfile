FROM node:18

# Set working directory
WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/

RUN cd backend && npm install
RUN cd frontend && npm install

# Copy entire frontend code and build React
COPY frontend ./frontend
RUN cd frontend && npm run build

# Move React build to backend directory
RUN cp -r frontend/build backend/build

# Copy backend code
COPY backend ./backend

# Set working directory to backend
WORKDIR /app/backend

# Expose backend port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
