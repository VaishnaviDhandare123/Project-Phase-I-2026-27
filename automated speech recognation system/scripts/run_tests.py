import sys
from pathlib import Path
root_dir = str(Path(__file__).resolve().parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

import traceback
from backend.tests import test_pipeline as t

out_file = Path(root_dir) / "test_output.txt"

def log(msg):
    with open(out_file, "a", encoding="utf-8") as f:
        f.write(msg + "\n")
    print(msg, flush=True)

def run():
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("Starting test suite...\n")

    tests = [
        ("Auth & Security", t.test_auth_security),
        ("Database Repositories", t.test_database_repositories),
        ("Audio Preprocessing", t.test_audio_preprocessing),
        ("Acoustic Feature Extraction", t.test_acoustic_feature_extraction),
        ("JiWER Metrics", t.test_evaluation_metrics_jiwer),
        ("PCA & t-SNE", t.test_pca_and_tsne),
        ("Whisper ASR Inference", t.test_whisper_transcription),
        ("Report Generation", lambda: t.test_report_generation(Path(root_dir) / "backend" / "storage"))
    ]

    passed = 0
    for name, fn in tests:
        try:
            log(f"Running {name}...")
            fn()
            log(f"-> {name} PASSED!")
            passed += 1
        except Exception as e:
            log(f"-> {name} FAILED: {e}")
            with open(out_file, "a", encoding="utf-8") as f:
                traceback.print_exc(file=f)

    log(f"\nFINAL RESULT: {passed}/{len(tests)} tests passed!")

if __name__ == "__main__":
    run()
