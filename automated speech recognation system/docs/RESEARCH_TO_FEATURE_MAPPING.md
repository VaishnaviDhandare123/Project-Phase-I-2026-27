# SpeechSense AI: Research-to-Feature Mapping & Scientific Foundation

## 1. Executive Summary
**SpeechSense AI** ("Transforming Human Speech into Intelligent, Accessible and Analyzable Text") is an enterprise-grade, research-oriented Automatic Speech Recognition (ASR) and Acoustic Analysis platform. It bridges standard consumer speech-to-text workflows with deep-learning research methodologies, specifically addressing low-resource, atypical, and dysarthric speech recognition based on contemporary ASR literature and the landmark IEEE Access paper:
> *"Bridging the Reality Gap in ASR for Low-Resource Dysarthric Speech: Evaluating Performance on Synthetic and Real Data"*

---

## 2. Research-to-Feature Mapping Matrix

| Category | Component / Feature | Origin / Source | Theoretical Justification & Technical Implementation |
|---|---|---|---|
| **Audio Processing** | Audio Resampling (16 kHz) & Stereo-to-Mono | Abstract & IEEE Paper | Whisper encoder requires 16,000 Hz single-channel log-mel spectrogram representations with 80 bins and 25ms windows. Implemented via `librosa.resample` and `soundfile`. |
| **Audio Processing** | Peak & RMS Normalization | Abstract & IEEE Paper | Balances inter-speaker and microphone gain variations; dysarthric speech displays high intra-speaker volume variance. Implemented via `librosa.util.normalize`. |
| **Audio Processing** | Voice Activity Detection (VAD) & Silence Trimming | Abstract | Trims non-speech intervals to reduce inference hallucination and improve latency. Uses energy-based top-dB thresholding. |
| **Audio Processing** | Noise Reduction & Signal-to-Noise Profiling | Abstract & IEEE Paper | Preserves subtle acoustic articulatory cues while suppressing ambient interference without synthetic artifacts. |
| **ASR Core** | Transformer-based Whisper Architecture | Abstract & IEEE Paper | Sequence-to-sequence Encoder-Decoder Transformer with sinusoidal positional embeddings and multi-head cross-attention. |
| **ASR Core** | Multi-Scale Model Support (Tiny, Base, Small, Medium) | Abstract & Practical Resource Constraint | Whisper-tiny (39M parameters) for lightweight local CPU inference; Base/Small for GPU/high-resource environments. |
| **ASR Core** | Decoding Parameter Configuration | IEEE Paper & ASR Standards | Configurable temperature sampling (0.0 to 1.0), beam search width, length penalty, and language selection. |
| **ASR Core** | Chunk-Based Overlap Inference | Abstract | Long-form and near-real-time streaming simulation using sliding chunk buffers with 1.0s overlap to prevent word boundary loss. |
| **Acoustic Analysis** | Fundamental Frequency ($F_0$) & Pitch Distribution | IEEE Paper | Extracted using Yin / Pyin algorithm to evaluate monotone pitch and phonatory instability characteristic of dysarthria. |
| **Acoustic Analysis** | Harmonics-to-Noise Ratio (HNR) | IEEE Paper | Measures breathiness and vocal turbulence resulting from incomplete vocal fold closure. |
| **Acoustic Analysis** | Local Jitter & Shimmer | IEEE Paper | Perturbation metrics measuring cycle-to-cycle frequency and amplitude instability in vocal fold vibration. |
| **Acoustic Analysis** | Formants ($F_1, F_2$) & Formant Dispersion | IEEE Paper | Linear Predictive Coding (LPC) formant tracking; reveals vowel space centralization common in spastic/ataxic dysarthria. |
| **Acoustic Analysis** | Spectral Centroid, Bandwidth, Roll-off & Flux | IEEE Paper | High-frequency acoustic energy distribution quantifying hypernasality and articulatory imprecision. |
| **Acoustic Analysis** | RMS Energy & Zero-Crossing Rate (ZCR) | Abstract & IEEE Paper | Dynamic range and voicing distinction across acoustic segments. |
| **Visualization** | Principal Component Analysis (PCA) | IEEE Paper | Standardized dimensionality reduction on 18 acoustic features; projects natural vs. synthetic speech distributions onto 2D eigenspace with explained variance ratios. |
| **Visualization** | t-SNE Manifold Learning | IEEE Paper | Non-linear dimensionality reduction ($t$-Distributed Stochastic Neighbor Embedding) exposing cluster divergence between healthy, real dysarthric, and synthetic speech. |
| **Evaluation** | Word Error Rate (WER) & Character Error Rate (CER) | Abstract & IEEE Paper | Standard Levenshtein distance formulation: $\text{WER} = \frac{S + D + I}{N}$; non-capped, normalized string evaluation via `jiwer`. |
| **Research Domain** | Real vs. Synthetic Speech Reality Gap Analysis | IEEE Paper | Direct empirical comparison of acoustic feature distance and ASR performance gap between human speech and synthetic generative speech. |
| **Research Domain** | Multi-Stage Fine-Tuning Pipeline | IEEE Paper | Seq2Seq trainer configurations for: 1) Pretrained Whisper, 2) Natural Dysarthric Speech, 3) Synthetic Speech, 4) Joint Hybrid Datasets. |
| **Research Domain** | Dataset Adapters (TORGO, UA-Speech, Custom) | IEEE Paper | Standardized schema converting disparate research corpora into unified metadata formats with speaker intelligibility and severity grading. |
| **Application Feature** | Full Transcript Interactive Editor | System Requirement | Rich editing with undo/redo, search & replace, word/char counters, side-by-side original AI vs user-corrected view. |
| **Application Feature** | Multi-Format Transcript Export (TXT, PDF, DOCX, JSON, SRT) | System Requirement | Automated timestamp generation, document styling, and subtitle formatting. |
| **Application Feature** | Real-Time Hardware Resource Monitor | Resource Constraint Specification | Real-time monitoring of CPU %, RAM MB, GPU availability, and model inference latency using `psutil` and `torch`. |
| **Application Feature** | Research Experiment Report Generator | System Requirement | Automated generation of publication-ready PDF and DOCX laboratory reports summarizing parameters, acoustic metrics, WER/CER tables, and figures. |
| **Application Feature** | JWT User Authentication & Demonstration Guest Mode | System Requirement | Role-based private user storage with instant guest demonstration mode for university laboratory presentations. |

---

## 3. Reality Gap in Dysarthric Speech Recognition

Dysarthria represents a group of neuro-motor speech disorders resulting from neurological injury (cerebral palsy, ALS, stroke, Parkinson's disease). Traditional ASR models trained on healthy conversational corpora (e.g., LibriSpeech, CommonVoice) suffer extreme degradation when presented with dysarthric speech, often yielding WERs exceeding 60-80%.

The landmark IEEE Access paper studied bridging this reality gap by:
1. Synthesizing dysarthric speech via modern neural TTS and Voice Conversion (VC).
2. Quantifying the acoustic discrepancies (pitch contour rigidity, formant centralization, temporal mismatch) between natural dysarthric speech and synthetic approximations.
3. Conducting multi-stage transfer learning where models fine-tuned on synthetic data are adapted to real low-resource dysarthric corpora (e.g. TORGO and UA-Speech).

SpeechSense AI encapsulates this complete scientific lifecycle in an accessible, interactive, and academically rigorous platform.
