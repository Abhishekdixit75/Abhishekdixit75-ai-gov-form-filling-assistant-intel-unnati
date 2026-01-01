from . import run_ocr

def run_ocr_agents(image_paths, document_type=None):
    """
    Runs OCR on a list of image paths and aggregates the results.
    
    Args:
        image_paths (list): List of file paths to images (pages).
        document_type (str, optional): Type of document (e.g., 'aadhaar'). 
                                       Can be used to tune OCR parameters if needed.
                                       
    Returns:
        dict: Aggregated Layer 3 output containing 'ocr_outputs' from all pages.
    """
    combined_outputs = []
    
    for path in image_paths:
        # run_ocr returns {"ocr_outputs": [...agents results...]}
        result = run_ocr(path)
        if result and "ocr_outputs" in result:
             # Extend the main list with the agents' output for this page
             # We might want to tag them with page number in future, 
             # but for now simple aggregation is sufficient for the LLM.
             combined_outputs.extend(result["ocr_outputs"])
             
    return {"ocr_outputs": combined_outputs}