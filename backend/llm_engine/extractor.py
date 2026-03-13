import json
import subprocess
import re
import sys
import os

# Add parent directory to path to allow importing from llm_engine when running as script
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from llm_engine.prompt_registry import get_prompt


def extract_entities(
    ocr_bundle: dict,
    document_type: str = "aadhaar",
    form_type: str | None = None,
    model_name: str = "qwen2:7b-instruct",
    timeout: int = 30
) -> dict:
    """
    Extract structured entities from OCR bundle using a local LLM.

    Parameters:
    - ocr_bundle: output of Layer 3 (OCR agents)
    - document_type: aadhaar / pan / voter_id etc.
    - form_type: income_certificate / domicile_certificate etc.
    - model_name: local ollama model
    - timeout: max seconds to wait for LLM

    Returns:
    - Parsed JSON dictionary (Layer 4 output)
    """

    # 1️⃣ Select appropriate prompt
    prompt_template = get_prompt(document_type, form_type)

    prompt = prompt_template.format(
        ocr_data=json.dumps(ocr_bundle, indent=2)
    )

    # 2️⃣ Call local LLM
    try:
        result = subprocess.run(
            ["ollama", "run", model_name],
            input=prompt,
            text=True,
            capture_output=True,
            encoding="utf-8",
            errors="ignore",
            timeout=timeout
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError("LLM execution timed out")

    raw_output = result.stdout.strip()

    # 3️⃣ Enforce STRICT JSON
    # Strip JavaScript/C-style inline comments that LLMs sometimes add
    raw_output = re.sub(r"//.*?$", "", raw_output, flags=re.MULTILINE)
    raw_output = re.sub(r"/\*.*?\*/", "", raw_output, flags=re.DOTALL)
    
    try:
        return json.loads(raw_output)

    except json.JSONDecodeError:
        # Attempt recovery: extract JSON block
        match = re.search(r"\{.*\}", raw_output, re.S)
        if match:
            json_str = match.group()
            # FIX: Remove trailing commas which are common LLM errors
            json_str = re.sub(r",\s*\}", "}", json_str)
            json_str = re.sub(r",\s*\]", "]", json_str)
            # Also strip any remaining comments
            json_str = re.sub(r"//.*?$", "", json_str, flags=re.MULTILINE)
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass

        # If still invalid → hard fail (correct behavior)
        raise RuntimeError(
            "LLM did not return valid JSON.\n"
            f"Raw output:\n{raw_output}"
        )



if __name__ == "__main__":
    # testing (success)
    layer3_output = {
        "ocr_outputs": [
            {
                "agent": "paddle_agent",
                "modality": "printed_text",
                "text": "Abhishek Dixit R/: 27/09/2004 Issue Date: 29/11/2019 / MALE 4702 2629 7140 VID : 9165 1247 9748 1412 Lelngh HMnIE t Unkque Identification Authority of India AADHAAR /  5/,  TR, PTIYRTHR 3TR STG -208023 Address: C/O Ajay Kumar Dixit, 5/2, dhakna purwa, T PNagar, Kanpur Nagar, Uttar Pradesh - 208023 4702 2629 7140 VID : 9165 1247 9748 1412",
                "confidence": 0.89
            },
            {
                "agent": "digit_agent",
                "modality": "numeric",
                "text": "370271092004 470226297140 75165124797401412 10 672 470226297140 9165124797481412 7014",
                "confidence": 0.95
            },
            {
                "agent": "layout_agent",
                "modality": "layout",
                "rotation": 0,
                "photo_region": "right",
                "layout": "horizontal"
            }
        ]
    }
    ''' 
    # pan card example
    layer3_output = {
        "ocr_outputs": [
            {
                "agent": "paddle_agent",
                "modality": "printed_text",
                "text": "BTTRTCT FEHTST PAIH PTRCOT INCOME TAX DEPARTMENT GOVT. OF INDIA ChTs Permanent Account Number Card IGDPD2933L /Name ABHISHEK DIXIT 4T1 TEFT 7T4/ Father's Name AJAY KUMAR DIXIT 14112022 ABlishue Date of Birth PAN Application Digitally Signed, Card No Valid unless Physically Signed 27/09/2004",
                "confidence": 0.87
            },
            {
                "agent": "digit_agent",
                "modality": "numeric",
                "text": "46 44 444 27 26",
                "confidence": 0.95
            },
            {
                "agent": "layout_agent",
                "modality": "layout",
                "rotation": 0,
                "photo_region": "left",
                "layout": "horizontal"
            }
        ]
    }
    '''

    #testing (success)
    entities = extract_entities(layer3_output)
    print(json.dumps(entities, indent=2))