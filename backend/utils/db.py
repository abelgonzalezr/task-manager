import os
import json
import pymongo
from pymongo import MongoClient
from typing import Optional, Dict, List, Any
from botocore.exceptions import ClientError
from datetime import datetime, date

# Singleton for MongoDB connection
client: Optional[MongoClient] = None


def get_mongodb_client() -> MongoClient:
    """
    Gets a MongoDB connection (Singleton pattern).
    """
    global client
    if client is None:
        mongodb_uri = os.environ.get("MONGODB_URI")
        if not mongodb_uri:
            raise ValueError("MONGODB_URI environment variable is not set")
        
        # Connection configuration with connection pool for Lambda
        client = MongoClient(
            mongodb_uri,
            maxPoolSize=1,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
    return client


def get_database(db_name: Optional[str] = None) -> pymongo.database.Database:
    """
    Gets a MongoDB database.
    """
    client = get_mongodb_client()
    db_name = db_name or os.environ.get("MONGODB_DB_NAME", "task_management")
    return client[db_name]


def get_collection(collection_name: str, db_name: Optional[str] = None) -> pymongo.collection.Collection:
    """
    Gets a MongoDB collection.
    """
    db = get_database(db_name)
    return db[collection_name]


def close_mongodb_connection():
    """
    Closes the MongoDB connection.
    """
    global client
    if client:
        client.close()
        client = None


def serialize_mongodb_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Serializes a MongoDB document to be JSON-compatible.
    Converts ObjectId to string, etc.
    """
    if doc is None:
        return None
    
    result = {}
    for key, value in doc.items():
        if key == "_id" and not isinstance(value, str):
            # Convert ObjectId to string
            result["id"] = str(value)
        else:
            # Handle MongoDB specific data types
            if isinstance(value, (datetime, date)):
                result[key] = value.isoformat()
            else:
                result[key] = value
    
    return result 