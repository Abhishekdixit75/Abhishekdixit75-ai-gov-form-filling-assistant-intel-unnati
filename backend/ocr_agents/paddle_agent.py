from paddleocr import PaddleOCR
import os
import cv2
import numpy as np

class PaddleOCRAgent:
    def __init__(self):
        self.ocr = PaddleOCR(use_angle_cls=True, lang='en')

    def extract(self, image_path):
        if not os.path.exists(image_path):
            return {"error": f"File not found: {image_path}"}

        # Safe read & Resize
        try:
            img = cv2.imread(image_path)
            if img is None:
                return {"error": f"Failed to load image: {image_path}"}
            
            h, w = img.shape[:2]
            max_limit = 2048
            if max(h, w) > max_limit:
                scale = max_limit / float(max(h, w))
                new_w, new_h = int(w * scale), int(h * scale)
                img = cv2.resize(img, (new_w, new_h))
            
            # Pass numpy array to OCR
            result = self.ocr.ocr(img)
            
        except Exception as e:
            return {"agent": "paddle_ocr", "error": f"Pre-processing failed: {str(e)}"}

        lines = []
        scores = []
        
        if result is None or result[0] is None:
             return {
                "agent": "paddle_ocr",
                "text": "",
                "confidence": 0.0
            }

        if isinstance(result[0], dict):
            data = result[0]
            rec_texts = data.get('rec_texts', [])
            rec_scores = data.get('rec_scores', [])
            
            if not rec_texts and 'res' in data:
                 pass 

            for text, score in zip(rec_texts, rec_scores):
                if score > 0.5:
                    lines.append(text)
                    scores.append(score)
        
        elif isinstance(result[0], list):
             for line in result[0]:
                if isinstance(line[1], tuple) or isinstance(line[1], list):
                    text_content = line[1][0]
                    confidence = line[1][1]
                    
                    if confidence > 0.5:
                        lines.append(text_content)
                        scores.append(confidence)
                else:
                    pass

        final_text = " ".join(lines)
        avg_conf = sum(scores) / len(scores) if scores else 0.0
        return {
            "agent": "paddle_agent",
            "modality": "printed_text",
            "text": final_text,
            "confidence": round(avg_conf, 2)
        }

# Agent Usage test (success)
if __name__ == "__main__":
    agent = PaddleOCRAgent()

    # Test with available images
    test_image = "./data/pages/image.png"    
    print(f"Testing on: {test_image}")
    import json
    print(json.dumps(agent.extract(test_image), indent=4))