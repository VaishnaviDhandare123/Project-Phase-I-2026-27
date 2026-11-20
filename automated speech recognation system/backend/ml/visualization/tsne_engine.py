from typing import Any, Dict, List, Optional
import numpy as np
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
from backend.ml.visualization.pca_engine import PCAEngine

class TSNEEngine:
    """t-Distributed Stochastic Neighbor Embedding for acoustic manifold visualization."""

    @classmethod
    def fit_transform(
        cls,
        samples: List[Dict[str, Any]],
        selected_features: Optional[List[str]] = None,
        perplexity: float = 5.0,
        random_state: int = 42
    ) -> Dict[str, Any]:
        """
        Non-linear 2D projection revealing cluster divergence between
        natural healthy, real dysarthric, and synthetic dysarthric speech.
        """
        features_to_use = selected_features or PCAEngine.DEFAULT_FEATURE_KEYS

        if len(samples) < 4:
            return {
                "error": "At least 4 acoustic samples are required to run t-SNE manifold learning.",
                "points": [],
                "perplexity_used": perplexity,
                "warning": "Sample count too low for stable manifold estimation."
            }

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
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_mat)

        # Ensure perplexity does not exceed n_samples - 1
        safe_perplexity = min(float(perplexity), max(1.0, float(len(samples) - 1)))

        tsne = TSNE(
            n_components=2,
            perplexity=safe_perplexity,
            random_state=random_state,
            max_iter=1000,
            init="pca" if len(samples) >= 10 else "random"
        )
        X_tsne = tsne.fit_transform(X_scaled)

        points = []
        for i in range(len(samples)):
            points.append({
                "x": round(float(X_tsne[i, 0]), 3),
                "y": round(float(X_tsne[i, 1]), 3),
                "id": metadata_list[i]["id"],
                "label": metadata_list[i]["label"],
                "category": metadata_list[i]["category"],
                "speaker": metadata_list[i]["speaker"]
            })

        # Calculate cluster centers per category
        clusters = {}
        for pt in points:
            cat = pt["category"]
            clusters.setdefault(cat, []).append([pt["x"], pt["y"]])

        cluster_centers = {
            cat: {
                "center_x": round(float(np.mean([p[0] for p in coords])), 2),
                "center_y": round(float(np.mean([p[1] for p in coords])), 2),
                "count": len(coords)
            }
            for cat, coords in clusters.items()
        }

        warning = None
        if len(samples) < 15:
            warning = "Dataset contains fewer than 15 samples. t-SNE is an exploratory tool; interpret cluster distances cautiously."

        return {
            "points": points,
            "cluster_centers": cluster_centers,
            "perplexity_used": safe_perplexity,
            "sample_count": len(samples),
            "warning": warning,
            "features_used": features_to_use
        }
