import json
import pytest
from unittest.mock import patch, MagicMock
from tasks.handler import get_tasks, get_task, create_task, update_task, delete_task
from utils.models import TaskStatus

# Mock del evento de API Gateway con datos de usuario autenticado
@pytest.fixture
def mock_event():
    return {
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "user123",
                    "email": "test@example.com",
                    "name": "Test User"
                }
            }
        },
        "body": json.dumps({
            "title": "Test Task",
            "description": "This is a test task",
            "status": "por_hacer"
        }),
        "pathParameters": {
            "taskId": "task123"
        }
    }

# Mock de la base de datos
@pytest.fixture
def mock_db():
    with patch("tasks.handler.get_collection") as mock_get_collection:
        mock_collection = MagicMock()
        mock_get_collection.return_value = mock_collection
        yield mock_collection

# Test para obtener todas las tareas
def test_get_tasks(mock_event, mock_db):
    # Configurar mock
    mock_db.find.return_value = [
        {
            "id": "task123",
            "title": "Test Task",
            "description": "This is a test task",
            "status": "por_hacer",
            "user_id": "user123",
            "created_at": "2023-01-01T00:00:00"
        }
    ]
    
    # Llamar a la función
    response = get_tasks(mock_event, {})
    
    # Verificar resultado
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert len(body) == 1
    assert body[0]["title"] == "Test Task"
    
    # Verificar que se llamó a la base de datos con los parámetros correctos
    mock_db.find.assert_called_once_with({"user_id": "user123"})

# Test para obtener una tarea específica
def test_get_task(mock_event, mock_db):
    # Configurar mock
    mock_db.find_one.return_value = {
        "id": "task123",
        "title": "Test Task",
        "description": "This is a test task",
        "status": "por_hacer",
        "user_id": "user123",
        "created_at": "2023-01-01T00:00:00"
    }
    
    # Llamar a la función
    response = get_task(mock_event, {})
    
    # Verificar resultado
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["id"] == "task123"
    assert body["title"] == "Test Task"
    
    # Verificar que se llamó a la base de datos con los parámetros correctos
    mock_db.find_one.assert_called_once_with({"id": "task123", "user_id": "user123"})

# Test para crear una tarea
def test_create_task(mock_event, mock_db):
    # Llamar a la función
    with patch("uuid.uuid4", return_value="new-task-id"):
        response = create_task(mock_event, {})
    
    # Verificar resultado
    assert response["statusCode"] == 201
    body = json.loads(response["body"])
    assert body["id"] == "new-task-id"
    assert body["title"] == "Test Task"
    assert body["status"] == "por_hacer"
    
    # Verificar que se llamó a la base de datos para insertar
    mock_db.insert_one.assert_called_once()
    inserted_doc = mock_db.insert_one.call_args[0][0]
    assert inserted_doc["title"] == "Test Task"
    assert inserted_doc["user_id"] == "user123"

# Test para actualizar una tarea
def test_update_task(mock_event, mock_db):
    # Configurar mocks
    mock_db.find_one.side_effect = [
        # Primera llamada: verificar que la tarea existe
        {
            "id": "task123",
            "title": "Test Task",
            "description": "This is a test task",
            "status": "por_hacer",
            "user_id": "user123",
            "created_at": "2023-01-01T00:00:00"
        },
        # Segunda llamada: obtener la tarea actualizada
        {
            "id": "task123",
            "title": "Updated Task",
            "description": "This is a test task",
            "status": "in_progress",
            "user_id": "user123",
            "created_at": "2023-01-01T00:00:00",
            "updated_at": "2023-01-02T00:00:00"
        }
    ]
    
    # Modificar el body del evento
    mock_event["body"] = json.dumps({
        "title": "Updated Task",
        "status": "in_progress"
    })
    
    # Llamar a la función
    response = update_task(mock_event, {})
    
    # Verificar resultado
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["title"] == "Updated Task"
    assert body["status"] == "in_progress"
    
    # Verificar que se llamó a la base de datos para actualizar
    mock_db.update_one.assert_called_once()
    filter_arg = mock_db.update_one.call_args[0][0]
    update_arg = mock_db.update_one.call_args[0][1]["$set"]
    assert filter_arg == {"id": "task123", "user_id": "user123"}
    assert update_arg["title"] == "Updated Task"
    assert update_arg["status"] == "in_progress"

# Test para eliminar una tarea
def test_delete_task(mock_event, mock_db):
    # Configurar mock
    mock_db.find_one.return_value = {
        "id": "task123",
        "title": "Test Task",
        "description": "This is a test task",
        "status": "por_hacer",
        "user_id": "user123",
        "created_at": "2023-01-01T00:00:00"
    }
    
    # Llamar a la función
    response = delete_task(mock_event, {})
    
    # Verificar resultado
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert "message" in body
    assert "eliminada" in body["message"]
    
    # Verificar que se llamó a la base de datos para eliminar
    mock_db.delete_one.assert_called_once_with({"id": "task123", "user_id": "user123"}) 