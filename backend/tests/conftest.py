import os
import sys
import pytest
from unittest.mock import patch

# Añadir el directorio raíz al path para que los imports funcionen correctamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Variables de entorno para pruebas
@pytest.fixture(autouse=True)
def setup_test_environment():
    """
    Configurar variables de entorno para pruebas.
    Esta función se ejecuta automáticamente antes de cada prueba.
    """
    with patch.dict(os.environ, {
        "MONGODB_URI": "mongodb://localhost:27017/test_db",
        "MONGODB_DB_NAME": "test_db",
        "COGNITO_USER_POOL_ID": "us-east-1_testpool",
        "COGNITO_CLIENT_ID": "test-client-id",
        "REGION": "us-east-1"
    }):
        yield 