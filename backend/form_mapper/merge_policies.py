# form_mapper/merge_policies.py

"""
Configuration for Entity Merging Logic.
Defines Trust Hierarchies and Field-Specific Policies.
"""

# 0-100 Score. Higher wins.
TRUST_HIERARCHY = {
    "aadhaar": 100,
    "pan": 80,
    "voice": 50,
    "unknown": 0
}

# Policies per field
# "identity_strict": Only High Trust documents (Aadhaar/PAN)
# "info_open": Open to Voice/User input (e.g. Income, Email)
# "address_logic": Special handling (Prefer longer text)
FIELD_POLICIES = {
    "full_name": "identity_strict",
    "date_of_birth": "identity_strict",
    "aadhaar_number": "identity_strict",
    "pan_number": "identity_strict",
    "fathers_name": "identity_strict",
    "gender": "identity_strict",
    
    "address": "address_logic",
    "district": "identity_strict", # Prefer from Aadhaar
    "tehsil": "identity_strict",
    "state": "identity_strict",
    "pincode": "identity_strict",
    
    "annual_income": "info_open",
    "mobile_number": "info_open",
    "email": "info_open",
    "income_source": "info_open"
}

def get_source_score(source_type: str) -> int:
    return TRUST_HIERARCHY.get(source_type.lower(), 0)
