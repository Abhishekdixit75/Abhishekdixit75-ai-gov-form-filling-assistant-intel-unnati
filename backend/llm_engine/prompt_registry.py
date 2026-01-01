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
1. **Name**: Extract legal name (ignore "Government of India").
2. **DOB**: Normalize to YYYY-MM-DD. Handle DD/MM/YYYY or Year only.
3. **Address**: Extract full text. Decompose 'district', 'state', 'pincode' intelligently from the address string.
4. **Care Of**: Extract "C/O", "S/O", "W/O", "D/O" name if present.
5. **Father's Name**: If you see "S/O" (Son Of) or "C/O" (Care Of) followed by a male name, extract it as fathers_name. For example: "C/O Ajay Kumar Dixit" or "S/O Ram Singh" → fathers_name = "Ajay Kumar Dixit" or "Ram Singh"
6. **Mother's Name**: If you see "D/O" (Daughter Of) or "W/O" (Wife Of) followed by a name, try to extract mothers_name if context suggests it's mother.
7. **Aadhaar Number**: Must be 12 digits. Remove spaces/dashes.
8. **Confidence**: 0.0 to 1.0. Low confidence (0.5) if OCR is blurry.
9. **Noise**: Ignore header/footer text (e.g., "Mera Aadhaar, Meri Pehchan").

Input Data:
{ocr_data}
""",

    "pan": """
You are an expert OCR extractor. Extract entities from the provided PAN Card OCR data.

STRICT OUTPUT FORMAT (JSON ONLY):
{{
  "full_name": {{"value": "string", "confidence": float}},
  "fathers_name": {{"value": "string", "confidence": float}},
  "date_of_birth": {{"value": "YYYY-MM-DD", "confidence": float}},
  "pan_number": {{"value": "10_chars_string", "confidence": float}}
}}

RULES:
- 'confidence' between 0.0 and 1.0.
- PAN format: 5 letters, 4 digits, 1 letter.
- If missing, set "value": null.

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
- district, state, tehsil, pincode (if mentioned explicitly or part of address)
- annual_income (Normalize to integer, e.g. "5 Lakhs" -> 500000)
- income_source (e.g. "Farming", "Business")
- religion, caste_category
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
  "district": {{"value": "string", "confidence": float}},
  "tehsil": {{"value": "string", "confidence": float}},
  "state": {{"value": "string", "confidence": float}},
  "pincode": {{"value": "string", "confidence": float}},
  "annual_income": {{"value": "number", "confidence": float}},
  "income_source": {{"value": "string", "confidence": float}},
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
