# form_mapper/mapper.py
import re

def map_entities_to_form(layer4_output: dict, form_schema: dict) -> dict:
    """
    Maps extracted entities (Layer 4) to form fields based on the schema.
    Returns: A dictionary of key-value pairs ready for the form frontend.
    """
    mapped_data = {}
    
    # Recursively traverse fields (handling sections if present)
    def traverse_fields(fields_dict, output_dict):
        for field_key, field_def in fields_dict.items():
            # If it's a section (nested dict)
            if "fields" not in field_def and isinstance(field_def, dict) and "type" not in field_def:
                traverse_fields(field_def, output_dict)
                continue
            
            # It's a field definition
            source_entity_key = field_def.get("source_entity")
            extraction_rule = field_def.get("extraction_rule")
            
            value = ""
            confidence = 0.0
            
            if source_entity_key:
                entity_data = layer4_output.get(source_entity_key)
                if entity_data:
                    # Handle strict JSON format {"value": ..., "confidence": ...}
                    if isinstance(entity_data, dict) and "value" in entity_data:
                        raw_value = entity_data.get("value")
                        conf = entity_data.get("confidence", 0.0)
                        
                        if raw_value:
                             # Apply specific rules if needed
                            # Apply specific rules if needed
                            # (Regex extraction removed by user request - reliance on LLM extraction)
                            value = raw_value
                            
                            confidence = conf

            output_dict[field_key] = {
                "value": value,
                "confidence": confidence,
                "auto_filled": bool(value) # Flag for UI highlighting
            }

    traverse_fields(form_schema.get("fields", {}), mapped_data)
    return mapped_data

# testing (success)
if __name__ == "__main__":
    import json
    import os
    
    # Path to schema
    # Assumes running from project root or form_mapper dir; adjusting for robustness
    # Try project root first
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    schema_path = os.path.join(base_dir, "form_mapper", "schemas", "income_certificate.json")
    
    if not os.path.exists(schema_path):
        print(f"Error: Schema not found at {schema_path}")
    else:
        print(f"Loading schema from: {schema_path}")
        with open(schema_path, "r") as f:
            schema = json.load(f)
            
        # Sample LLM Output (Layer 4)
        print("\n--- Sample LLM Output (Layer 4) ---")
        llm_output = {
            "full_name": {"value": "Abhishek Dixit", "confidence": 0.99},
            "date_of_birth": {"value": "2004-09-27", "confidence": 0.98},
            "fathers_name": {"value": "Ajay Kumar Dixit", "confidence": 0.95},
            "gender": {"value": "MALE", "confidence": 0.99},
            "aadhaar_number": {"value": "470226297140", "confidence": 0.97},
            # Address similar to user's case (with Nagar, implicit district)
            "address": {"value": "C/O Ajay Kumar Dixit, 5/2, dhakna purwa, T PNagar, Kanpur Nagar, Uttar Pradesh - 208023", "confidence": 0.90}
        }
        print(json.dumps(llm_output, indent=2))
        
        # Run Mapping
        print("\n--- Mapped Form Data ---")
        mapped_result = map_entities_to_form(llm_output, schema)
        print(json.dumps(mapped_result, indent=2))