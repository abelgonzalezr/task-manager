import json
from typing import Dict, Any, Optional, Union, List
from aws_lambda_powertools.utilities.typing import LambdaContext


def create_response(
    status_code: int, 
    body: Union[Dict[str, Any], List[Dict[str, Any]], str] = None,
    headers: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Creates an HTTP response for API Gateway.
    
    Args:
        status_code: HTTP status code
        body: Response body (can be a dictionary, list or string)
        headers: Additional HTTP headers
        
    Returns:
        Dictionary formatted for API Gateway
    """
    default_headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true"
    }
    
    if headers:
        default_headers.update(headers)
    
    response = {
        "statusCode": status_code,
        "headers": default_headers
    }
    
    if body is not None:
        if isinstance(body, str):
            response["body"] = body
        else:
            response["body"] = json.dumps(body)
    
    return response


def success_response(data: Union[Dict[str, Any], List[Dict[str, Any]], str] = None, status_code: int = 200) -> Dict[str, Any]:
    """
    Creates a successful HTTP response.
    """
    return create_response(status_code, data)


def error_response(
    message: str, 
    status_code: int = 400, 
    error_code: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates an HTTP error response.
    """
    body = {"message": message}
    if error_code:
        body["error_code"] = error_code
    
    return create_response(status_code, body)


def get_user_from_event(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Extracts user information from the API Gateway event.
    
    Args:
        event: API Gateway event
        
    Returns:
        User information or None if not found
    """
    # Get user from JWT token payload
    if "requestContext" in event and "authorizer" in event["requestContext"]:
        claims = event["requestContext"]["authorizer"].get("claims", {})
        if claims:
            return {
                "user_id": claims.get("sub"),
                "email": claims.get("email"),
                "name": claims.get("name", "")
            }
    
    return None


def parse_body(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parses the HTTP request body.
    
    Args:
        event: API Gateway event
        
    Returns:
        Request body as a dictionary
    """
    if "body" not in event:
        return {}
    
    body = event["body"]
    if body is None:
        return {}
    
    try:
        return json.loads(body)
    except json.JSONDecodeError:
        return {} 