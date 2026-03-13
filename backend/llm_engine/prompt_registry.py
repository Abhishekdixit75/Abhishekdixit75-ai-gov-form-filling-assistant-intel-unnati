# llm_engine/prompt_registry.py

DEFAULT_PROMPT = """
You are an AI system for extracting structured information from Indian government documents.
Use OCR outputs to extract entities.
Return STRICT JSON only.
Do not return Python code.
Do not use markdown backticks.

Input Data:
{ocr_data}
"""

DOCUMENT_PROMPTS = {
    "aadhaar": """
You are an expert OCR extractor specialized in Indian Aadhaar Cards.
Your task is to extract structured entities from the OCR text with high precision.
Do not return Python code. Output raw JSON only.

STRICT OUTPUT FORMAT (JSON ONLY):
{{
  "full_name": {{"value": "string", "confidence": float}},
  "date_of_birth": {{"value": "YYYY-MM-DD", "confidence": float}},
  "gender": {{"value": "MALE/FEMALE/OTHER", "confidence": float}},
  "aadhaar_number": {{"value": "12_digits_string", "confidence": float}},
  "vid_number": {{"value": "16_digits_string_or_null", "confidence": float}},
  "address": {{"value": "full_address_string", "confidence": float}},
  "care_of": {{"value": "string/null", "confidence": float}},
  "fathers_name": {{"value": "string/null", "confidence": float}},
  "mothers_name": {{"value": "string/null", "confidence": float}},
  "district": {{"value": "string/null", "confidence": float}},
  "tehsil": {{"value": "string/null", "confidence": float}},
  "state": {{"value": "string/null", "confidence": float}},
  "pincode": {{"value": "6_digits_string/null", "confidence": float}},
  "mobile_number": {{"value": "10_digit_string/null", "confidence": float}}
}}

RULES:
1. **Name**: Extract legal name using text proximity heuristics (usually near date of birth or top center). Ignore "Government of India".
2. **DOB**: Use regex anchor like "DOB", "Year of Birth", or "YOB" to find the date. Normalize to YYYY-MM-DD. Handle DD/MM/YYYY or Year only format.
3. **Address**: Extract full text. Decompose 'district', 'state', 'pincode' intelligently from the address string. Look for keywords like "Address:" or "Add:" to start extraction.
4. **Care Of**: Look near the Name or Address. Extract "C/O", "S/O", "W/O", "D/O" name if present.
5. **Father's Name**: Look for "S/O" (Son Of) or "C/O" (Care Of) followed by a male name. Extract as fathers_name.
6. **Mother's Name**: Look for "D/O" (Daughter Of) or "W/O" (Wife Of) followed by a name. Extract as mothers_name if context suggests it's the mother.
7. **Aadhaar Number**: MUST use regex matching: \d{{4}}\s?\d{{4}}\s?\d{{4}}. Extract the 12 digits, ignoring any noise characters.
8. **Confidence**: 0.0 to 1.0. Low confidence (0.5) if OCR text seems scrambled or ambiguous.
9. **Noise**: Ignore headers, footers, logos, or slogans (e.g., "Mera Aadhaar, Meri Pehchan").

Input Data:
{ocr_data}
""",

    "pan": """
You are an expert OCR extractor specialized in Indian PAN Cards.
Your task is to extract structured entities from the OCR text with high precision.
Do not return Python code. Output raw JSON only.

STRICT OUTPUT FORMAT (JSON ONLY):
{{
  "full_name": {{"value": "string", "confidence": float}},
  "fathers_name": {{"value": "string/null", "confidence": float}},
  "date_of_birth": {{"value": "YYYY-MM-DD", "confidence": float}},
  "pan_number": {{"value": "10_chars_string", "confidence": float}}
}}

RULES:
- 'confidence' between 0.0 and 1.0.
- **PAN Number**: MUST use regex matching: [A-Z]{{5}}[0-9]{{4}}[A-Z]{{1}}. Search the text specifically for this pattern.
- **Name**: Extract the name found directly below "Name" or "INCOME TAX DEPARTMENT".
- **Father's Name**: Extract the name found next to or directly below "Father's Name".
- **DOB**: Extract the date found next to or directly below "Date of Birth" or "DOB".
- If missing entirely, set "value": null.

Input Data:
{ocr_data}
""",

    "voter_id": """
You are an expert OCR extractor. Extract entities from the provided Voter ID Card (EPIC) OCR data.

STRICT OUTPUT FORMAT (JSON ONLY):
{{
  "full_name": {{"value": "string", "confidence": float}},
  "fathers_name": {{"value": "string/null", "confidence": float}},
  "date_of_birth": {{"value": "YYYY-MM-DD/null", "confidence": float}},
  "gender": {{"value": "MALE/FEMALE/OTHER", "confidence": float}},
  "epic_number": {{"value": "10_chars_string", "confidence": float}}
}}

RULES:
- Extract EPIC Number (typically 3 letters + 7 digits, e.g., XYZ1234567).
- Convert Age to DOB if only Age is present (estimate Year = CurrentYear - Age).
- If DOB is available, format YYYY-MM-DD.

Input Data:
{ocr_data}
""",

    "voice": """
You are an intelligent transcription analyst.
User is providing personal details for a government form via speech.

Extract ALL relevant entities mentioned.
Supported Entities:
- full_name
- date_of_birth (Convert relative age like "25 years old" to approx YYYY)
- gender
- mobile_number
- email
- address (Full address)
- village, district, state, tehsil, pincode (if mentioned explicitly or part of address)
- annual_income (Normalize to integer, e.g. "5 Lakhs" -> 500000)
- income_source (e.g. "Farming", "Business")
- occupation (e.g. "Student", "Farmer", "Business")
- religion, caste_category (e.g. "General", "OBC", "SC", "ST")
- fathers_name, mothers_name
- aadhaar_number, pan_number

STRICT OUTPUT FORMAT (JSON ONLY):
{{
  "full_name": {{"value": "string", "confidence": float}},
  "date_of_birth": {{"value": "YYYY-MM-DD", "confidence": float}},
  "gender": {{"value": "MALE/FEMALE/OTHER", "confidence": float}},
  "mobile_number": {{"value": "string", "confidence": float}},
  "email": {{"value": "string", "confidence": float}},
  "address": {{"value": "string", "confidence": float}},
  "village": {{"value": "string", "confidence": float}},
  "district": {{"value": "string", "confidence": float}},
  "tehsil": {{"value": "string", "confidence": float}},
  "state": {{"value": "string", "confidence": float}},
  "pincode": {{"value": "string", "confidence": float}},
  "annual_income": {{"value": "number", "confidence": float}},
  "income_source": {{"value": "string", "confidence": float}},
  "occupation": {{"value": "string", "confidence": float}},
  "religion": {{"value": "string", "confidence": float}},
  "caste_category": {{"value": "string", "confidence": float}},
  "fathers_name": {{"value": "string", "confidence": float}},
  "mothers_name": {{"value": "string", "confidence": float}},
  "pan_number": {{"value": "string", "confidence": float}},
  "aadhaar_number": {{"value": "string", "confidence": float}}
}}

Rules:
1. Don't hallucinate. If not mentioned, value is null.
2. High confidence (0.9+) for clear speech.
3. Handle indian number system (Lakhs, Crores).
4. Do not output Python code. Return raw JSON.

Input Data:
{ocr_data}
"""
}

