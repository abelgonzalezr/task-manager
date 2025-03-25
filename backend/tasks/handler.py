import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
from aws_lambda_powertools import Logger
from utils.http import success_response, error_response, parse_body, get_user_from_event
from utils.db import get_collection, serialize_mongodb_doc
from utils.models import Task, TaskCreate, TaskUpdate, TaskStatus

# Configure logger
logger = Logger(service="tasks-service")

# MongoDB collection
TASKS_COLLECTION = "tasks"


@logger.inject_lambda_context
def get_tasks(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Retrieves all tasks of the authenticated user.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        HTTP response with task list
    """
    try:
        # Get user information
        user = get_user_from_event(event)
        if not user:
            return error_response("User not authenticated", 401, "unauthorized")
        
        user_id = user["user_id"]
        
        # Get tasks from MongoDB
        collection = get_collection(TASKS_COLLECTION)
        tasks = list(collection.find({"user_id": user_id}))
        
        # Serialize documents for JSON
        serialized_tasks = [serialize_mongodb_doc(task) for task in tasks]
        
        return success_response(serialized_tasks)
        
    except Exception as e:
        logger.exception("Error retrieving tasks")
        return error_response("Error retrieving tasks", 500, "server_error")


@logger.inject_lambda_context
def get_task(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Retrieves a specific task of the authenticated user.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        HTTP response with the task
    """
    try:
        # Get user information
        user = get_user_from_event(event)
        if not user:
            return error_response("User not authenticated", 401, "unauthorized")
        
        user_id = user["user_id"]
        
        # Get task ID from path parameters
        task_id = event.get("pathParameters", {}).get("taskId")
        if not task_id:
            return error_response("Task ID not provided", 400, "missing_task_id")
        
        # Find the task in MongoDB
        collection = get_collection(TASKS_COLLECTION)
        task = collection.find_one({"id": task_id, "user_id": user_id})
        
        if not task:
            return error_response("Task not found", 404, "task_not_found")
        
        # Serialize document for JSON
        serialized_task = serialize_mongodb_doc(task)
        
        return success_response(serialized_task)
        
    except Exception as e:
        logger.exception("Error retrieving task")
        return error_response("Error retrieving task", 500, "server_error")


@logger.inject_lambda_context
def create_task(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Creates a new task for the authenticated user.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        HTTP response with the created task
    """
    try:
        # Get user information
        user = get_user_from_event(event)
        if not user:
            return error_response("User not authenticated", 401, "unauthorized")
        
        user_id = user["user_id"]
        
        # Parse body
        body = parse_body(event)
        
        # Validate data with Pydantic
        task_data = TaskCreate(**body)
        
        # Create new task
        task = Task(
            id=str(uuid.uuid4()),
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            user_id=user_id,
            created_at=datetime.utcnow()
        )
        
        # Save to MongoDB
        collection = get_collection(TASKS_COLLECTION)
        collection.insert_one(task.to_dict())
        
        return success_response(task.to_dict(), 201)
        
    except ValueError as e:
        # Data validation error
        logger.error(f"Validation error: {str(e)}")
        return error_response(str(e), 422, "validation_error")
        
    except Exception as e:
        # General error
        logger.exception("Error creating task")
        return error_response("Error creating task", 500, "server_error")


@logger.inject_lambda_context
def update_task(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Updates an existing task of the authenticated user.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        HTTP response with the updated task
    """
    try:
        # Get user information
        user = get_user_from_event(event)
        if not user:
            return error_response("User not authenticated", 401, "unauthorized")
        
        user_id = user["user_id"]
        
        # Get task ID from path parameters
        task_id = event.get("pathParameters", {}).get("taskId")
        if not task_id:
            return error_response("Task ID not provided", 400, "missing_task_id")
        
        # Parse body
        body = parse_body(event)
        
        # Validate data with Pydantic
        task_update = TaskUpdate(**body)
        
        # Verify that the task exists and belongs to the user
        collection = get_collection(TASKS_COLLECTION)
        existing_task = collection.find_one({"id": task_id, "user_id": user_id})
        
        if not existing_task:
            return error_response("Task not found", 404, "task_not_found")
        
        # Build update
        update_data = {}
        if task_update.title is not None:
            update_data["title"] = task_update.title
        if task_update.description is not None:
            update_data["description"] = task_update.description
        if task_update.status is not None:
            update_data["status"] = task_update.status
        
        update_data["updated_at"] = datetime.utcnow()
        
        # Update in MongoDB
        collection.update_one(
            {"id": task_id, "user_id": user_id},
            {"$set": update_data}
        )
        
        # Get updated task
        updated_task = collection.find_one({"id": task_id, "user_id": user_id})
        serialized_task = serialize_mongodb_doc(updated_task)
        
        return success_response(serialized_task)
        
    except ValueError as e:
        # Data validation error
        logger.error(f"Validation error: {str(e)}")
        return error_response(str(e), 422, "validation_error")
        
    except Exception as e:
        # General error
        logger.exception("Error updating task")
        return error_response("Error updating task", 500, "server_error")


@logger.inject_lambda_context
def delete_task(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Deletes a task of the authenticated user.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        HTTP response with confirmation
    """
    try:
        # Get user information
        user = get_user_from_event(event)
        if not user:
            return error_response("User not authenticated", 401, "unauthorized")
        
        user_id = user["user_id"]
        
        # Get task ID from path parameters
        task_id = event.get("pathParameters", {}).get("taskId")
        if not task_id:
            return error_response("Task ID not provided", 400, "missing_task_id")
        
        # Verify that the task exists and belongs to the user
        collection = get_collection(TASKS_COLLECTION)
        existing_task = collection.find_one({"id": task_id, "user_id": user_id})
        
        if not existing_task:
            return error_response("Task not found", 404, "task_not_found")
        
        # Delete from MongoDB
        collection.delete_one({"id": task_id, "user_id": user_id})
        
        return success_response({"message": "Task successfully deleted"})
        
    except Exception as e:
        # General error
        logger.exception("Error deleting task")
        return error_response("Error deleting task", 500, "server_error") 