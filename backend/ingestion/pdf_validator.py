import fitz # PyMuPDF

def count_pdf_pages(file_bytes: bytes) -> int:
    """
    Counts the number of pages in a PDF file from bytes.
    """
    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            return doc.page_count
    except Exception as e:
        print(f"Error counting PDF pages: {e}")
        return 0
