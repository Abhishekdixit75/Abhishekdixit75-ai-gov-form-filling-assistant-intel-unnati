from fastapi import UploadFile, HTTPException
from typing import List

def validate_upload_constraints(files: List[UploadFile], document_type: str):
    """
    Terminates request if document-specific upload rules are violated.
    Rules:
      - Aadhaar: Must be 2 images (Front+Back) OR 1 PDF (Assume 2 pages).
      - PAN: Must be 1 file (Image or PDF).
      - Voter ID: Must be 2 images (Front+Back) OR 1 PDF.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    num_files = len(files)
    
    # 1. PAN Card Logic
    if document_type == "pan":
        if num_files > 1:
            raise HTTPException(
                status_code=400, 
                detail="PAN Card upload: Please upload exactly 1 file (Image or PDF)."
            )

    # 2. Aadhaar & Voter ID Logic (Identity Cards with Front/Back)
    elif document_type in ["aadhaar", "voter_id"]:
        # Case A: PDF Upload -> Expect 1 file (which contains multiple pages)
        is_pdf = any("pdf" in (f.content_type or "") for f in files)
        
        if is_pdf:
            if num_files > 1:
                raise HTTPException(
                    status_code=400,
                    detail=f"{document_type.title()} PDF upload: Please upload a single PDF file containing both sides."
                )
            
            # --- PAGE COUNT VALIDATION ---
            # We need to read the file likely. Since UploadFile is a stream, 
            # we must be careful not to consume it fully if downstream needs it.
            # But here validation is before saving. We can read and seek(0).
            pdf_file = files[0]
            try:
                from ingestion.pdf_validator import count_pdf_pages
                content = pdf_file.file.read()
                pdf_file.file.seek(0) # Reset cursor for saving later!
                
                page_count = count_pdf_pages(content)
                if page_count < 2:
                     raise HTTPException(
                        status_code=400,
                        detail=f"{document_type.title()} PDF must contain at least 2 pages (Front and Back). Found {page_count} page(s)."
                    )
            except HTTPException:
                raise
            except Exception as e:
                print(f"Warning: Could not validate PDF pages: {e}")
            # -----------------------------

        else:
            # Case B: Image Upload -> Expect 2 files (Front + Back)
            if num_files != 2:
                raise HTTPException(
                    status_code=400,
                    detail=f"{document_type.title()} Image upload: Please upload exactly 2 images (Front and Back)."
                )
    
    # Unknown type
    else:
        pass
