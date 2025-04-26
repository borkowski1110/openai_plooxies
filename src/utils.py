from agents import set_default_openai_key
from openai import OpenAI
import os
import json


# set_default_openai_key("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")
client = OpenAI() # api_key='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')


def upload_file(file_path: str, vector_store_id: str):
    file_name = os.path.basename(file_path)
    try:
        file_response = client.files.create(file=open(file_path, 'rb'), purpose="assistants")
        attach_response = client.vector_stores.files.create(
            vector_store_id=vector_store_id,
            file_id=file_response.id
        )
        return {"file": file_name, "status": "success"}
    except Exception as e:
        print(f"Error with {file_name}: {str(e)}")
        return {"file": file_name, "status": "failed", "error": str(e)}

def create_vector_store(store_name: str) -> dict:
    try:
        vector_store = client.vector_stores.create(name=store_name)
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
    """
    # Read existing records
    vs_records = read_vs_records()
    
    # Process each name and path
    for n, p in zip(names, paths):
        # Check if a vector store with this name already exists
        if n in vs_records:
            print(f"Vector store '{n}' already exists with ID: {vs_records[n]['id']}")
        else:
            # Create new vector store
            store_details = create_vector_store(store_name=n)
            if store_details:
                vs_records[n] = store_details
                # Upload file to the new vector store
                upload_file(file_path=p, vector_store_id=store_details['id'])
    
    # Save updated records
    save_vs_records(vs_records)
    
    return vs_records
