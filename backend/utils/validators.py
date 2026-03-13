import re

# Regex Constants
AADHAAR_REGEX = r"^\d{12}$"
PAN_REGEX = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
IFSC_REGEX = r"^[A-Z]{4}0[A-Z0-9]{6}$"
PINCODE_REGEX = r"^\d{6}$"
MOBILE_REGEX = r"^\d{10}$"

def validate_entity_data(key: str, value: str) -> bool:
    """
    Validates a specific field key against strict regex rules.
    Returns True if valid (or no rule exists), False if invalid.
    """
    if not value or not isinstance(value, str):
        return False
    
    value = value.strip()
    
    # Aadhaar Validation
    if key == "aadhaar_number":
        value = value.replace(" ", "") # Remove spaces if OCR added them
        if not re.match(AADHAAR_REGEX, value):
            return False
            
    # PAN Validation
    elif key == "pan_number":
        if not re.match(PAN_REGEX, value):
            return False
            
    # Pincode
    elif key == "pincode":
         if not re.match(PINCODE_REGEX, value):
            return False
            
    # IFSC
    elif key == "ifsc_code":
         if not re.match(IFSC_REGEX, value):
            return False

    return True
