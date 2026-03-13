import json
import os
from form_mapper.mapper import map_entities_to_form

# Mock LLM Output (Layer 4)
llm_output = {
    "full_name": {"value": "Abhishek Dixit", "confidence": 0.99},
    "date_of_birth": {"value": "2004-09-27", "confidence": 0.98},
    "fathers_name": {"value": "Ajay Kumar Dixit", "confidence": 0.95},
    "gender": {"value": "MALE", "confidence": 0.99},
    "aadhaar_number": {"value": "470226297140", "confidence": 0.97},
    "address": {"value": "H.No 123, Some Village, District Kanpur Nagar, UP", "confidence": 0.90}
}

schemas_dir = "form_mapper/schemas"

if not os.path.exists(schemas_dir):
    print(f"Error: Directory {schemas_dir} not found.")
else:
    for filename in os.listdir(schemas_dir):
        if filename.endswith(".json"):
            filepath = os.path.join(schemas_dir, filename)
            print(f"\n--- Testing Schema: {filename} ---")
            try:
                with open(filepath, "r") as f:
                    schema = json.load(f)
                
                mapped = map_entities_to_form(llm_output, schema)
                print(json.dumps(mapped, indent=2))
            except Exception as e:
                print(f"FAILED: {e}")
