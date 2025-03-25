import json
import pytest
from unittest.mock import patch, MagicMock
from auth.handler import register, login
from botocore.exceptions import ClientError

# Mock del evento de API Gateway
@pytest.fixture
def mock_register_event():
    return {
        "body": json.dumps({
            "email": "test@example.com",
            "password": "SecurePassword123!",
            "name": "Test User"
        })
    }

@pytest.fixture
def mock_login_event():
    return {
        "body": json.dumps({
            "email": "test@example.com",
            "password": "SecurePassword123!"
        })
    }

# Test para el registro exitoso
def test_register_success(mock_register_event):
    # Mock de la respuesta de Cognito
    cognito_response = {
        "UserSub": "user123",
        "UserConfirmed": False
    }
    
    # Configurar mocks
    with patch("auth.handler.cognito.sign_up", return_value=cognito_response) as mock_sign_up, \
         patch("auth.handler.cognito.admin_confirm_sign_up") as mock_confirm:
        
        # Llamar a la función
        response = register(mock_register_event, {})
        
        # Verificar resultado
        assert response["statusCode"] == 201
        body = json.loads(response["body"])
        assert body["message"] == "Usuario registrado exitosamente"
        assert body["user_id"] == "user123"
        
        # Verificar que se llamó a Cognito con los parámetros correctos
        mock_sign_up.assert_called_once()
        mock_confirm.assert_called_once()

# Test para el registro con error de usuario existente
def test_register_user_exists(mock_register_event):
    # Crear un error de ClientError para usuario existente
    error_response = {
        "Error": {
            "Code": "UsernameExistsException",
            "Message": "User already exists"
        }
    }
    exception = ClientError(error_response, "SignUp")
    
    # Configurar mock para lanzar la excepción
    with patch("auth.handler.cognito.sign_up", side_effect=exception):
        # Llamar a la función
        response = register(mock_register_event, {})
        
        # Verificar resultado
        assert response["statusCode"] == 409
        body = json.loads(response["body"])
        assert "ya está registrado" in body["message"]

# Test para login exitoso
def test_login_success(mock_login_event):
    # Mock de la respuesta de Cognito
    cognito_response = {
        "AuthenticationResult": {
            "IdToken": "id-token-value",
            "AccessToken": "access-token-value",
            "RefreshToken": "refresh-token-value",
            "ExpiresIn": 3600
        }
    }
    
    # Configurar mock
    with patch("auth.handler.cognito.initiate_auth", return_value=cognito_response) as mock_auth:
        # Llamar a la función
        response = login(mock_login_event, {})
        
        # Verificar resultado
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["id_token"] == "id-token-value"
        assert body["access_token"] == "access-token-value"
        assert body["refresh_token"] == "refresh-token-value"
        
        # Verificar que se llamó a Cognito con los parámetros correctos
        mock_auth.assert_called_once()

# Test para login con credenciales inválidas
def test_login_invalid_credentials(mock_login_event):
    # Crear un error de ClientError para credenciales inválidas
    error_response = {
        "Error": {
            "Code": "NotAuthorizedException",
            "Message": "Incorrect username or password."
        }
    }
    exception = ClientError(error_response, "InitiateAuth")
    
    # Configurar mock para lanzar la excepción
    with patch("auth.handler.cognito.initiate_auth", side_effect=exception):
        # Llamar a la función
        response = login(mock_login_event, {})
        
        # Verificar resultado
        assert response["statusCode"] == 401
        body = json.loads(response["body"])
        assert "Credenciales inválidas" in body["message"] 