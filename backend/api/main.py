# api/main.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
import shutil
import os
import uuid
import json
from pathlib import Path

# uvicorn api.main:app --reload --port 8000
# Force Reload Triggered

import sys
import os
from sqlalchemy.orm import Session

# Add parent directory to path to allow importing from ocr_agents, llm_engine, etc.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Configure logging
import logging
from datetime import datetime

# Create custom formatter
class ColoredFormatter(logging.Formatter):
    grey = "\x1b[38;21m"
    blue = "\x1b[38;5;39m"
    yellow = "\x1b[38;5;226m"
    red = "\x1b[38;5;196m"
    bold_red = "\x1b[31;1m"
    green = "\x1b[38;5;46m"
    reset = "\x1b[0m"
    
    FORMATS = {
        logging.DEBUG: grey + "%(asctime)s - %(name)s - DEBUG - %(message)s" + reset,
        logging.INFO: blue + "%(asctime)s - %(name)s - INFO - %(message)s" + reset,
        logging.WARNING: yellow + "%(asctime)s - %(name)s - WARNING - %(message)s" + reset,
        logging.ERROR: red + "%(asctime)s - %(name)s - ERROR - %(message)s" + reset,
        logging.CRITICAL: bold_red + "%(asctime)s - %(name)s - CRITICAL - %(message)s" + reset,
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt, datefmt='%Y-%m-%d %H:%M:%S')
        return formatter.format(record)

# Setup logger
logger = logging.getLogger("API")
logger.setLevel(logging.DEBUG)
logger.propagate = False  # Prevent duplicate logs by stopping propagation to root logger

if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(ColoredFormatter())
    logger.addHandler(console_handler)

# assume these are implemented in your pipeline
from ocr_agents.aggregator import run_ocr_agents   # returns layer3_output
from llm_engine.extractor import extract_entities  # takes layer3_output -> layer4_output
from form_mapper.mapper import map_entities_to_form
# from admin.form_generator import generate_draft_schema # Admin module not available yet
from llm_engine.prompt_registry import get_prompt as get_prompt_for # Corrected import
from form_mapper.entity_store import EntityStore
from voice.whisper_input import VoiceInputProcessor
from ingestion.validators import validate_upload_constraints

from fastapi.middleware.cors import CORSMiddleware

# --- AUTH & DB IMPORTS ---
from . import models, database
from .routers import auth
from .auth_utils import get_current_user

# Create Tables
models.Base.metadata.create_all(bind=database.engine)
# -------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MOUNT AUTH ROUTER ---
app.include_router(auth.router, tags=["auth"])
from api.routers import dashboard
app.include_router(dashboard.router, tags=["dashboard"])
# -------------------------

BASE_DATA_DIR = Path("data/uploads")
BASE_DATA_DIR.mkdir(exist_ok=True, parents=True)

# -------------------------
# Global Session Store (In-Memory for Demo)
# -------------------------
SESSIONS = {}  # session_id -> EntityStore instance

