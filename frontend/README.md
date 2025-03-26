# Task Manager Frontend

This is the frontend for the Task Manager application, built with React, TypeScript, and Material UI.

## Features

- User authentication (login/registration)
- Task management (create, read, update, delete)
- Task status tracking
- Statistics visualization

## Prerequisites

- Node.js 14+ and npm
- Backend API endpoint (either deployed or running locally)

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables by creating a `.env.local` file:

```
REACT_APP_API_URL=your_api_endpoint
```

4. Start the development server:

```bash
npm start
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Runs the test suite
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App
- `./deploy.sh` - Builds and provides deployment instructions

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/services/` - API services
- `src/context/` - React context providers
- `src/types/` - TypeScript interfaces and types
- `src/tests/` - Test files
- `src/utils/` - Utility functions

## Deployment

For detailed deployment instructions, see the [DEPLOYMENT.md](./DEPLOYMENT.md) file.

## Authentication Flow

The application uses JWT-based authentication:

1. User registers or logs in via the backend API which connects to AWS Cognito
2. The API returns JWT tokens (`id_token`, `access_token`, `refresh_token`)
3. Tokens are stored in localStorage
4. The id_token is:
   - Decoded to extract user information (name, email, user ID)
   - Included as a Bearer token in the Authorization header for API requests
5. Protected routes check for the presence of the token
6. The AuthContext provides authentication state across the application

JWT tokens contain information about the user and have an expiration time. They are automatically included in API requests through an Axios interceptor.

## Testing

The application includes unit tests for components. Run the test suite with:

```bash
npm test
```

## License

This project is licensed under the MIT License.
