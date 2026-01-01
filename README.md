# AI-Powered Form Filling Assistant (Intel Unnati)

![Banner](demo/homePage.png)

> **"Bridging the Gap Between Citizens and Government Services"**

## 📖 Introduction
This project is a prototype **AI-Powered Form Filling Assistant** designed participating in the **Intel Unnati Industrial Training Program**. Ideally, it aims to simplify the often complex and daunting process of filling out government applications for Indian citizens.

By leveraging **PaddleOCR** for document digitization and **Large Language Models (LLMs)** for intelligent entity extraction, our system transforms physical documents into digital applications in seconds.

---

## 🚩 Problem Statement
Government forms in India suffer from significant friction points:
*   **Language Barriers**: Access is often limited to English or Hindi, excluding millions of vernacular speakers.
*   **Complexity**: Forms are lengthy, repetitive, and prone to manual error.
*   **Manual Entry**: Citizens repeatedly re-enter the same data (Name, Address, DoB) across different departments.

This leads to high rejection rates, frustration, and a digital divide that excludes the very people these services are meant to help.

---

## 💡 Our Solution
We have built an intelligent pipeline that acts as a "Digital Assistant":
1.  **Multi-Modal Ingestion**: Upload images, PDFs, or even speak to the assistant naturally.
2.  **Intelligent Extraction**: Using OCR and LLMs to "read" documents like Aadhaar, PAN, and Domicile certificates.
3.  **Global Entity Store**: A central memory that learns about the user. Once it knows your "Date of Birth" from your Aadhaar, it never asks for it again.
4.  **Auto-Filling**: Automatically maps your personal data to any new government form schema.

---

## ✨ Key Features

### 1. Intuitive Dashboard
A clean, accessible interface designed for all users, featuring high-contrast references and clear calls to action.
![Dashboard](demo/dashboardPreview.png)

### 2. Multi-Lingual & Voice Support
Users can speak in their native language to provide inputs, making the web accessible to those with lower digital literacy.
![Voice Demo](demo/voiceDemoInUI.png)

### 3. Smart Document Processing
Simply upload a document, and the system extracts, validates, and stores the data.
![Upload](demo/uploadDemo.png)

### 4. Interactive Review
Before submission, users can review and correct extracted data in a friendly, card-based layout.
![Review](demo/reviewPage.png)

---

## 🏗️ System Architecture

Our system follows a modular "Layered" pipeline approach to ensure scalability and accuracy.

### Extraction Pipeline
The core logic moves raw data through OCR (Layer 3) to Semantic Understanding (Layer 4).
![Extraction Pipeline](docs/design_doc/extraction_pipeline_sequence.png)

### Global Entity Store & Merging
Data from multiple documents is merged into a single "Source of Truth" with confidence scores.
![Merging Logic](docs/design_doc/merging_logic_flow.png)

---

## 🚀 Getting Started

For detailed installation instructions, please refer to our **[Setup Guide](setup_guide.md)**.

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/Abhishekdixit75/Abhishekdixit75-ai-gov-form-filling-assistant-intel-unnati.git

# 2. Start Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload

# 3. Start Frontend
cd ../frontend
npm install
npm run dev
```

---

## 📊 Performance
We rigorously test our extraction, throughput, and error rates.
See our detailed **[Performance Benchmarks](docs/performance_benchmarks/performance_benchmarks.md)**.

---

## 🛠️ Tech Stack
*   **Frontend**: Next.js 14, React, TailwindCSS, Lucide Icons
*   **Backend**: FastAPI (Python), Uvicorn
*   **AI/ML**: PaddleOCR, LangChain, OpenAI/Gemini API (configurable)
*   **Database**: SQLite (Prototype) / PostgreSQL (Production ready)
*   **Voice**: OpenAI Whisper

---

## 👥 Team & Acknowledgements
**Intel Unnati Industrial Training Program - 2025**

Special thanks to the dedicated team members for their contributions to architecture, frontend development, and rigorous testing:

*   **Abhishek Dixit** (Did something)
*   **Devendra Kumar Dewangan** (Frontend)
*   **Somil Agrawal** (Backend)

---

> [!CAUTION]
> **Disclaimer**: This application is a **prototype** developed for educational and demonstration purposes. It is not an official government platform and does not process real legal applications. All user data is processed locally or in a sandbox environment.
