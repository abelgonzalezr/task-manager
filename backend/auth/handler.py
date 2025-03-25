import os
import json
import boto3
import hmac
import hashlib
import base64
from typing import Dict, Any
from botocore.exceptions import ClientError
from aws_lambda_powertools import Logger
from utils.http import success_response, error_response, parse_body
from utils.models import UserCreate, UserLogin

# Configure logger
logger = Logger(service="auth-service")

# Get Cognito configuration
USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID")
CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID")
CLIENT_SECRET = os.environ.get("COGNITO_CLIENT_SECRET", "")
REGION = os.environ.get("REGION", "us-east-1")

# Cognito client
cognito = boto3.client('cognito-idp', region_name=REGION)


def get_secret_hash(username: str) -> str:
    """
    Calculates the secret hash for a user.
    
    Args:
        username: Username (email)
        
    Returns:
        Secret hash encoded in base64
    """
    message = username + CLIENT_ID
    dig = hmac.new(
        str(CLIENT_SECRET).encode('utf-8'),
        msg=str(message).encode('utf-8'),
        digestmod=hashlib.sha256
    ).digest()
    return base64.b64encode(dig).decode()


@logger.inject_lambda_context
def register(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Registers a new user in Cognito.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        HTTP response
    """
    try:
        # Parse body
        body = parse_body(event)
        
        # Validate data with Pydantic
        user_data = UserCreate(**body)
        
        # Registration parameters
        sign_up_params = {
            "ClientId": CLIENT_ID,
            "Username": user_data.email,
            "Password": user_data.password,
            "UserAttributes": [
                {
                    'Name': 'email',
                    'Value': user_data.email
                },
                {
                    'Name': 'name',
                    'Value': user_data.name
                }
            ],
            "SecretHash": get_secret_hash(user_data.email)
        }
        
        # Register user in Cognito
        response = cognito.sign_up(**sign_up_params)
        
        # Auto-confirm the user
        cognito.admin_confirm_sign_up(
            UserPoolId=USER_POOL_ID,
            Username=user_data.email
        )
        
        return success_response({
            "message": "User registered successfully",
            "user_id": response["UserSub"]
        }, 201)
        
    except ValueError as e:
        # Data validation error
        logger.error(f"Validation error: {str(e)}")
        return error_response(str(e), 422, "validation_error")
        
    except ClientError as e:
        # Cognito error
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        
        logger.error(f"Cognito error: {error_code} - {error_message}")
        
        if error_code == "UsernameExistsException":
            return error_response("Email is already registered", 409, "user_exists")
        elif error_code == "InvalidPasswordException":
            return error_response("Password does not meet the requirements", 400, "invalid_password")
        else:
            return error_response(f"Error registering user: {error_message}", 400, error_code)
            
    except Exception as e:
        # General error
        logger.exception("Unexpected error while registering user")
        return error_response("Unexpected error while registering user", 500, "server_error")


@logger.inject_lambda_context
def login(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Authenticates a user with Cognito.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        HTTP response with authentication tokens
    """
    try:
        # Parse body
        body = parse_body(event)
        
        # Validate data with Pydantic
        user_data = UserLogin(**body)
        
        # Initiate authentication in Cognito
        response = cognito.admin_initiate_auth(
            UserPoolId=USER_POOL_ID,
            ClientId=CLIENT_ID,
            AuthFlow='ADMIN_USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': user_data.email,
                'PASSWORD': user_data.password,
                'SECRET_HASH': get_secret_hash(user_data.email)
            }
        )
        
        # Extract authentication tokens
        auth_result = response['AuthenticationResult']
        
        return success_response({
            "id_token": auth_result['IdToken'],
            "access_token": auth_result['AccessToken'],
            "refresh_token": auth_result['RefreshToken'],
            "expires_in": auth_result['ExpiresIn']
        })
        
    except ValueError as e:
        # Data validation error
        logger.error(f"Validation error: {str(e)}")
        return error_response(str(e), 422, "validation_error")
        
    except ClientError as e:
        # Cognito error
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        
        logger.error(f"Cognito login error: {error_code} - {error_message}")
        
        if error_code == "NotAuthorizedException":
            return error_response("Invalid credentials", 401, "invalid_credentials")
        elif error_code == "UserNotFoundException":
            return error_response("User does not exist", 404, "user_not_found")
        else:
            return error_response(f"Login error: {error_message}", 400, error_code)
            
    except Exception as e:
        # General error
        logger.exception("Unexpected error during login")
        return error_response("Unexpected error during login", 500, "server_error") 