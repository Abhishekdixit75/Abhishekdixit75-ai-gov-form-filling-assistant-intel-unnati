import cv2
import pytesseract
import re
import os

class DigitOCRAgent:
    def __init__(self):
        # Set Tesseract Path explicitly since it's not in PATH
        # Common default installation path on Windows
        tesseract_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        if not os.path.exists(tesseract_path):
             # Fallback or warning if not found even there
             print(f"Warning: Tesseract not found at {tesseract_path}")
        
        pytesseract.pytesseract.tesseract_cmd = tesseract_path

        # Only digits + space
        self.config = r'-c tessedit_char_whitelist=0123456789 --psm 6'

    def extract(self, image_path):
        img = cv2.imread(image_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # light blur to reduce noise (cheap)
        gray = cv2.GaussianBlur(gray, (3, 3), 0)

        text = pytesseract.image_to_string(gray, config=self.config)

        # clean output
        digits = re.findall(r'\d{2,}', text)
        cleaned = " ".join(digits)

        confidence = 0.95 if len(cleaned.replace(" ", "")) >= 8 else 0.6

        return {
            "agent": "digit_agent",
            "modality": "numeric",
            "text": cleaned,
            "confidence": confidence
        }

# testing (success)
if __name__ == "__main__":
    agent = DigitOCRAgent()
    print(agent.extract("./data/pages/page_1.png"))