from typing import Optional, Tuple
from datetime import datetime, date, timedelta
from openai import OpenAI
import os
import json
import hashlib


CLIENT = OpenAI()


def calculate_file_hash(file_path: str) -> str:
    """Calculate SHA-256 hash of a file."""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()


def upload_file(file_path: str, vector_store_id: str):
    file_name = os.path.basename(file_path)
    try:
        file_response = CLIENT.files.create(file=open(file_path, 'rb'), purpose="assistants")
        attach_response = CLIENT.vector_stores.files.create(
            vector_store_id=vector_store_id,
            file_id=file_response.id
        )
        return {"file": file_name, "status": "success"}
    except Exception as e:
        print(f"Error with {file_name}: {str(e)}")
        return {"file": file_name, "status": "failed", "error": str(e)}


def create_vector_store(store_name: str) -> dict:
    try:
        vector_store = CLIENT.vector_stores.create(name=store_name)
        details = {
            "id": vector_store.id,
            "name": vector_store.name,
            "created_at": vector_store.created_at,
            "file_count": vector_store.file_counts.completed
        }
        print("Vector store created:", details)
        return details
    except Exception as e:
        print(f"Error creating vector store: {e}")
        return {}


def read_vs_records(json_file_path: str = "data/vs_record.json") -> dict:
    """Read vector store records from a JSON file."""
    try:
        with open(json_file_path, 'r') as file:
            records = json.load(file)
        return records
    except (FileNotFoundError, json.JSONDecodeError):
        # Return empty dict if file doesn't exist or is invalid
        return {}


def save_vs_records(vs_records: dict, json_file_path: str = "data/vs_record.json") -> None:
    """Save vector store records to a JSON file."""
    with open(json_file_path, 'w') as file:
        json.dump(vs_records, file, indent=2)


def vs_setup(names: list[str], paths: list[str]) -> dict:
    """
    Creates vector stores (if not present), uploads files, and returns IDs of OpenAI vector search files.
    Only creates a new vector store if its name is not already in the records.
    Implements file hash caching to avoid re-uploading unchanged files.
    """
    # Read existing records
    vs_records = read_vs_records()
    
    # Process each name and path
    for n, p in zip(names, paths):
        current_hash = calculate_file_hash(p)
        
        # Check if a vector store with this name already exists
        if n in vs_records:
            print(f"Vector store '{n}' already exists with ID: {vs_records[n]['id']}")
            
            # Check if we have a hash record for this file
            file_changed = True
            if 'files' in vs_records[n] and p in vs_records[n]['files']:
                stored_hash = vs_records[n]['files'][p]
                if stored_hash == current_hash:
                    print(f"File '{p}' unchanged since last upload, skipping...")
                    file_changed = False
                else:
                    print(f"File '{p}' has changed, re-uploading...")
            
            # Upload file if it's changed or new
            if file_changed:
                upload_result = upload_file(file_path=p, vector_store_id=vs_records[n]['id'])
                # Update file hash in records
                if 'files' not in vs_records[n]:
                    vs_records[n]['files'] = {}
                vs_records[n]['files'][p] = current_hash
        else:
            # Create new vector store
            store_details = create_vector_store(store_name=n)
            if store_details:
                vs_records[n] = store_details
                vs_records[n]['files'] = {p: current_hash}
                # Upload file to the new vector store
                upload_file(file_path=p, vector_store_id=store_details['id'])
    
    # Save updated records
    save_vs_records(vs_records)
    
    return vs_records


def validate_date_format(date_str: str) -> Tuple[bool, Optional[str]]:
    """
    Validate that a date string is in the correct format (YYYY-MM-DD) and is a valid date.
    
    Args:
        date_str: The date string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True, None
    except ValueError:
        return False, "Invalid date format. Please use YYYY-MM-DD format."


def validate_date_range(start_date_str: str, end_date_str: str) -> Tuple[bool, Optional[str]]:
    """
    Validate that a date range is valid (start date is before or equal to end date)
    and not too far in the future or past.
    
    Args:
        start_date_str: The start date string in YYYY-MM-DD format
        end_date_str: The end date string in YYYY-MM-DD format
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        
        # Check if start date is before or equal to end date
        if start_date > end_date:
            return False, "Start date must be before or equal to end date."
        
        # Check if dates are not too far in the past
        today = date.today()
        if start_date < today:
            return False, "Cannot book dates in the past."
        
        # Check if dates are not too far in the future (e.g., more than 1 year)
        max_future_date = today + timedelta(days=365)
        if start_date > max_future_date or end_date > max_future_date:
            return False, "Cannot book dates more than 1 year in advance."
        
        # Check if the stay is not too long (e.g., more than 30 days)
        stay_length = (end_date - start_date).days
        if stay_length > 30:
            return False, "Cannot book stays longer than 30 days."
            
        return True, None
    except ValueError:
        return False, "Invalid date format. Please use YYYY-MM-DD format."


def validate_number_of_persons(num_persons: int) -> Tuple[bool, Optional[str]]:
    """
    Validate that the number of persons is within acceptable limits.
    
    Args:
        num_persons: The number of persons
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not isinstance(num_persons, int):
        return False, "Number of persons must be an integer."
    
    if num_persons <= 0:
        return False, "Number of persons must be positive."
    
    if num_persons > 6:
        return False, "We cannot accommodate more than 6 persons in a single room."
        
    return True, None


def validate_room_type(room_type: str) -> Tuple[bool, Optional[str]]:
    """
    Validate that the room type is one of the allowed values.
    
    Args:
        room_type: The room type to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    allowed_room_types = ["budget", "superior", "executive"]
    
    if room_type not in allowed_room_types:
        return False, f"Invalid room type. Allowed values are: {', '.join(allowed_room_types)}."
        
    return True, None
