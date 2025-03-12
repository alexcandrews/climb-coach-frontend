# Climb Coach

A comprehensive climbing coaching application with video analysis and real-time feedback.

## Project Structure

- `/frontend` - React Native Expo application for mobile clients
- `/backend` - Node.js server deployed on Railway
- `/shared` - Shared types and utilities

## Getting Started

1. Install dependencies:
```bash
npm run install:all
```

2. Start the frontend development server:
```bash
npm run frontend
```

3. Start the backend development server:
```bash
npm run backend:dev
```

## Deployment

### Frontend (Expo)
- Build: `npm run frontend:build`
- Update: `npm run frontend:update`

### Backend (Railway)
The backend is automatically deployed from the `/backend` directory when changes are pushed to the main branch.

## Development

- The frontend and backend maintain separate `package.json` files and dependencies
- Shared types and utilities are stored in the `/shared` directory
- Use the root scripts in `package.json` for common operations 