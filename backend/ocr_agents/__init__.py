from .paddle_agent import PaddleOCRAgent
from .tesseract_agent import DigitOCRAgent
from .layout_agent import LayoutAgent
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

try:
    tesseract_agent = DigitOCRAgent()
    logger.info("DigitOCRAgent (Tesseract) initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize DigitOCRAgent: {e}")
    tesseract_agent = None

try:
    layout_agent = LayoutAgent()
    logger.info("LayoutAgent initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize LayoutAgent: {e}")
    layout_agent = None

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

    # Run Tesseract (focused on digits)
    if tesseract_agent:
        try:
            tess_res = tesseract_agent.extract(image_path)
            if tess_res:
                 outputs.append(tess_res)
        except Exception as e:
            logger.error(f"Error running Tesseract: {e}")
            outputs.append({"agent": "digit_ocr", "error": str(e)})

    # Run Layout Analysis
    if layout_agent:
        try:
            layout_info = layout_agent.extract(image_path)
            # Add layout info directly to the list as per requested format
            if layout_info:
                outputs.append(layout_info)
        except Exception as e:
            logger.error(f"Error running LayoutAgent: {e}")
            outputs.append({"agent": "layout_agent", "error": str(e)})

    return {
        "ocr_outputs": outputs
    }