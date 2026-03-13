# AI-Gov Form Filling Assistant: Project Overview

This document provides a comprehensive overview of the AI-Powered Form Filling Assistant, detailing its architecture, data flow, core features, and database implementation.

## 🎯 1. Project Vision & Core Problem

**The Problem:** Citizens at Seva Kendras face long queues, redundant manual data entry, and high error rates when filling out multiple government forms (Income Certificate, Domicile, Ration Card, etc.) using the same physical IDs.
**The Solution:** An AI-driven web application optimized for Intel hardware that automates form filling by intelligently extracting data from uploaded document images (Aadhaar, PAN) and vernacular voice inputs.

## 🏗️ 2. High-Level Architecture

The system follows a strict pipeline to ensure high accuracy (>90%) and low latency (≤ 3–5 seconds):

1.  **Ingestion:** Users upload document images (JPEG/PNG) or PDFs via the frontend (React/Next.js) or provide audio input. PDFs are converted into individual images.
2.  **OCR Processing (Layer 3):** Images are passed to the OCR Engine optimized via `OpenCV` (Grayscale & CLAHE contrast enhancement) and [PaddleOCR](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/backend/ocr_agents/paddle_agent.py#6-89).
3.  **LLM Entity Extraction (Layer 4):** The raw OCR text (or transcribed Voice text) is structured into JSON using prompt-engineered instructions sent to a local LLM (`Qwen`). It extracts specific fields based on the document type using regex and proximity heuristics.
4.  **Data Merging & Conflict Resolution:** Extracted entities are sent to the **Global Entity Store**. This store resolves conflicting information (e.g., Aadhaar vs. PAN vs. Voice) using a strict Trust Hierarchy (e.g., Document data overrides Voice data).
5.  **Form Mapping:** The curated "Master Profile" data is dynamically mapped to a specific government form's schema (e.g., `income_certificate.json`).
6.  **Review & Export:** The fully mapped data is sent back to the frontend for the operator/citizen to review, edit, and ultimately submit or download.

## 🔄 3. Detailed Data Flow

1.  **Frontend (`/session/{session_id}/upload`)** uploads an Aadhaar card image.
2.  **Image Pre-processing:** [backend/ocr_agents/paddle_agent.py](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/backend/ocr_agents/paddle_agent.py) resizes the image, converts it to grayscale, and applies CLAHE (Contrast Limited Adaptive Histogram Equalization) to make faded text readable.
3.  **OCR Execution:** [paddle_agent.py](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/backend/ocr_agents/paddle_agent.py) extracts raw text from the optimized image.
4.  **Agent Aggregation:** [backend/ocr_agents/aggregator.py](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/backend/ocr_agents/aggregator.py) collects the raw text from PaddleOCR. *(Note: Tesseract and Layout agents were removed for speed optimization).*
5.  **LLM Processing:** [backend/llm_engine/extractor.py](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/backend/llm_engine/extractor.py) formats a strict prompt using [prompt_registry.py](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/backend/llm_engine/prompt_registry.py) instructing the local Ollama LLM to extract JSON entities (Name, DOB, Aadhaar Number using strict regex `\d{4}\s?\d{4}\s?\d{4}`).
6.  **Entity Store Merge:** The extracted JSON is sent to [backend/form_mapper/entity_store.py](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/backend/form_mapper/entity_store.py). If a field like "Name" already exists from a previous Voice input, the store uses [merge_policies.py](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/backend/form_mapper/merge_policies.py) to overwrite the less-trusted voice input with the highly-trusted Aadhaar spelling.
7.  **Finalize (`/session/{session_id}/finalize`)**: [backend/form_mapper/mapper.py](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/backend/form_mapper/mapper.py) loads the target form schema (e.g., `schemas/income_certificate.json`), pulls the requested fields from the Entity Store, and returns the final mapped dictionary to the user.
8.  **Data Persistence:** Validated entities are saved to the `UserProfile` in the database, and the temporary uploaded images/audio files are securely deleted.

## 🌟 4. Core Features

*   **Multimodal Input:** Supports document uploads (Images/PDFs) alongside **Multilingual Voice Input**.
*   **Intelligent Voice Translation:** The [backend/voice/whisper_input.py](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/backend/voice/whisper_input.py) is configured with `task="translate"`, natively translating Hindi or regional audio into English text before LLM extraction for maximum accuracy.
*   **Conflict Resolution Engine:** A sophisticated Entity Store that prioritizes data based on the source's authority (Aadhaar > PAN > Voice).
*   **Dynamic Schema Mapping:** Adding support for new government forms requires zero code changes; admins simply drop a new JSON schema into `form_mapper/schemas/`.
*   **Privacy-First:** `shutil.rmtree` automatically deletes uploaded IDs and audio files from the server's hard drive the moment the form is successfully finalized.
*   **Regex-Enforced Extraction:** Critical fields like Aadhaar and PAN numbers are extracted strictly via regex anchors in the LLM prompts to guarantee 0% hallucination on ID numbers.

## 🗄️ 5. Database Schema Information

The system utilizes an SQLite database ([unnati_db.db](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/backend/unnati_db.db)) managed via SQLAlchemy ORM.

### Models Overview

1.  **`User`**: Handles authentication and account management.
    *   Fields: `id`, `email`, `hashed_password`, `is_active`
2.  **`UserProfile`**: Acts as the permanent "Master Profile" for a citizen. When a form is finalized, the highly confident, extracted entities (Name, Address, PAN) are saved here. Future forms are auto-filled using this data instantly.
    *   Fields: `id`, `user_id` (ForeignKey), `entity_key` (e.g., 'full_name'), `value`, `confidence`, `source` (e.g., 'form_submission'), `updated_at`.
3.  **`Application`**: Tracks the progress of a specific form-filling session.
    *   Fields: `id`, `user_id` (ForeignKey), `form_type` (e.g., 'income_certificate'), `status` ('in_progress', 'completed'), `created_at`, `completed_at`.

### Persistence Flow
When `/session/init` is called, the backend checks the `UserProfile` table. If the citizen has filled out a form previously, their saved details are automatically pre-loaded into the active session's Entity Store, instantly auto-filling the new form before they even upload a document.
