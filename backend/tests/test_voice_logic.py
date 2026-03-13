import sys
import os
import json
from unittest.mock import MagicMock
import shutil
import argparse
import time

# Enable testing imports
sys.path.append(os.getcwd())

from llm_engine.extractor import extract_entities
from llm_engine.prompt_registry import get_prompt
from form_mapper.entity_store import EntityStore
from voice.whisper_input import VoiceInputProcessor
from form_mapper.mapper import map_entities_to_form

def test_voice_flow(audio_path):
    print(f"=== Testing Voice Input Flow (File: {audio_path}) ===\n")
    
    if not os.path.exists(audio_path):
        print(f"❌ Error: File not found: {audio_path}")
        return

    # 1. Transcribe functionality
    print("1. Loading Whisper Model & Transcribing...")
    start_time = time.time()
    try:
        processor = VoiceInputProcessor() # Loads 'base' model by default
        transcribed_text = processor.transcribe(audio_path)
        transcription_time = time.time() - start_time
        print(f"   ► Transcription Result:\n   '{transcribed_text}'")
        print(f"   ⏱ Transcription Latency: {transcription_time:.2f}s\n")
    except Exception as e:
        print(f"❌ Error during transcription: {e}")
        return

    # 2. Extract Entities
    print("2. Extracting entities via LLM...")
    
    # Construct OCR bundle wrapper
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
    
    # Run Extractor
    start_time = time.time()
    try:
        entities = extract_entities(voice_ocr_bundle, document_type="voice")
        extraction_time = time.time() - start_time
        print(f"   ► Extracted Entities: {json.dumps(entities, indent=2)}")
        print(f"   ⏱ Extraction Latency: {extraction_time:.2f}s")
    except Exception as e:
        print(f"❌ Error during extraction: {e}")
        return

    # 3. Merge into Store
    print("\n3. Merging into EntityStore...")
    store = EntityStore()
    store.merge_entities(entities)
    
    final_state = store.get_final_state()
    values = final_state["values"]
    print(f"   ► Final Session State: {json.dumps(values, indent=2)}")
    
    # 4. Form Mapping Verification
    print("\n4. Verifying Form Mapping (Income Certificate)...")
    schema_path = "form_mapper/schemas/income_certificate.json"
    if os.path.exists(schema_path):
        with open(schema_path, "r") as f:
            form_schema = json.load(f)
        # Use store.store to provide {value, confidence} objects
        mapped_data = map_entities_to_form(store.store, form_schema)
        print(f"   ► Mapped Form Data: {json.dumps(mapped_data, indent=2)}")
    else:
        print(f"   ⚠ Schema not found at {schema_path}, skipping mapping check.")

    print("\n=== Test Completed ===")
    print(f"Total Latency: {transcription_time + extraction_time:.2f}s")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test voice input pipeline with an audio file.")
    # Use 'audio_path' as the argument name, but set a default so it runs automatically with the user's file
    default_path = r"C:\Users\abhis\Desktop\Intel-Unnati-3\voice\Recording.wav"
    parser.add_argument("--audio_path", default=default_path, help="Path to the audio file (.wav, .mp3, etc.)")
    args = parser.parse_args()
    
    test_voice_flow(args.audio_path)