@app.post("/session/init")
async def init_session(
    form_type: str = Form(...), 
    token: Optional[str] = Form(None),
    db: Session = Depends(database.get_db)
):
    """Starts a new form filling session."""
    # Load schema to validation requirements
    schema_path = Path(f"form_mapper/schemas/{form_type}.json")
    required_docs = []
    if schema_path.exists():
        with open(schema_path, "r") as f:
            schema = json.load(f)
            required_docs = schema.get("required_documents", [])
        logger.info(f"Session init: form={form_type}, required_docs={len(required_docs)}")
    else:
        logger.warning(f"Schema not found: {form_type}")

    session_id = str(uuid.uuid4())
    store = EntityStore()
    
    # --- AUTO-FILL from Master Profile ---
    prefilled_count = 0
    if token and token != "null" and token != "undefined":
        try:
            # Manually decode since it's a Form parameter, not Header
            # For simplicity, we assume valid token passed from frontend
            # In producution, verify signature
            from jose import jwt
            from .auth_utils import SECRET_KEY, ALGORITHM
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email:
                user = db.query(models.User).filter(models.User.email == email).first()
                if user:
                    # User found, load their profile
                    profiles = db.query(models.UserProfile).filter(models.UserProfile.user_id == user.id).all()
                    layer4_bundle = {}
                    for p in profiles:
                        layer4_bundle[p.entity_key] = {
                            "value": p.value,
                            "confidence": p.confidence,
                            "source": "master_profile"
                        }
                    if layer4_bundle:
                        store.merge_entities(layer4_bundle, source_type="master_profile")
                        prefilled_count = len(layer4_bundle)
                        logger.info(f"  ✓ Auto-filled {prefilled_count} fields from Master Profile")

                    # --- NEW: Create Application Record ---
                    new_app = models.Application(
                        user_id=user.id,
                        form_type=form_type,
                        status="in_progress"
                    )
                    db.add(new_app)
                    db.commit()
                    db.refresh(new_app)
                    # Store app_id in session for later update
                    store.app_id = new_app.id
                    # --------------------------------------
                    
                    # --- NEW: Create Application Record ---
                    new_app = models.Application(
                        user_id=user.id,
                        form_type=form_type,
                        status="in_progress"
                    )
                    db.add(new_app)
                    db.commit()
                    db.refresh(new_app)
                    # Store app_id in session for later update
                    store.app_id = new_app.id
                    # --------------------------------------
        except Exception as e:
            logger.warning(f"Failed to auto-fill profile: {e}")
    # -------------------------------------

    SESSIONS[session_id] = {
        "store": store,
        "form_type": form_type
    }
    
    logger.info(f"Session created: {session_id[:8]}")
    return {
        "session_id": session_id, 
        "message": "Session initialized",
        "required_documents": required_docs,
        "prefilled_count": prefilled_count
    }

@app.get("/session/{session_id}")
async def get_session_state(session_id: str):
    """Returns the current accumulated entity state."""
    if session_id not in SESSIONS:
        # Auto-create session if it doesn't exist (handles server restarts)
        logger.warning(f"Session not found, auto-creating: {session_id[:8]}")
        store = EntityStore()
        SESSIONS[session_id] = {
            "store": store,
            "form_type": "income_certificate",  # Default form type
            "created_at": datetime.now().isoformat()
        }
    
    store = SESSIONS[session_id]["store"]
    state = store.get_session_view()
    
    filled_count = sum(1 for v in state.values() if v.get('value'))
    total_count = len(state)
    logger.info(f"Get state [{session_id[:8]}]: {filled_count}/{total_count} filled")
    
    # Return flat structure expected by frontend
    return state

