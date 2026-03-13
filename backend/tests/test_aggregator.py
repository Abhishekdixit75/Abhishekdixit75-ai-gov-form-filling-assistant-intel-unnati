from ocr_agents import run_ocr
import json
import os

def test_aggregator():
    # Use an existing image path
    image_path = "./data/pages/aadhar2.png"
    
    if not os.path.exists(image_path):
         print(f"Error: No test image found at {image_path}")
         return

    print(f"Testing aggregator on: {image_path}")
    
    try:
        result = run_ocr(image_path)
        print(json.dumps(result, indent=4))
    except Exception as e:
        print(f"Aggregator crashed: {e}")

if __name__ == "__main__":
    test_aggregator()