# Dermalytics — AI-Driven Skin and Hair Health Assessment Platform

**Hamdard University, Karachi — Department of Computer Science**  
*Final Year Project (FYP)*

---

## 👥 Project Team
* **Syed Azan Ahmed** (Roll No: 3119-2023)
* **Asma Ghani** (Roll No: 3226-2023)
* **Hania Saeed** (Roll No: 2235-2023)
* **Project Supervisor:** Khurram Iqbal

---

## 📖 Overview

**Dermalytics** is an AI-powered dermatological and trichological screening platform designed to assist users in identifying potential skin lesion abnormalities and tracking scalp/hair health. It bridges the gap between isolated single-domain tools by combining deep learning diagnostics with **Explainable AI (Grad-CAM)** and **longitudinal progress tracking**.

---

## 🚀 Key Features

1. **Skin Lesion Classification (HAM10000 7-Class Model):**
   - Melanoma (`mel` - High Risk)
   - Melanocytic Nevus (`nv` - Benign Mole)
   - Basal Cell Carcinoma (`bcc` - Malignant)
   - Actinic Keratosis (`akiec` - Pre-cancerous)
   - Benign Keratosis (`bkl` - Benign)
   - Dermatofibroma (`df` - Benign)
   - Vascular Lesion (`vasc` - Benign)
2. **Hair and Scalp Health Analyzer:**
   - Quantitative Hair Density Score ($0 - 100$)
   - Norwood-Hamilton / Ludwig Thinning Stage Classification
   - Follicle Density, Scalp Visibility, and Sebum/Inflammation indicators
3. **Explainable AI (Grad-CAM Visualizer):**
   - High-resolution spatial saliency heatmaps highlighting exact regions influencing predictions
   - Interactive before/after split slider, opacity control, and colormap selectors (Jet, Turbo, Plasma, Hot)
4. **Clinical Safety & Triage Rule Engine:**
   - Automated physician consultation directives for predictions $<80\%$ confidence or high-risk pathologies
5. **Longitudinal Progress Telemetry:**
   - Scan-to-scan side-by-side comparison across months
   - Time-series progression curves
6. **Clinical Consultation PDF Summary Sheet:**
   - Printable structured sheet with patient info, original scan, Grad-CAM heatmap, probabilities, and doctor signature space.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons |
| **Backend API** | Python 3.10+, FastAPI, Pydantic, SQLAlchemy, Uvicorn |
| **AI / ML & CV** | PyTorch, OpenCV, NumPy, Pillow, Scikit-learn |
| **Database** | SQLite (Dev) / PostgreSQL 14+ (Production) |
| **Containerization** | Docker, Docker Compose |

---

## ⚡ Quick Start & Installation

### Option 1: Automated Windows Batch Script
Simply double-click:
```bat
setup.bat
```
Then launch both frontend and backend concurrently with:
```bat
start_dev.bat
```

---

### Option 2: Manual Terminal Setup

#### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
* Backend API will run on `http://127.0.0.1:8000`
* Swagger Interactive Docs: `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
* Open your browser at `http://localhost:5173`

---

## 🧪 Running Automated Tests

### Backend Unit Tests (PyTest)
```bash
cd backend
python -m pytest tests/
```

---

## 🛡️ Medical Disclaimer
*Dermalytics provides preliminary supplementary screening and self-monitoring insights. It does not provide medical diagnoses or prescriptions. Always consult a licensed dermatologist for clinical evaluation.*
