import json
import os
import sys

# Add current directory to path so imports work
sys.path.append(os.getcwd())

from ocr_agents.aggregator import run_ocr_agents
from llm_engine.extractor import extract_entities
from form_mapper.entity_store import EntityStore
from form_mapper.mapper import map_entities_to_form
from voice.whisper_input import VoiceInputProcessor

def test_full_pipeline():
    print("=== Starting Full Pipeline Test ===\n")

    # 1. Initialize Entity Store
    print("Step 1: Initializing Entity Store...")
    store = EntityStore()
    print("Entity Store initialized.\n")

    # 2. Process PAN Card
    pan_image_path = "./data/pages/pan_card.png"
    if os.path.exists(pan_image_path):
        print(f"Step 2: Processing PAN Card ({pan_image_path})...")
        
        # A. OCR
        print("  - Running OCR Agents...")
        pan_ocr_output = run_ocr_agents([pan_image_path], document_type="pan")
        # print(json.dumps(pan_ocr_output, indent=2)) # Debug

        # B. LLM Extraction
        print("  - Extracting Entities (Prompt: PAN)...")
        # Note: We pass document_type="pan" to get the specific PAN prompt
        pan_entities = extract_entities(pan_ocr_output, document_type="pan", form_type="income_certificate")
        print(f"    - Extracted: {json.dumps(pan_entities, indent=2)}")

        # C. Merge
        print("  - Merging into Store...")
        store.merge_entities(pan_entities, source_type="pan")
    else:
        print(f"Skipping PAN Card (File not found: {pan_image_path})")
    print("\n")

    # 3. Process Page 0 and Page 1 (Application Form Pages)
    # We treat these as generic pages or part of the application itself.
    # Since we don't have a specific prompt for 'application_page', it will use default.
    form_pages = ["./data/pages/aadhar2.png"]
    existing_pages = [p for p in form_pages if os.path.exists(p)]
    
    if existing_pages:
        print(f"Step 3: Processing Application Pages {existing_pages}...")
        
        # A. OCR
        # User requested to skip validation for Aadhaar card (e.g. front/back check).
        # We process whatever pages are found without validation.
        print("  - Running OCR Agents (Validation Skipped)...")
        form_ocr_output = run_ocr_agents(existing_pages, document_type="aadhaar")
        
        # B. LLM Extraction
        print("  - Extracting Entities (Prompt: Aadhaar)...")
        # Using 'aadhaar' document type to trigger the specific Aadhaar extraction prompt
        form_entities = extract_entities(form_ocr_output, document_type="aadhaar", form_type="income_certificate")
        print(f"    - Extracted: {json.dumps(form_entities, indent=2)}")

        # C. Merge
        print("  - Merging into Store...")
        store.merge_entities(form_entities, source_type="aadhaar")
    else:
        print("Skipping Form Pages (Files not found)")
    print("\n")

    # 4. Process Voice Input
    voice_file = os.path.join(os.getcwd(), "voice", "Recording.wav")
    if os.path.exists(voice_file):
        print(f"Step 4: Processing Voice Input ({voice_file})...")
        
        # A. Transcribe
        print("  - Transcribing Audio...")
        try:
            processor = VoiceInputProcessor()
            transcribed_text = processor.transcribe(voice_file)
            print(f"    - Transcription: '{transcribed_text}'")
            
            # B. LLM Extraction
            print("  - Extracting Entities (Prompt: Voice)...")
            voice_ocr_bundle = {
                "ocr_outputs": [
                    {
                        "agent": "voice_input",
                        "modality": "speech",
                        "text": transcribed_text,
                        "confidence": 0.95 
                    }
                ]
            }
            voice_entities = extract_entities(voice_ocr_bundle, document_type="voice")
            print(f"    - Extracted: {json.dumps(voice_entities, indent=2)}")

            # C. Merge
            print("  - Merging into Store...")
            store.merge_entities(voice_entities, source_type="voice")

        except Exception as e:
            print(f"  ❌ Error processing voice input: {e}")
    else:
        print(f"Skipping Voice Input (File not found: {voice_file})")
    print("\n")

    # 5. Final State & Mapping
    print("Step 5: generating Final Output...")
    final_state = store.get_final_state()
    print("Final Entity State (Values):")
    print(json.dumps(final_state["values"], indent=2))

    print("\nStep 6: Mapping to Income Certificate Schema...")
    schema_path = "form_mapper/schemas/income_certificate.json"
    if os.path.exists(schema_path):
        with open(schema_path, "r") as f:
            form_schema = json.load(f)
        
        # Mapper expects {key: {value: ..., confidence: ...}} which matches store.store
        mapped_data = map_entities_to_form(store.store, form_schema)
        print("Mapped Form Data:")
        print(json.dumps(mapped_data, indent=2))
    else:
        print(f"Error: Schema not found at {schema_path}")

    print("\n=== Test Completed ===")

if __name__ == "__main__":
    test_full_pipeline()