from typing import Any, Dict, List, Optional
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

class PCAEngine:
    """Principal Component Analysis dimensionality reduction on multidimensional acoustic profiles."""

    DEFAULT_FEATURE_KEYS = [
        "f0_mean_hz",
        "pitch_iqr_hz",
        "hnr_db",
        "local_jitter_pct",
        "local_shimmer_db",
        "formant_f1_hz",
        "formant_f2_hz",
        "formant_dispersion_hz",
        "spectral_centroid_hz",
        "spectral_bandwidth_hz",
        "spectral_rolloff_hz",
        "speech_rate_syllables_per_sec",
        "zero_crossing_rate",
        "rms_energy"
    ]

    @classmethod
    def fit_transform(
        cls,
        samples: List[Dict[str, Any]],
        selected_features: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Takes list of acoustic feature dictionaries with category metadata.
        Returns 2D PCA projection coordinates, explained variance, and component loadings.
        """
        features_to_use = selected_features or cls.DEFAULT_FEATURE_KEYS

        if len(samples) < 3:
            return {
                "error": "At least 3 acoustic samples are required to compute a 2D PCA projection.",
                "points": [],
                "explained_variance_ratio": [0.0, 0.0],
                "cumulative_variance": 0.0
            }

        # Build feature matrix X
        X = []
        metadata_list = []
        for sample in samples:
            feat_dict = sample.get("features", sample)
            row = [float(feat_dict.get(k, 0.0)) for k in features_to_use]
            X.append(row)
            metadata_list.append({
                "id": sample.get("id", sample.get("sample_id", "sample")),
                "label": sample.get("label", sample.get("filename", "Audio Sample")),
                "category": sample.get("category", sample.get("speech_category", "healthy")),
                "speaker": sample.get("speaker", "Unknown")
            })

        X_mat = np.array(X, dtype=np.float32)

        # Standardize features (mean=0, variance=1)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_mat)

        # 2-Component PCA
        pca = PCA(n_components=2, random_state=42)
        X_pca = pca.fit_transform(X_scaled)

        var_ratio = [round(float(v), 4) for v in pca.explained_variance_ratio_]
        cumulative_var = round(float(np.sum(pca.explained_variance_ratio_)), 4)

        # Build 2D point array for visualization
        points = []
        for i in range(len(samples)):
            points.append({
                "x": round(float(X_pca[i, 0]), 3),
                "y": round(float(X_pca[i, 1]), 3),
                "id": metadata_list[i]["id"],
                "label": metadata_list[i]["label"],
                "category": metadata_list[i]["category"],
                "speaker": metadata_list[i]["speaker"]
            })

        # Feature loadings for PC1 and PC2 (contribution to each component)
        loadings = []
        for idx, feat_name in enumerate(features_to_use):
            loadings.append({
                "feature": feat_name,
                "pc1_loading": round(float(pca.components_[0, idx]), 3),
                "pc2_loading": round(float(pca.components_[1, idx]), 3)
            })

        return {
            "points": points,
            "explained_variance_ratio": var_ratio,
            "cumulative_variance": cumulative_var,
            "pc1_variance_pct": round(var_ratio[0] * 100.0, 1),
            "pc2_variance_pct": round(var_ratio[1] * 100.0, 1),
            "sample_count": len(samples),
            "loadings": loadings,
            "features_used": features_to_use
        }
