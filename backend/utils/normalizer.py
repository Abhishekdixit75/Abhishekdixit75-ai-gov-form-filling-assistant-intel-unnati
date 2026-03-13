# utils/normalizer.py
import re
from datetime import datetime

def normalize_date(date_str: str) -> str:
    """
    Normalizes various date formats to YYYY-MM-DD.
    Supported inputs: DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY, DDMMYYYY
    Returns: YYYY-MM-DD if successful, otherwise original string.
    """
    if not date_str:
        return ""
    
    # Cleaning
    clean_str = str(date_str).strip()
    
    # Common Patterns
    patterns = [
        r"^(\d{4})-(\d{2})-(\d{2})$",          # YYYY-MM-DD (Already correct)
        r"^(\d{2})[-/.](\d{2})[-/.](\d{4})$",  # DD-MM-YYYY or DD/MM/YYYY
        r"^(\d{2})(\d{2})(\d{4})$"             # DDMMYYYY (e.g. 14112022)
    ]
    
    for i, pat in enumerate(patterns):
        match = re.search(pat, clean_str)
        if match:
            if i == 0:
                return clean_str # Already ISO
            
            # Extract parts
            d, m, y = match.groups()
            
            # Basic validation
            try:
                # Using datetime to validate calendar correctness (e.g. 30th Feb)
                dt = datetime(int(y), int(m), int(d))
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue # Try next pattern or return original
                
    return clean_str # Return original if no match