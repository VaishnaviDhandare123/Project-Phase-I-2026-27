# SpeechSense AI – Intelligent Automatic Speech Recognition & Speech Analysis Platform

> **"Transforming Human Speech into Intelligent, Accessible and Analyzable Text."**
>
> **Final-Year Bachelor of Technology (B.Tech) Computer Science & Engineering Capstone Project**  
> *Academic Research Focus:* Bridging the Acoustic Reality Gap in Automatic Speech Recognition for Low-Resource Disordered Speech via Transformer Seq2Seq Modeling, Synthetic Perturbation, and Acoustic Manifold Analysis.

---

## 🌟 Executive Overview & Problem Statement

Automatic Speech Recognition (ASR) systems powered by deep neural networks have achieved remarkable accuracy in standard acoustic domains. However, standard models suffer acute performance degradation when deployed on atypical, disordered, or low-resource speech cohorts—such as **dysarthric speech** resulting from neuromotor speech disorders (Cerebral Palsy, Amyotrophic Lateral Sclerosis, Parkinson's disease, or Traumatic Brain Injury). Dysarthric speech exhibits involuntary vocal fold tremors, hypernasality, slow speech rates, and vowel space centralization (formant centralization) that diverge sharply from standard training distributions.

**SpeechSense AI** is a dual-paradigm platform that unites:
1. **Production-Grade Standard ASR:** Full offline Transformer transcription using **OpenAI Whisper**, polyphase 16 kHz DSP resampling, sliding-window Voice Activity Detection (VAD), spectral noise gating, interactive waveform visualization, and a transcript editor with multi-format export (TXT, PDF, Word DOCX, JSON, SRT subtitles).
2. **Advanced Research Speech Analysis:** An academic research laboratory implementing the empirical methodology of the foundational IEEE Access paper (*"Bridging the Reality Gap in ASR for Low-Resource Dysarthric Speech: Evaluating Performance on Synthetic and Real Data"*). Features 18 vectorized clinical acoustic metrics, synthetic dysarthric acoustic perturbation, multi-stage fine-tuning, exact JiWER Levenshtein error decomposition (WER/CER with Substitutions, Deletions, Insertions), and high-dimensional manifold projections (PCA and t-SNE).

---

## 🔬 Foundational Research & Methodology Mapping

The research framework directly integrates and operationalizes the empirical findings from IEEE Access:

| IEEE Access Research Concept | Implementation in SpeechSense AI | Architectural Component |
| :--- | :--- | :--- |
| **Transformer-based Whisper ASR** | Offline PyTorch `openai/whisper-tiny` (39M parameters) & `whisper-base` | `backend/ml/transcription/whisper_engine.py` |
| **Dysarthric Speech Modeling** | TORGO & UA-Speech dataset adapters with clinical severity stratification | `backend/ml/datasets/adapters.py` |
| **Acoustic Profiling (18 Metrics)** | Pitch tracking (YIN $F_0$), HNR, local jitter, local shimmer, LPC formants ($F_1, F_2$), formant dispersion, spectral moments, speech rate | `backend/ml/acoustic_analysis/extractor.py` |
| **Synthetic Data Augmentation** | Glottal tremor injection, formant space centralization, and non-linear tempo warping with ethical consent enforcement | `backend/ml/augmentation/synthesizer.py` |
| **Multi-Stage Fine-Tuning** | Low-memory Seq2Seq gradient descent with epoch loss telemetry and checkpoint management | `backend/ml/training/finetuner.py` |
| **Levenshtein Error Decomposition** | Exact JiWER calculation of uncapped WER, CER, Substitutions ($S$), Deletions ($D$), Insertions ($I$), and Hits ($H$) | `backend/ml/evaluation/metrics.py` |
| **Eigenspace Projection (PCA)** | Standardized 2-component PCA projection with explained variance ratios and feature loadings | `backend/ml/visualization/pca_engine.py` |
| **Non-Linear Manifold (t-SNE)** | Kullback-Leibler divergence minimization with configurable perplexity clustering | `backend/ml/visualization/tsne_engine.py` |
| **Synthetic vs. Real Reality Gap** | Cross-domain benchmark matrices quantifying the 6–8% acoustic reality gap delta | `backend/app/api/research.py` |
| **Laboratory Documentation** | Automated publication-ready PDF (ReportLab) and Word DOCX report compilation | `backend/app/api/reports.py` |

---

## 🏛️ System Architecture

The application is structured as a decoupled, multi-tier client-server architecture:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SPEECHSENSE AI WEB APPLICATION                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    ┌─────────────────────────┐             ┌─────────────────────────┐
    │   React 18 + Vite SPA   │             │   FastAPI REST Engine   │
    │  (Tailwind CSS, Recharts)│ ◄──────────►│  (PyTorch, Transformers)│
    │       Port: 3000        │  HTTP / JSON│       Port: 8000        │
    └─────────────────────────┘             └─────────────────────────┘
                 │                                       │
                 ▼                                       ▼
    ┌─────────────────────────┐             ┌─────────────────────────┐
    │ 25 Specialized Pages    │             │ ML & Signal Processing  │
    │ • Standard ASR Studio   │             │ • Whisper Offline ASR   │
    │ • Waveform Visualizer   │             │ • Polyphase Resampling  │
    │ • Multi-track Editor    │             │ • 18 Acoustic Features  │
    │ • PCA & t-SNE 2D Plots  │             │ • JiWER Levenshtein     │
    │ • Fine-Tuning Dashboard │             │ • Seq2Seq Fine-Tuning   │
    └─────────────────────────┘             └─────────────────────────┘
                                                         │
                                    ┌────────────────────┴────────────────────┐
                                    ▼                                         ▼
                       ┌─────────────────────────┐               ┌─────────────────────────┐
                       │   Local File Storage    │               │    Persistence Layer    │
                       │ • Audio: storage/audio/ │               │ • MongoDB Atlas / Local │
                       │ • Weights: .cache/hub/  │               │ • Embedded Atomic JSON  │
                       │ • Reports: reports/     │               │   (storage/db.json)     │
                       └─────────────────────────┘               └─────────────────────────┘
```

---

## 📦 Technology Stack

### Backend & Machine Learning
- **Programming Language:** Python 3.11+
- **Deep Learning Framework:** PyTorch (`torch`)
- **ASR Model & Processor:** Hugging Face `transformers` (`openai/whisper-tiny` & `openai/whisper-base`)
- **Digital Signal Processing (DSP):** `scipy.signal` (polyphase sinc resampling, LPC), `soundfile`, `librosa`
- **Numerical Computation:** NumPy, SciPy, Pandas
- **Error Metrics:** `jiwer` v3.1 (Word Error Rate, Character Error Rate, Levenshtein edit distance)
- **Dimensionality Reduction:** `scikit-learn` (`StandardScaler`, `PCA`, `TSNE`)
- **REST Framework:** FastAPI, Uvicorn, Pydantic
- **Document Generation:** `reportlab` (PDF generation), `python-docx` (Word generation)
- **Security:** `passlib` with `bcrypt`, `PyJWT` (HS256 tokens)

### Frontend & Data Visualization
- **Library & Build Tool:** React 18, Vite 5
- **Routing:** React Router v6
- **Styling:** Tailwind CSS (with seamless Dark and Light theme switching)
- **Data Visualization:** Recharts (Scatter plots, Bar charts, Responsive containers)
- **Iconography & Motion:** Lucide React, Framer Motion
- **HTTP Client:** Axios with JWT request interceptors
- **Audio Capture:** Web Audio API & MediaRecorder API

### Database & Storage
- **Primary Database:** MongoDB (`motor` async client)
- **Zero-Setup Fallback:** Atomic Embedded JSON Document Store (`backend/storage/db.json`), enabling instant demonstration without a local MongoDB service.

---

## 🚀 Quickstart & Installation Guide

### Prerequisites
- **Operating System:** Windows 10/11, Linux, or macOS
- **Python:** Version 3.11 or 3.12 (with pip)
- **Node.js:** Version 18+ (with npm)
- **Hardware:** Runs on any standard CPU (AMD Ryzen 5, Intel i5/i7) with 8GB RAM. CUDA GPU supported automatically if available.

### 1. Clone & Set Up the Repository
```bash
git clone https://github.com/your-username/speechsense-ai.git
cd "speechsense-ai"
```

### 2. Configure Backend Python Environment
```bash
# Create virtual environment
python -m venv .venv

# Activate on Windows
.venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Verify Offline Model & Run Backend Test Suite
```bash
# Verify audio generation, signal processing, JiWER, PCA, and offline Whisper inference
python scripts/run_tests.py
```
*Output: All 8 unit and integration tests should pass with 100% success.*

### 4. Install Frontend Dependencies & Build
```bash
# Install Node dependencies
npm install

# Verify production build
npm run build
```

### 5. Launch the Application

#### Option A: One-Click Launch (Windows)
Double-click the provided batch scripts in the project root:
1. `start_backend.bat` (Starts FastAPI at `http://127.0.0.1:8000`)
2. `start_frontend.bat` (Starts Vite at `http://localhost:3000`)

#### Option B: Terminal Launch
**Terminal 1 (Backend):**
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://127.0.0.1:8000`
- Swagger Interactive Documentation: `http://127.0.0.1:8000/docs`

**Terminal 2 (Frontend):**
```bash
npm run dev
```
- Open browser at: `http://localhost:3000`

---

## 🖥️ Complete Application Modules (25 Pages)

### Standard ASR Modules
1. **Landing Page (`/`):** Hero section, live audio waveform animation, interactive ASR demonstration, architecture breakdown, use cases, and tech stack.
2. **User Authentication (`/login`, `/register`):** Secure registration, bcrypt password hashing, JWT session management, with automatic Guest Demo mode.
3. **Executive Dashboard (`/dashboard`):** Real-time hardware telemetry badges, audio throughput analytics, quick-action tiles, and recent activity logs.
4. **Speech-to-Text Studio (`/speech-to-text`):** Drag-and-drop audio uploader (MP3, WAV, M4A, FLAC, OGG, WebM), audio playback waveform, language selection, and one-click Whisper transcription.
5. **Live Microphone Transcription (`/live`):** Web Audio API microphone stream, real-time decibel meter, canvas visualizer, and streaming chunk transcription.
6. **Audio Preprocessing Engine (`/preprocessing`):** Side-by-side original vs. processed waveform comparison, polyphase 16 kHz resampling, peak normalization, VAD silence trimming, and spectral noise gating.
7. **Transcript Editor (`/editor`, `/editor/:id`):** Side-by-side original AI vs. edited transcript, find & replace, undo/redo, word count statistics, and export to TXT, PDF, Word DOCX, JSON, and SRT subtitles.
8. **Transcription History (`/history`):** Searchable, filterable audit log of all transcriptions with duration, sample rate, language, and deletion controls.
9. **Transcription Details (`/history/:id`):** Deep inspection view of metadata, raw audio playback, processed audio waveforms, and confidence metrics.

### Research Speech Analysis Modules (IEEE Access Methodology)
10. **Speech Analysis Hub (`/speech-analysis`):** Overview of acoustic analysis algorithms, clinical taxonomy, and quick access to research experiments.
11. **Acoustic Features Profiler (`/acoustic-features`):** Extraction of 18 clinical acoustic metrics (YIN F0, HNR, jitter %, shimmer dB, LPC formants F1/F2, formant dispersion, speech rate) with interactive pitch and energy contour plots.
12. **Dysarthric Speech Research (`/dysarthric-research`):** In-depth exploration of clinical dysarthria types (Spastic, Flaccid, Ataxic, Hypokinetic, Hyperkinetic, Mixed) and neuromotor acoustic correlates.
13. **Dataset Management (`/datasets`):** Built-in adapters for TORGO and UA-Speech datasets with clinical severity stratification and train/validation/test split inspection.
14. **Synthetic Speech Augmentation (`/augmentation`):** Dynamic perturbation engine simulating vocal tremor, glottal flutter, formant centralization, and tempo stretching with IRB ethical consent enforcement.
15. **Model Fine-Tuning Studio (`/training`):** Seq2Seq Whisper fine-tuning dashboard with live loss curve visualization, learning rate schedules, and checkpoint management.
16. **Experiment Management (`/experiments`):** Registry of model training runs, hyperparameters, convergence logs, and model checkpoint artifacts.
17. **PCA Eigenspace Visualization (`/pca`):** Standardized 2D Principal Component Analysis scatter plot displaying variance ratios and acoustic feature eigenvector loadings.
18. **t-SNE Manifold Visualization (`/tsne`):** Non-linear t-SNE manifold clustering with perplexity sliders and centroid computation separating Healthy, Natural Dysarthric, and Synthetic cohorts.
19. **Model Evaluation & Error Rates (`/evaluation`):** Interactive JiWER calculator computing uncapped Word Error Rate (WER) and Character Error Rate (CER) with Levenshtein Substitutions ($S$), Deletions ($D$), and Insertions ($I$).
20. **Cross-Domain Model Comparison (`/comparison`):** Comparative benchmark matrices and bar charts analyzing Zero-Shot vs. Fine-Tuned Whisper across clean, synthetic, and natural dysarthric domains.
21. **Research Report Generator (`/reports`):** Automated compilation of formal research laboratory reports exported directly into publication-quality PDF or editable Word (.docx) formats.

### System & Governance Modules
22. **User Profile (`/profile`):** Session identification, JWT status, and audio data retention and anonymization privacy controls.
23. **Settings & Hardware (`/settings`):** Live CPU, RAM, and GPU telemetry polling, audio DSP parameter tuning, and storage directory inspector.
24. **About SpeechSense AI (`/about`):** Detailed project abstract, IEEE Access citation, system architecture diagrams, and team credits.

---

## 🧪 Scientific Verification & Test Suite

The platform includes a test suite verifying every component from raw DSP math to offline deep learning inference. Run the tests with:

```bash
python scripts/run_tests.py
```

### Verified Test Results (8/8 Passing):
```
[1/8] Testing Authentication & Security...              [PASS] (Password hashing & JWT verified)
[2/8] Testing Database Resilience...                    [PASS] (Local JSON fallback verified)
[3/8] Testing Audio Preprocessing Pipeline...           [PASS] (16kHz resampling, VAD, Normalization verified)
[4/8] Testing 18 Acoustic Features Extraction...        [PASS] (F0, HNR, Jitter, Shimmer, Formants verified)
[5/8] Testing JiWER Metric Engine...                    [PASS] (WER/CER Levenshtein S/D/I verified)
[6/8] Testing PCA & t-SNE Manifold Engines...           [PASS] (2D Eigenspace & t-SNE clustering verified)
[7/8] Testing Offline Whisper ASR Inference...          [PASS] (Official OpenAI Whisper Tiny loaded & transcribed)
[8/8] Testing Research Report Generation (PDF/DOCX)...  [PASS] (ReportLab & python-docx output verified)

==================================================
TEST SUITE SUMMARY: 8/8 TESTS PASSED (100% SUCCESS)
==================================================
```

---

## ⚖️ Ethical Governance & Clinical Non-Diagnostic Disclaimer

> **IMPORTANT NOTICE:**  
> **SpeechSense AI is strictly an academic, computer science, and speech engineering research platform.** It is designed to investigate Automatic Speech Recognition robustness, domain adaptation, and acoustic representation learning under low-resource and disordered acoustic distributions.
>
> **The platform does NOT constitute a medical diagnostic device, therapeutic system, or clinical decision support tool.** It must never be used to formulate medical diagnoses, clinical speech-language pathology conclusions, or patient treatment regimens. All synthetic acoustic manipulations adhere to data safety protocols and enforce explicit research user consent.

---

## 👥 Authors & Academic Credits

- **Degree Program:** Bachelor of Technology (B.Tech) in Computer Science & Engineering
- **Project Type:** Final-Year Capstone Project Demonstration
- **Academic Year:** 2026
- **Architecture & Implementation:** Developed and verified with modern Python, PyTorch, Hugging Face Transformers, FastAPI, React 18, and Vite.
