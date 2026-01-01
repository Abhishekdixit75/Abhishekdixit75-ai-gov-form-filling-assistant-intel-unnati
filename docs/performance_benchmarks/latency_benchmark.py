import time
import os
import sys
import statistics
import json

# Add backend root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ocr_agents.aggregator import run_ocr_agents
from llm_engine.extractor import extract_entities
from form_mapper.entity_store import EntityStore
from voice.whisper_input import VoiceInputProcessor

# Disable extensive logging if possible, or just ignore it
import logging
logging.getLogger("httpx").setLevel(logging.WARNING)

def benchmark_latency():
    print("🚀 Starting Latency Benchmarks...\n")
    
    test_data_dir = os.path.join(os.path.dirname(__file__), "test_data")
    aadhaar_path = os.path.join(test_data_dir, "aadhaar_sample.png")
    pan_path = os.path.join(test_data_dir, "pan_sample.jpeg")
    voice_path = os.path.join(test_data_dir, "voice_sample.wav")
    
    store = EntityStore()
    
    results = []

    # --- Document Benchmark (Aadhaar) ---
    if os.path.exists(aadhaar_path):
        print(f"📄 Benchmarking Document Pipeline (Aadhaar)...")
        times = {"ingestion": [], "ocr": [], "llm": [], "merge": [], "total": []}
        
        for i in range(3):
            print(f"   Run {i+1}/3...")
            t0 = time.time()
            
            # 1. Ingestion (Simulated by file read check + path prep)
            t_ingest_start = time.time()
            if not os.path.exists(aadhaar_path): raise FileNotFoundError
            t_ingest_end = time.time()
            
            # 2. OCR
            t_ocr_start = time.time()
            ocr_out = run_ocr_agents([aadhaar_path], document_type="aadhaar")
            t_ocr_end = time.time()
            
            # 3. LLM
            t_llm_start = time.time()
            entities = extract_entities(ocr_out, document_type="aadhaar")
            t_llm_end = time.time()
            
            # 4. Merge
            t_merge_start = time.time()
            store.merge_entities(entities, source_type="aadhaar")
            t_merge_end = time.time()
            
            times["ingestion"].append(t_ingest_end - t_ingest_start)
            times["ocr"].append(t_ocr_end - t_ocr_start)
            times["llm"].append(t_llm_end - t_llm_start)
            times["merge"].append(t_merge_end - t_merge_start)
            times["total"].append(t_merge_end - t0)
            
        results.append({
            "type": "Document (Aadhaar)",
            "ingestion": statistics.mean(times["ingestion"]),
            "ocr": statistics.mean(times["ocr"]),
            "llm": statistics.mean(times["llm"]),
            "merge": statistics.mean(times["merge"]),
            "total": statistics.mean(times["total"])
        })
    else:
        print(f"⚠️ Aadhaar sample not found at {aadhaar_path}")

    # --- Voice Benchmark ---
    if os.path.exists(voice_path):
        print(f"\n🎙️ Benchmarking Voice Pipeline...")
        times = {"transcribe": [], "llm": [], "merge": [], "total": []}
        
        processor = VoiceInputProcessor() # Load model once outside loop to be fair (or inside if cold start matters? User said "major stages". Model loading is usually startup cost.)
        # Actually user wants "Voice Processing".
        
        for i in range(3):
            print(f"   Run {i+1}/3...")
            t0 = time.time()
            
            # 1. Transcribe
            t_trans_start = time.time()
            text = processor.transcribe(voice_path)
            t_trans_end = time.time()
            
            # 2. LLM (Fake Bundle creation is negligible)
            t_llm_start = time.time()
            bundle = {
                "ocr_outputs": [{
                    "agent": "voice_input",
                    "modality": "speech",
                    "text": text,
                    "confidence": 0.95
                }]
            }
            entities = extract_entities(bundle, document_type="voice")
            t_llm_end = time.time()
            
            # 3. Merge
            t_merge_start = time.time()
            store.merge_entities(entities, source_type="voice")
            t_merge_end = time.time()

            times["transcribe"].append(t_trans_end - t_trans_start)
            times["llm"].append(t_llm_end - t_llm_start)
            times["merge"].append(t_merge_end - t_merge_start)
            times["total"].append(t_merge_end - t0)

        results.append({
            "type": "Voice Input",
            "transcribe": statistics.mean(times["transcribe"]),
            "llm": statistics.mean(times["llm"]),
            "merge": statistics.mean(times["merge"]),
            "total": statistics.mean(times["total"])
        })

    # Output Table
    print("\n\n📊 FINAL LATENCY RESULTS (Average of 3 runs)\n")
    print(f"{'Stage':<25} | {'Avg Time (s)':<15}")
    print("-" * 45)
    
    for res in results:
        print(f"--- {res['type']} ---")
        if "ingestion" in res:
            print(f"{'Document Ingestion':<25} | {res['ingestion']:.4f}")
            print(f"{'OCR Processing':<25} | {res['ocr']:.4f}")
            print(f"{'LLM Extraction':<25} | {res['llm']:.4f}")
            print(f"{'Entity Merge':<25} | {res['merge']:.4f}")
            print(f"{'TOTAL':<25} | {res['total']:.4f}")
        else:
            print(f"{'Voice Processing':<25} | {res['transcribe']:.4f}")
            print(f"{'LLM Extraction':<25} | {res['llm']:.4f}")
            print(f"{'Entity Merge':<25} | {res['merge']:.4f}")
            print(f"{'TOTAL':<25} | {res['total']:.4f}")
        print("-" * 45)

    # Save to file
    with open("latency_results.txt", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    benchmark_latency()
