# SpeechSense AI: System Architecture & Engineering Plan

## 1. High-Level Architecture Overview

SpeechSense AI utilizes a decoupled, modern multi-tier architecture designed for low-latency deep learning inference, high modularity, and reproducible research workflows.

```
       ┌────────────────────────────────────────────────────────┐
       │                Modern React 18 + Vite UI               │
       │     (Tailwind CSS, Lucide Icons, Framer Motion, Charts)│
       └───────────────────────────┬────────────────────────────┘
                                   │ HTTP/REST & WebSockets
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                 FastAPI RESTful Backend                │
       │    (JWT Auth, Rate Limiter, CORS, Background Tasks)    │
       └─────┬─────────────────────┬──────────────────────┬─────┘
             │                     │                      │
             ▼                     ▼                      ▼
┌──────────────────────┐ ┌───────────────────┐ ┌────────────────────┐
│   ML Core Services   │ │  Acoustic Engine  │ │  Research & Eval   │
│  - Whisper Processor │ │  - Librosa & Yin  │ │  - jiwer WER / CER │
│  - PyTorch Inference │ │  - LPC Formants   │ │  - PCA & t-SNE     │
│  - Chunk Streaming   │ │  - HNR, Jitter    │ │  - Reality Gap Cmp │
│  - VAD & Resampling  │ │  - Spectrograms   │ │  - Multi-stage FT  │
└──────────────────────┘ └───────────────────┘ └────────────────────┘
             │                     │                      │
             ▼                     ▼                      ▼
┌───────────────────────────────────────────────────────────────┐
│              Persistent Storage & Session Layer               │
│  - MongoDB (Users, Transcripts, Datasets, Experiments, Evals) │
│  - Embedded JSON/SQLite Hybrid Fallback (Zero-setup Guest)   │
│  - Local Artifacts & Checkpoint Storage (WAV, Models, Reports)│
└───────────────────────────────────────────────────────────────┘
```

---

## 2. Component Design & Directory Structure

```
SpeechSense-AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py              # User authentication, JWT, profile
│   │   │   ├── transcribe.py        # File upload, mic recording, chunk inference
│   │   │   ├── audio.py             # Preprocessing & audio feature inspection
│   │   │   ├── history.py           # User transcription history CRUD & search
│   │   │   ├── datasets.py          # TORGO, UA-Speech, custom dataset management
│   │   │   ├── research.py          # Acoustic features, PCA, t-SNE, Reality Gap
│   │   │   ├── training.py          # Multi-stage Seq2Seq fine-tuning & checkpoints
│   │   │   ├── evaluation.py        # WER, CER, error breakdown & comparisons
│   │   │   ├── reports.py           # PDF and DOCX automated report generation
│   │   │   └── system.py            # Real-time hardware telemetry (CPU, RAM, GPU)
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic Settings, environment variables
│   │   │   └── security.py          # Password hashing (bcrypt) & JWT token handling
│   │   ├── database/
│   │   │   ├── connection.py        # MongoDB connection with persistent JSON fallback
│   │   │   └── repositories.py      # Abstract repository for all entity collections
│   │   ├── schemas/                 # Pydantic models for request/response payloads
│   │   ├── services/                # Business logic adapters
│   │   └── main.py                  # FastAPI application entrypoint with CORS & routes
│   │
│   ├── ml/
│   │   ├── acoustic_analysis/
│   │   │   └── extractor.py         # 18 acoustic parameters (F0, HNR, Jitter, Formants)
│   │   ├── preprocessing/
│   │   │   └── pipeline.py          # Resampling, mono, normalization, silence trimming
│   │   ├── transcription/
│   │   │   ├── whisper_engine.py    # Offline Whisper loader, inference, chunking
│   │   │   └── live_stream.py       # Sliding-window near-real-time chunk transcription
│   │   ├── evaluation/
│   │   │   └── metrics.py           # JiWER-based exact WER, CER, and Levenshtein details
│   │   ├── visualization/
│   │   │   ├── pca_engine.py        # Scikit-learn PCA dimensionality reduction
│   │   │   └── tsne_engine.py       # Scikit-learn t-SNE manifold learning
│   │   ├── training/
│   │   │   └── finetuner.py         # Seq2Seq Whisper fine-tuning trainer
│   │   └── augmentation/
│   │       └── synthesizer.py       # Dysarthric acoustic perturbation & synthetic adapter
│   ├── storage/                     # Local storage for audio files, plots, exports
│   ├── tests/                       # Unit and integration test suite
│   └── requirements.txt             # Locked Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/              # Navbar, Sidebar, Footer, Modal, Toast, StatsCard
│   │   │   ├── audio/               # WaveformVisualizer, AudioPlayer, MicRecorder
│   │   │   ├── research/            # AcousticRadar, PCAPlot, TSNEPlot, MetricTable
│   │   │   └── editor/              # RichTranscriptEditor, FindReplace, ExportMenu
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Authentication & guest demonstration state
│   │   │   └── ThemeContext.jsx     # Dark / light theme toggle
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx        # Sidebar navigation & header layout
│   │   ├── pages/                   # All 25 dedicated pages matching specifications
│   │   ├── services/                # Axios API clients for all backend endpoints
│   │   ├── utils/                   # Formatting helpers, time calculations
│   │   ├── App.jsx                  # React Router 6 route declarations
│   │   └── index.css                # Tailwind CSS imports & custom animations
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── datasets/                        # Standardized research sample audio & annotations
├── experiments/                     # Experiment manifests, logs, checkpoints
├── reports/                         # Generated PDF/DOCX research reports
└── docs/                            # Research & technical documentation
```

---

## 3. Database Schema Specification

Entities persist to MongoDB with graceful zero-setup local persistent fallback if a remote MongoDB instance is not configured:

1. **users**: `_id`, `user_id`, `name`, `email`, `password_hash`, `role`, `created_at`
2. **transcriptions**: `_id`, `transcription_id`, `user_id`, `filename`, `audio_path`, `duration`, `sample_rate`, `model_name`, `language`, `original_transcript`, `edited_transcript`, `confidence_avg`, `segments`, `processing_time_sec`, `created_at`
3. **acoustic_profiles**: `_id`, `audio_id`, `user_id`, `features` (18 metrics: F0, HNR, Jitter, Shimmer, Formants F1/F2, Formant Dispersion, Spectral Centroid, Bandwidth, Roll-off, Tilt, RMS, ZCR, etc.), `speech_category` ('healthy', 'dysarthric_spastic', 'dysarthric_ataxic', 'synthetic'), `created_at`
4. **datasets**: `_id`, `dataset_id`, `name`, `description`, `source_type` ('TORGO', 'UA-Speech', 'Synthetic', 'Custom'), `sample_count`, `total_duration_sec`, `speaker_count`, `splits`, `created_at`
5. **experiments**: `_id`, `experiment_id`, `name`, `model_name`, `dataset_name`, `training_config` (epochs, lr, batch_size, warmup_steps), `metrics` (train_loss, val_loss, wer, cer), `checkpoint_path`, `status`, `created_at`
6. **evaluations**: `_id`, `evaluation_id`, `user_id`, `model_name`, `dataset_type`, `sample_name`, `reference_text`, `hypothesis_text`, `wer`, `cer`, `substitutions`, `deletions`, `insertions`, `processing_time_sec`, `created_at`
