# Task Manager Application

A full-stack task management application built with a React frontend and AWS Lambda serverless backend.

## Architecture

![Architecture Diagram](./assets/Architecture.png)

The application consists of:

- **Frontend**: React application deployed on AWS Amplify
- **Backend**: Serverless application using AWS Lambda functions, API Gateway and Cognito for authentication
- **Database**: MongoDB Atlas for data storage

### Key Components:

1. **Frontend (AWS Amplify)**
   - React.js application with TypeScript
   - Material UI for component styling
   - Redux for state management
   - Deployed using AWS Amplify

2. **Backend (AWS Lambda)**
   - Serverless functions for authentication and task operations
   - API Gateway for HTTP request routing
   - AWS Cognito for user authentication and authorization
   - Mongodb Atlas for data storage

3. **API Endpoints**
   - Authentication endpoints for user registration and login
   - Task management endpoints (get, create, update, delete)

## Getting Started

This repository contains both the frontend and backend code for the Task Manager application. Please refer to their respective README files for detailed setup instructions:

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## Live Demo & API Documentation

The application is deployed and accessible at:
[https://master.d4rx8mhu5v0ct.amplifyapp.com/login](https://master.d4rx8mhu5v0ct.amplifyapp.com/login)

You can create a new account or use the demo credentials:
- Email: test789@example.com 
- Password: Password123#

### API Documentation
The complete API documentation is available on Postman:
[Task Manager API Documentation](https://documenter.getpostman.com/view/1027418/2sAYkKJxet#904dfc11-f5d5-4c93-8f77-d3351bf5a42a)

The documentation includes:
- Authentication endpoints
- Task management endpoints
- Request/response examples
- Error handling





## Deployment

The application is designed to be deployed on AWS using:

1. AWS Amplify for the frontend
2. Serverless Framework for the backend Lambda functions

Refer to the CloudFormation templates in the AWS directory for infrastructure as code setup.

## License

This project is licensed under the MIT License. 