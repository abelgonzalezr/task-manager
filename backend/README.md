# Serverless Backend for Task Management System

This backend implements a serverless API for the task management system using AWS Lambda, API Gateway, Amazon Cognito, and MongoDB.

## Architecture

The backend is implemented as a serverless architecture using the following AWS services:

- **AWS Lambda**: For authentication and task CRUD functions
- **Amazon API Gateway**: To expose HTTP endpoints
- **Amazon Cognito**: For user management and authentication
- **MongoDB Atlas**: As a database to store tasks

## Endpoints

The API is deployed and available at the following base URL:

```
https://hqiey3eg22.execute-api.us-east-1.amazonaws.com/dev
```

### API Documentation

The complete API documentation is available in Postman Collection format and also at the following link: https://documenter.getpostman.com/view/1027418/2sAYkKJxet. To use it:

1. Download the `postman.json` file included in this repository
2. Import the collection into Postman:
   - Open Postman
   - Click on "Import"
   - Select the `postman.json` file
   - The "Task Management API" collection will appear in your collections panel

The collection includes examples of requests for all available endpoints.

### Authentication

- `POST /auth/register`: Register a new user
- `POST /auth/login`: Log in and get JWT tokens

### Tasks (require authentication)

- `GET /tasks`: Get all tasks of the user
- `GET /tasks/{taskId}`: Get a specific task
- `POST /tasks`: Create a new task
- `PUT /tasks/{taskId}`: Update an existing task
- `DELETE /tasks/{taskId}`: Delete a task

## Requirements

- Node.js v16 or higher
- Python 3.9 or higher
- Serverless Framework
- AWS account with configured credentials
- MongoDB (local or in the cloud)

## Configuration

1. Install dependencies:

```bash
npm install
pip install -r requirements.txt
```

2. Copy the example environment variables file:

```bash
cp .env.example .env
```

3. Edit the `.env` file with the appropriate values for your environment.

## Deployment

To deploy the backend on AWS:

```bash
npm run deploy
```

This will deploy the resources on AWS and show the resulting URLs. After the first deployment, the Cognito resources will be created and you will need to update your `.env` file with the generated IDs.

## Local Testing

To run unit tests:

```bash
npm test
```

## Delete Infrastructure

To delete all deployed resources on AWS:

```bash
npm run remove
```

## Workflow

1. The user registers/logs in through Amazon Cognito
2. Cognito returns JWT tokens (ID token, access token, refresh token)
3. The client uses the JWT token to authenticate when calling the endpoints
4. API Gateway validates the JWT token using the Cognito Authorizer
5. If the token is valid, it invokes the corresponding Lambda function
6. The Lambda executes the business logic and returns the response