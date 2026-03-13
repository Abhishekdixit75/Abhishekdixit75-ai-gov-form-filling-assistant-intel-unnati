# Technology Stack and Orchestration Report

This document outlines the full technology ecosystem used in the **AI-Powered Form Filling Assistant** prototype, detailing each layer of the stack and how the components are orchestrated to run together.

---

## 🏗️ 1. Orchestration & Infrastructure Strategy

Currently, the application is designed for **Fully Local Execution** with zero dependence on paid cloud APIs. It lacks containerized orchestration (like Docker Compose or Kubernetes) and instead relies on environment-native execution.

### Local Orchestration Flow:
1. **Frontend Server**: Runs directly on Node.js using `npm run dev` (built on the Next.js development server).
2. **Backend Server**: Runs directly on Python using `uvicorn api.main:app` (ASGI server).
3. **Local AI Runtime**: Uses **Ollama** deployed as a background system service to host the `Qwen2-7B-Instruct` Large Language Model.
4. **Inter-Service Communication**: The Frontend (running on port `3000`) communicates with the Backend API (running on port `8000`) via standard HTTP REST calls using [fetch](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/frontend/app/dashboard/applications/page.tsx#18-28) and `FormData`. The Backend API then makes local socket calls to the Ollama runtime and spawns asynchronous processes for OCR.

> [!TIP]
> **Production Orchestration Recommendation:**
> Moving forward, wrapping the Frontend, Backend, and a Database instance into a `docker-compose.yml` file would dramatically simplify the setup process and guarantee environment consistency across deployments.

---

## 🖥️ 2. Frontend Presentation Layer

The frontend is built for responsiveness, accessibility, and high interactivity.

*   **Framework**: **Next.js 14** (React 19)
    *   Provides Server-Side Rendering (SSR) capabilities and hybrid routing.
*   **Styling**: **Tailwind CSS v4** (`tailwindcss`, `@tailwindcss/postcss`)
    *   Utility-first CSS framework for rapid UI development without writing custom CSS files.
    *   Helper utilities like `tailwind-merge` and `clsx` are used for dynamic class logic.
*   **Iconography**: **Lucide React**
    *   Provides clean, modern, and lightweight SVG icons.
*   **Language**: **TypeScript**
    *   Ensures strict type-safety across components and API responses.

---

## ⚙️ 3. Backend API & Business Logic Layer

The backend acts as the central brain, handling HTTP requests, routing files to the AI pipeline, and managing database connections.

*   **API Framework**: **FastAPI** (v0.121.3)
    *   High-performance Python framework utilizing asynchronous endpoints (`async def`).
    *   Built-in OpenAPI (Swagger) documentation.
*   **Server Gateway**: **Uvicorn** (v0.38.0)
    *   A lightning-fast ASGI web server implementation used to run the FastAPI application.
*   **Data Validation**: **Pydantic**
    *   Enforces strict type hints and schema validation for incoming/outgoing JSON data.
*   **Security & Authentication**:
    *   **python-jose[cryptography]**: Generates and decodes JWT (JSON Web Tokens).
    *   **passlib[argon2]**: Secure password hashing using the Argon2 algorithm.
    *   **cryptography**: Used for AES-128 Database Encryption (Symmetric caching).

---

## 🧠 4. AI & Machine Learning Pipeline

The project features a highly complex, multi-modal ingestion pipeline that combines OCR and natural language processing.

### Document Parsing (Computer Vision)
*   **PaddleOCR** (`paddleocr==3.3.2`, `paddlepaddle==3.2.2`): The primary engine used for high-accuracy printed text extraction and document layout analysis.
*   **Tesseract OCR** (`pytesseract==0.3.13`): A secondary, highly reliable OCR engine used specifically for reading numbers (e.g., Aadhaar digits, PAN numbers).
*   **OpenCV** (`opencv-python==4.11.0.86`): Used for image pre-processing (deskewing, contrast enhancement) before hitting the OCR engines.
*   **PyMuPDF** (`PyMuPDF==1.26.7`): Used to render PDF pages into images so that the OCR engines can parse them.

### Entity Extraction (Large Language Models)
*   **Ollama**: A local client wrapper that runs open-source LLMs offline.
*   **Qwen2-7B-Instruct**: The specific 7-Billion parameter LLM downloaded via Ollama. It receives the raw text blocks from PaddleOCR and uses prompt engineering to extract structured JSON entities (Name, Address, DOB).

### Voice Processing (Audio Integration)
*   **OpenAI Whisper**: Transcribes spoken audio into text in real-time.
*   **FFmpeg**: An underlying system dependency utilized by Whisper to parse raw audio files (like `.webm` or `.m4a`) into pure waveforms.

---

## 💾 5. Data Persistence Layer

*   **ORM (Object-Relational Mapper)**: **SQLAlchemy**
    *   Abstracts raw SQL queries into Python objects ([models.py](file:///c:/Users/abhis/Desktop/ai-gov-form-filling-assistant-intel-unnati-main/backend/api/models.py)). Handles automatic migrations and connection pooling.
*   **Database Engine**: **SQLite** (Development) / **MySQL** (Production)
    *   SQLite is used out-of-the-box for rapid prototyping.
    *   The project is wired for MySQL in production, utilizing the `pymysql` database driver.
