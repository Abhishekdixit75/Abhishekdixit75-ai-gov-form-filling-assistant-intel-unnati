from .paddle_agent import PaddleOCRAgent
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize agents with error handling
try:
    paddle_agent = PaddleOCRAgent()
    logger.info("PaddleOCRAgent initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize PaddleOCRAgent: {e}")
    paddle_agent = None

def run_ocr(image_path):
    """
    Runs all available OCR agents on the given image path.
    Aggregates results into a single dictionary.
    """
    outputs = []

    # Run PaddleOCR
    if paddle_agent:
        try:
            paddle_res = paddle_agent.extract(image_path)
            # Add validation or fail-safe if extract returns None or error dict
            if paddle_res and "error" not in paddle_res:
                outputs.append(paddle_res)
            else:
                logger.warning(f"PaddleOCR failed for {image_path}: {paddle_res}")
                outputs.append({"agent": "paddle_ocr", "error": "Extraction failed"})
        except Exception as e:
            logger.error(f"Error running PaddleOCR: {e}")
            outputs.append({"agent": "paddle_ocr", "error": str(e)})
    else:
        outputs.append({"agent": "paddle_ocr", "error": "Agent not initialized"})

    # Removed Tesseract and Layout Analysis to speed up pipeline for ID cards.
    # Digits and Layout will be handled via regex and heuristics downstream.

    return {
        "ocr_outputs": outputs
    }