@app.post("/session/{session_id}/upload")
async def upload_document_to_session(
    session_id: str,
    document_type: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Step-by-step document upload.
    1. Validates upload
    2. Runs OCR & LLM
    3. Merges result into Session Entity Store
    """
    logger.info(f"Upload started [{session_id[:8]}]: type={document_type}, files={len(files)}")
    
    if session_id not in SESSIONS:
        # Auto-create session if it doesn't exist (handles server restarts)
        logger.warning(f"Session not found, auto-creating: {session_id[:8]}")
        store = EntityStore()
        SESSIONS[session_id] = {
            "store": store,
            "form_type": "income_certificate",  # Default form type
            "created_at": datetime.now().isoformat()
        }

    # 1. Validation
    try:
        validate_upload_constraints(files, document_type)
        logger.info(f"  ✓ Validation passed")
    except HTTPException as e:
        logger.error(f"  ✗ Validation failed: {e.detail}")
        raise

    # 2. Save & Process
    upload_dir = BASE_DATA_DIR / session_id / document_type
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    saved_paths = []
    for file in files:
        file_path = upload_dir / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_paths.append(str(file_path))
    logger.info(f"  ✓ Saved {len(files)} file(s)")

    # Convert PDFs to images if necessary
    processed_paths = []
    for path in saved_paths:
        if path.lower().endswith('.pdf'):
            try:
                from ingestion.pdf_loader import pdf_to_images
                image_paths = pdf_to_images(path)
                processed_paths.extend(image_paths)
                logger.info(f"  ✓ PDF → {len(image_paths)} image(s)")
            except Exception as e:
                logger.error(f"  ✗ PDF conversion failed: {str(e)}")
                raise HTTPException(status_code=500, detail=f"PDF conversion failed: {str(e)}")
        else:
            processed_paths.append(path)

    # 3. OCR (Layer 3)
    try:
        layer3_output = run_ocr_agents(processed_paths, document_type)
        
        # Log OCR results
        if "ocr_outputs" in layer3_output:
            ocr_count = len(layer3_output['ocr_outputs'])
            avg_conf = sum(o.get('confidence', 0) for o in layer3_output['ocr_outputs']) / max(ocr_count, 1)
            logger.info(f"  ✓ OCR complete: {ocr_count} outputs, avg_conf={avg_conf:.2f}")
        else:
            logger.warning(f"  ⚠ Unexpected OCR output format")
            
    except Exception as e:
        logger.error(f"  ✗ OCR failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

    # 4. LLM Extraction (Layer 4)
    form_type = SESSIONS[session_id]["form_type"]
    try:
        layer4_output = extract_entities(layer3_output, document_type, form_type)
        
        # Log extracted entities
        if isinstance(layer4_output, dict):
            extracted_count = sum(1 for v in layer4_output.values() if isinstance(v, dict) and v.get('value'))
            logger.info(f"  ✓ LLM extraction: {extracted_count} entities")
            # Log key entities at debug level
            for key, val in layer4_output.items():
                if isinstance(val, dict) and val.get('value'):
                    conf = val.get('confidence') or 0.0
                    value_preview = str(val.get('value', ''))[:40]
                    logger.debug(f"    {key}={value_preview} (conf={conf:.2f})")
        else:
            logger.warning(f"  ⚠ Unexpected LLM output: {type(layer4_output)}")
            
    except Exception as e:
        logger.error(f"  ✗ Entity extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Entity extraction failed: {str(e)}")

    # 5. Global Store Merge
    store = SESSIONS[session_id]["store"]
    store.merge_entities(layer4_output, source_type=document_type)
    
    final_state = store.get_session_view()
    filled_count = sum(1 for v in final_state.values() if v.get('value'))
    logger.info(f"  ✓ Merge complete: {filled_count} total fields filled")
    logger.info(f"Upload complete [{session_id[:8]}]: {document_type}")

    return {
        "message": f"{document_type} processed and merged.",
        "current_entities": store.get_session_view()
    }

@app.post("/session/{session_id}/voice")
async def process_voice_input(
    session_id: str,
    file: UploadFile = File(...)
):
    """
    Voice Input Flow:
    1. Save Audio
    2. Transcribe (Whisper)
    3. Extract (LLM)
    4. Merge (Entity Store)
    """
    logger.info(f"Voice input started [{session_id[:8]}]: {file.filename}")
    
    if session_id not in SESSIONS:
        # Auto-create session if it doesn't exist (handles server restarts)
        logger.warning(f"Session not found, auto-creating: {session_id[:8]}")
        store = EntityStore()
        SESSIONS[session_id] = {
            "store": store,
            "form_type": "income_certificate",  # Default form type
            "created_at": datetime.now().isoformat()
        }
    
    # 1. Save Audio
    voice_dir = BASE_DATA_DIR / session_id / "voice"
    voice_dir.mkdir(parents=True, exist_ok=True)
    file_path = voice_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    logger.info(f"  ✓ Audio saved")
    
    # 2. Transcribe
    try:
        processor = VoiceInputProcessor()
        text = processor.transcribe(str(file_path))
        preview = text[:80] + '...' if len(text) > 80 else text
        logger.info(f"  ✓ Transcribed: \"{preview}\"")
    except Exception as e:
        logger.error(f"  ✗ Transcription failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    
    # 3. Create Fake OCR Bundle
    voice_ocr_bundle = {
        "ocr_outputs": [
            {
                "agent": "voice_input",
                "modality": "speech",
                "text": text,
                "confidence": 1.0
            }
        ]
    }
    
    # 4. Extract Entities from Voice Transcript
    try:
        voice_entities = extract_entities(voice_ocr_bundle, document_type="voice", form_type=None)
        
        if isinstance(voice_entities, dict):
            extracted_count = sum(1 for v in voice_entities.values() if isinstance(v, dict) and v.get('value'))
            logger.info(f"  ✓ Extracted {extracted_count} entities from voice")
            # Log details at debug level
            for key, val in voice_entities.items():
                if isinstance(val, dict) and val.get('value'):
                    value_preview = str(val.get('value', ''))[:40]
                    logger.debug(f"    {key}={value_preview}")
        else:
            logger.warning(f"  ⚠ Unexpected extraction format")
    except Exception as e:
        logger.error(f"  ✗ Entity extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Voice entity extraction failed: {str(e)}")
    
    # 5. Merge into Session Store
    store = SESSIONS[session_id]["store"]
    store.merge_entities(voice_entities, source_type="voice")
    
    final_state = store.get_session_view()
    filled_count = sum(1 for v in final_state.values() if v.get('value'))
    logger.info(f"  ✓ Merge complete: {filled_count} total fields")
    logger.info(f"Voice input complete [{session_id[:8]}]")
    
    return {
        "message": "Voice processed and merged.",
        "transcription": text,
        "current_state": final_state
    }



@app.post("/session/{session_id}/finalize")
async def finalize_session(
    session_id: str, 
    token: Optional[str] = Form(None),
    db: Session = Depends(database.get_db)
):
    """Generates the final mapped form."""
    logger.info(f"Finalize session [{session_id[:8]}]")
    
    if session_id not in SESSIONS:
        # Auto-create session if it doesn't exist (handles server restarts)
        logger.warning(f"Session not found, auto-creating: {session_id[:8]}")
        store = EntityStore()
        SESSIONS[session_id] = {
            "store": store,
            "form_type": "income_certificate",  # Default form type
            "created_at": datetime.now().isoformat()
        }

    session = SESSIONS[session_id]
    store = session["store"]
    form_type = session["form_type"]

    # Load Schema
    schema_path = Path(f"form_mapper/schemas/{form_type}.json")
    if not schema_path.exists():
         logger.error(f"Schema not found: {form_type}")
         raise HTTPException(status_code=400, detail=f"Schema {form_type} not found")

    with open(schema_path, "r") as f:
        form_schema = json.load(f)

    # Extract flat values (not nested objects)
    final_data = {}
    for key, entity_obj in store.store.items():
        if isinstance(entity_obj, dict) and 'value' in entity_obj:
            final_data[key] = entity_obj['value']  # Extract just the value
        else:
            final_data[key] = entity_obj
    
    # --- PERSISTENCE: Save to Master Profile ---
    if token and token != "null" and token != "undefined":
        try:
            from jose import jwt
            from .auth_utils import SECRET_KEY, ALGORITHM
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email:
                user = db.query(models.User).filter(models.User.email == email).first()
                if user:
                    count = 0
                    for key, val in final_data.items():
                        if not val: continue
                        
                        # Upsert logic
                        existing = db.query(models.UserProfile).filter(
                            models.UserProfile.user_id == user.id,
                            models.UserProfile.entity_key == key
                        ).first()
                        
                        ent_obj = store.store.get(key, {})
                        conf = ent_obj.get("confidence", 1.0) if isinstance(ent_obj, dict) else 1.0
                        
                        if existing:
                            existing.value = str(val)
                            existing.confidence = conf
                            existing.source = "form_submission" # Mark as latest confirmed
                        else:
                            new_entry = models.UserProfile(
                                user_id=user.id,
                                entity_key=key,
                                value=str(val),
                                confidence=conf,
                                source="form_submission"
                            )
                            db.add(new_entry)
                        count += 1
                    
                    db.commit()
                    logger.info(f"  ✓ Saved {count} fields to Master Profile")
        except Exception as e:
            logger.error(f"Failed to save profile: {e}")
    # -------------------------------------------
    
    filled_count = sum(1 for v in final_data.values() if v)
    logger.info(f"  ✓ Finalized: {filled_count} fields populated")

    # --- NEW: Mark Application as Completed ---
    if hasattr(store, 'app_id') and store.app_id:
        app_record = db.query(models.Application).filter(models.Application.id == store.app_id).first()
        if app_record:
            app_record.status = "completed"
            app_record.completed_at = datetime.utcnow()
            db.commit()
            logger.info(f"  ✓ Application {store.app_id} marked as completed")
    # ------------------------------------------

    # Return flat values for frontend to display
    return final_data


@app.post("/upload-and-process/")
async def upload_and_process(
    document_type: str = Form(...),            # e.g., "aadhaar", "pan"
    form_type: str = Form(...),                # e.g., "income_certificate"
    files: List[UploadFile] = File(...),      # front.jpg, back.jpg or multi-page PDF
):
    """
    Expected: files ordered by user: front first then back (if applicable)
    document_type: controls which prompt to use
    form_type: selected from available/published forms
    """
    # ----------------------------------------------------
    # FEATURE 1: GUIDED DOCUMENT UPLOAD FLOW (VALIDATION)
    # ----------------------------------------------------
    validate_upload_constraints(files, document_type)

    upload_id = str(uuid.uuid4())
    upload_dir = BASE_DATA_DIR / upload_id
    upload_dir.mkdir(parents=True)

    saved_paths = []
    for i, file in enumerate(files):
        filename = f"{i}_{file.filename}"
        out_path = upload_dir / filename
        with out_path.open("wb") as f:
            shutil.copyfileobj(file.file, f)
        saved_paths.append(str(out_path))

    # 1) DOCUMENT ingestion -> pages (you may have pdf_to_images)
    # For simplicity, assume run_ocr_agents can take list of file paths or single page:
    layer3_output = run_ocr_agents(saved_paths, document_type=document_type)

    # 2) Select prompt
    prompt = get_prompt_for(document_type=document_type, form_type=form_type)
    # Optionally pass prompt into extract_entities (if extractor expects prompt)
    layer4_output = extract_entities(layer3_output, prompt=prompt)

    # 3) Map to requested form (load schema)
    schema_path = Path("form_mapper/schemas") / f"{form_type}.json"
    if not schema_path.exists():
        return JSONResponse({"error": "form schema not found"}, status_code=404)
    form_schema = json.load(open(schema_path))
    mapped = map_entities_to_form(layer4_output, form_schema)

    # Save artifacts
    with open(upload_dir / "layer3.json", "w") as f:
        json.dump(layer3_output, f, indent=2)
    with open(upload_dir / "layer4.json", "w") as f:
        json.dump(layer4_output, f, indent=2)
    with open(upload_dir / "mapped.json", "w") as f:
        json.dump(mapped, f, indent=2)

    return JSONResponse({"upload_id": upload_id, "mapped": mapped})

@app.get("/forms/list/")
def list_forms():
    out = []
    for p in Path("form_mapper/schemas").glob("*.json"):
        out.append(p.stem)
    return {"forms": out}

# -------------------------
# Admin endpoints
# -------------------------

@app.post("/admin/upload-form/")
async def admin_upload_form(file: UploadFile = File(...), form_name: str = Form(...)):
    """
    Admin uploads a blank PDF (or image) of the new form.
    We will attempt to generate a draft schema -> admin reviews in admin UI.
    """
    admin_id = str(uuid.uuid4())
    admin_dir = BASE_DATA_DIR / "admin" / admin_id
    admin_dir.mkdir(parents=True, exist_ok=True)
    out_path = admin_dir / file.filename
    with out_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    # Run simple OCR to produce text blocks
    draft_schema = generate_draft_schema(str(out_path), suggested_form_name=form_name)
    # save draft for review
    with open(admin_dir / "draft_schema.json", "w") as f:
        json.dump(draft_schema, f, indent=2)

    return {"admin_id": admin_id, "draft_schema": draft_schema}

@app.post("/admin/publish-form/")
def admin_publish_form(admin_id: str = Form(...), schema_patch: Optional[str] = Form(None)):
    """
    Admin provides accepted/edited schema JSON (as string) or we use the draft.
    We save the final schema to form_mapper/schemas/<form_name>.json
    """
    admin_dir = BASE_DATA_DIR / "admin" / admin_id
    if not admin_dir.exists():
        return JSONResponse({"error": "invalid admin_id"}, status_code=404)
    draft_path = admin_dir / "draft_schema.json"
    if not draft_path.exists():
        return JSONResponse({"error": "draft not found"}, status_code=404)

    final_schema = json.loads(schema_patch) if schema_patch else json.load(open(draft_path))
    form_name = final_schema.get("form_name")
    if not form_name:
        return JSONResponse({"error": "form_name required in schema"}, status_code=400)

    out_path = Path("form_mapper/schemas") / f"{form_name}.json"
    with open(out_path, "w") as f:
        json.dump(final_schema, f, indent=2)

    return {"status": "published", "schema_path": str(out_path)}
