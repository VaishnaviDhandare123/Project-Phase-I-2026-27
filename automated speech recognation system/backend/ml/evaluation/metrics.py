import re
import string
from typing import Any, Dict, List, Optional
import jiwer

class EvaluationMetricsEngine:
    """
    Standardized ASR evaluation engine computing exact Word Error Rate (WER)
    and Character Error Rate (CER) via JiWER.
    """

    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Normalize text for consistent academic evaluation:
        Lowercases, removes punctuation, normalizes multiple whitespace.
        """
        if not text:
            return ""
        text = text.lower()
        # Remove punctuation
        text = re.sub(r"[^\w\s]", "", text)
        # Collapse multiple spaces
        text = re.sub(r"\s+", " ", text).strip()
        return text

    @classmethod
    def compute_evaluation(
        cls,
        reference: str,
        hypothesis: str,
        apply_normalization: bool = True
    ) -> Dict[str, Any]:
        """
        Compute WER, CER, and detailed Levenshtein edit distance components.
        """
        ref_eval = cls.normalize_text(reference) if apply_normalization else reference.strip()
        hyp_eval = cls.normalize_text(hypothesis) if apply_normalization else hypothesis.strip()

        if not ref_eval:
            # Handle empty reference
            if not hyp_eval:
                return {
                    "wer": 0.0,
                    "cer": 0.0,
                    "wer_percentage": 0.0,
                    "cer_percentage": 0.0,
                    "substitutions": 0,
                    "deletions": 0,
                    "insertions": 0,
                    "hits": 0,
                    "reference_words": 0,
                    "hypothesis_words": 0,
                    "reference_chars": 0,
                    "hypothesis_chars": 0,
                    "alignment_summary": "Empty reference and hypothesis."
                }
            hyp_words = len(hyp_eval.split())
            hyp_chars = len(hyp_eval)
            return {
                "wer": 1.0,
                "cer": 1.0,
                "wer_percentage": 100.0,
                "cer_percentage": 100.0,
                "substitutions": 0,
                "deletions": 0,
                "insertions": hyp_words,
                "hits": 0,
                "reference_words": 0,
                "hypothesis_words": hyp_words,
                "reference_chars": 0,
                "hypothesis_chars": hyp_chars,
                "alignment_summary": f"Reference is empty; {hyp_words} insertions."
            }

        # Compute word-level Levenshtein metrics via jiwer
        word_output = jiwer.process_words(ref_eval, hyp_eval)
        raw_wer = word_output.wer
        substitutions = word_output.substitutions
        deletions = word_output.deletions
        insertions = word_output.insertions
        hits = word_output.hits

        # Character Error Rate
        raw_cer = jiwer.cer(ref_eval, hyp_eval)

        ref_words = ref_eval.split()
        hyp_words = hyp_eval.split()

        return {
            "wer": round(float(raw_wer), 4),
            "cer": round(float(raw_cer), 4),
            "wer_percentage": round(float(raw_wer * 100.0), 2),
            "cer_percentage": round(float(raw_cer * 100.0), 2),
            "substitutions": int(substitutions),
            "deletions": int(deletions),
            "insertions": int(insertions),
            "hits": int(hits),
            "reference_words": len(ref_words),
            "hypothesis_words": len(hyp_words),
            "reference_chars": len(ref_eval),
            "hypothesis_chars": len(hyp_eval),
            "normalized_reference": ref_eval,
            "normalized_hypothesis": hyp_eval
        }

    @classmethod
    def evaluate_batch(
        cls,
        samples: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Evaluate a batch of samples (e.g. from testing dataset split).
        Each item has {"reference": str, "hypothesis": str, "id": str}.
        """
        total_sub = 0
        total_del = 0
        total_ins = 0
        total_ref_words = 0
        sample_results = []

        all_refs = []
        all_hyps = []

        for sample in samples:
            res = cls.compute_evaluation(sample.get("reference", ""), sample.get("hypothesis", ""))
            total_sub += res["substitutions"]
            total_del += res["deletions"]
            total_ins += res["insertions"]
            total_ref_words += res["reference_words"]
            sample_results.append({
                "id": sample.get("id"),
                "reference": sample.get("reference"),
                "hypothesis": sample.get("hypothesis"),
                **res
            })
            all_refs.append(cls.normalize_text(sample.get("reference", "")))
            all_hyps.append(cls.normalize_text(sample.get("hypothesis", "")))

        # Corpus-level macro and micro WER
        corpus_wer = jiwer.wer(all_refs, all_hyps) if all_refs else 0.0
        corpus_cer = jiwer.cer(all_refs, all_hyps) if all_refs else 0.0

        return {
            "corpus_wer": round(float(corpus_wer), 4),
            "corpus_cer": round(float(corpus_cer), 4),
            "corpus_wer_percentage": round(float(corpus_wer * 100.0), 2),
            "corpus_cer_percentage": round(float(corpus_cer * 100.0), 2),
            "total_substitutions": total_sub,
            "total_deletions": total_del,
            "total_insertions": total_ins,
            "total_words": total_ref_words,
            "sample_count": len(samples),
            "samples": sample_results
        }
