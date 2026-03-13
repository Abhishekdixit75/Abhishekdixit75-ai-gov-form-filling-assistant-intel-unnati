# 🛠️ Project Setup Guide

This guide details how to set up the **AI-Powered Citizen Services Platform** locally. It covers all necessary downloads, installations, and configuration steps to run the full stack (Python Backend + Next.js Frontend + Local LLM).

---

## 🧰 Software Stack Overview

| Component | Purpose |
| :--- | :--- |
| **Python** | Backend (FastAPI, OCR, LLM orchestration) |
| **Node.js** | Frontend (Next.js/React) |
| **Ollama** | Local LLM runtime |
| **Qwen2-7B-Instruct** | Local LLM for entity extraction |
| **PaddleOCR** | OCR for printed text & layout |
| **Tesseract OCR** | Digit-focused OCR |
| **Whisper** | Voice transcription |
| **FFmpeg** | Audio processing (required by Whisper) |

---

## 🔹 STEP 1 — Install Python

**Required Version:** Python 3.9 – 3.11

1.  **Download:** [python.org/downloads](https://www.python.org/downloads/)
2.  **Verify installation:**
    ```bash
    python --version
    ```

---

## 🔹 STEP 2 — Create Virtual Environment (Recommended)

```bash
python -m venv venv
```

**Activate:**

*   **Windows:**
    ```bash
    venv\Scripts\activate
    ```
*   **Linux / macOS:**
    ```bash
    source venv/bin/activate
    ```

---

## 🔹 STEP 3 — Install Backend Python Dependencies

From the project root:

```bash
pip install -r backend/requirements.txt
```

> **Note:** This installs FastAPI, PaddleOCR, PyMuPDF, OpenCV, OpenAI Whisper, SQLAlchemy, etc.

---

## 🔹 STEP 4 — Install Ollama (Local LLM Runtime)

Ollama is used to run local LLMs without APIs.

1.  **Download Ollama:** [ollama.com/download](https://ollama.com/download)
2.  Install according to your OS.
3.  **Verify installation:**
    ```bash
    ollama --version
    ```

---

## 🔹 STEP 5 — Download & Run Qwen2-7B-Instruct Locally

This project uses **Qwen2-7B-Instruct** as the primary local LLM for entity extraction.

1.  **Pull the model:**
    ```bash
    ollama pull qwen2:7b-instruct
    ```
2.  **Test the model:**
    ```bash
    ollama run qwen2:7b-instruct
    ```
    *(If the model responds, Ollama is working correctly.)*

> **📌 Note:** Model download size is ~4–5 GB.

---

## 🔹 STEP 6 — Install PaddleOCR Dependencies

PaddleOCR is used for high-accuracy printed text OCR. It is installed via `requirements.txt`, but allows manually ensuring it:

```bash
pip install paddleocr paddlepaddle
```

> **📌 On Windows:** PaddlePaddle may take a few minutes to install.

---

## 🔹 STEP 7 — Install Tesseract OCR (Digit OCR)

Tesseract is used specifically for numeric text reliability (Aadhaar, PAN numbers).

*   **Windows:**
    *   Download: [UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)
    *   Install and **Add Tesseract to PATH**.
*   **Linux:** `sudo apt install tesseract-ocr`
*   **macOS:** `brew install tesseract`

**Verify:**
```bash
tesseract --version
```

---

## 🔹 STEP 8 — Install FFmpeg (Required for Voice / Whisper)

Whisper requires FFmpeg to process audio.

*   **Windows:**
    *   Download: [ffmpeg.org/download.html](https://ffmpeg.org/download.html)
    *   Download static build and **Add `ffmpeg/bin` to PATH**.
*   **Linux:** `sudo apt install ffmpeg`
*   **macOS:** `brew install ffmpeg`

**Verify:**
```bash
ffmpeg -version
```

---

## 🔹 STEP 9 — Install Whisper Model

Whisper is used for voice-based input extraction.

```bash
pip install openai-whisper
```

> **📌 Note:** Whisper downloads the `base` model automatically on first use (good accuracy + fast).

---

## 🔹 STEP 10 — Install Node.js (Frontend)

**Required Version:** Node.js 18+

1.  **Download:** [nodejs.org](https://nodejs.org/)
2.  **Verify:**
    ```bash
    node --version
    npm --version
    ```

---

## 🔹 STEP 11 — Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## 🔹 STEP 12 — Run the Backend Server

From the project root (ensure `venv` is active):

```bash
# Navigate to backend if needed, or run from root pointing to module
# Assumption: Running from root
uvicorn backend.api.main:app --reload --port 8000
# OR if inside backend folder:
# cd backend
# uvicorn api.main:app --reload
```

Backend runs at: [http://localhost:8000](http://localhost:8000)

---

## 🔹 STEP 13 — Run the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: [http://localhost:3000](http://localhost:3000) (or port 5173 depending on Next.js/Vite config)

---

## 🔹 STEP 14 — Verify Full System

1.  Open frontend in browser.
2.  Select a government service.
3.  Upload Aadhaar / PAN documents.
4.  Review auto-filled form.
5.  Upload voice input (optional).
6.  Download final JSON.

---

## 🔐 Notes on DigiLocker Support

This project does not directly call DigiLocker APIs.
*   Users can upload **DigiLocker-issued PDFs**.
*   Such documents are detected and assigned **higher trust**.
*   Official DigiLocker API integration is listed as future scope.

---

## 🧪 Troubleshooting

*   **Ollama not responding:** Ensure Ollama service is running. Restart system if required.
*   **OCR not detecting text:** Check image quality. Ensure PaddleOCR installed correctly.
*   **Whisper error about FFmpeg:** Ensure FFmpeg is in PATH. Re-verify installation.

---

## 📌 Summary

This setup enables:
*   ✅ **Fully local AI processing**
*   ✅ **No paid APIs**
*   ✅ **Secure handling of sensitive documents**
*   ✅ **High-accuracy extraction with human-in-the-loop review**

---

### ✅ Setup Complete

You are now ready to run the **AI-Powered Form Filling Assistant** for Indian Citizen Services locally.