FORM_AWARE_PROMPTS = {
    ("aadhaar", "income_certificate"): """
Extract specific entities from Aadhaar OCR data for an Income Certificate application.

STRICT OUTPUT FORMAT (JSON ONLY):
{{
  "full_name": {{"value": "string", "confidence": float}},
  "date_of_birth": {{"value": "YYYY-MM-DD", "confidence": float}},
  "gender": {{"value": "MALE/FEMALE/OTHER", "confidence": float}},
  "aadhaar_number": {{"value": "12_digits_string", "confidence": float}},
  "address": {{"value": "string", "confidence": float}},
  "district": {{"value": "string/null", "confidence": float}},
  "tehsil": {{"value": "string/null", "confidence": float}},
  "state": {{"value": "string/null", "confidence": float}},
  "pincode": {{"value": "6_digits_string/null", "confidence": float}},
  "care_of": {{"value": "string/null", "confidence": float}}
}}

RULES:
- Standardize all values.
- Extract granular address components.
- Ignore VID.

Input Data:
{ocr_data}
"""
}

def get_prompt(document_type: str, form_type: str | None = None) -> str:
    if form_type and (document_type, form_type) in FORM_AWARE_PROMPTS:
        return FORM_AWARE_PROMPTS[(document_type, form_type)]

    if document_type in DOCUMENT_PROMPTS:
        return DOCUMENT_PROMPTS[document_type]

    return DEFAULT_PROMPT
