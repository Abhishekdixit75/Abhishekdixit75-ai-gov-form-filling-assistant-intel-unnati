import fitz  # PyMuPDF
import os
from pathlib import Path

def pdf_to_images(pdf_path, output_dir=None):
    """
    Convert PDF to images.
    
    Args:
        pdf_path: Path to PDF file
        output_dir: Optional output directory. If None, uses same dir as PDF
    
    Returns:
        List of image file paths
    """
    pdf_path = Path(pdf_path)
    
    if output_dir is None:
        output_dir = pdf_path.parent / f"{pdf_path.stem}_pages"
    else:
        output_dir = Path(output_dir)
    
    output_dir.mkdir(exist_ok=True, parents=True)
    
    doc = fitz.open(str(pdf_path))
    image_paths = []
    
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=300)  # 300 DPI is good balance
        path = output_dir / f"page_{i}.png"
        pix.save(str(path))
        image_paths.append(str(path))
    
    doc.close()
    return image_paths

if __name__ == "__main__":
    # Test with default path if run directly
    test_path = "C:/Users/abhis/Desktop/Abhishek/Govt. Issued Documents/pan card.pdf"
    if os.path.exists(test_path):
        paths = pdf_to_images(test_path)
        print(f"Converted {len(paths)} pages:")
        for p in paths:
            print(f"  - {p}")
