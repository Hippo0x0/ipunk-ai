"""Rank the included synthetic support notes with Ollama running on this machine."""
import argparse
import json
from math import dist, fsum, isfinite
from pathlib import Path
from urllib import error, request


MODEL = "nomic-embed-text:v1.5"
FIXTURE = Path(__file__).with_name("support-pages.json")


def embed_batch(port, model, texts):
    payload = {"model": model, "input": texts, "truncate": False}
    req = request.Request(
        f"http://127.0.0.1:{port}/api/embed",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    # Keep local requests off any inherited HTTP proxy.
    opener = request.build_opener(request.ProxyHandler({}))
    try:
        with opener.open(req, timeout=60) as response:
            vectors = json.load(response).get("embeddings")
    except error.HTTPError as exc:
        raise SystemExit(f"Ollama HTTP {exc.code}: {exc.read().decode('utf-8', errors='replace')}") from exc
    except error.URLError as exc:
        raise SystemExit(f"Cannot reach Ollama on 127.0.0.1:{port}: {exc.reason}") from exc
    if not isinstance(vectors, list) or len(vectors) != len(texts):
        raise SystemExit("Expected one vector in embeddings for every input string.")
    for vector in vectors:
        if not isinstance(vector, list) or not vector:
            raise SystemExit("Ollama returned an empty or invalid vector.")
        if any(type(value) not in (float, int) or not isfinite(value) for value in vector):
            raise SystemExit("Every embedding coordinate must be finite and numeric.")
        if len(vector) != len(vectors[0]) or not any(vector):
            raise SystemExit("Embeddings must share one dimension and have nonzero length.")
    return vectors


def cosine(left, right):
    norm_left = dist(left, [0] * len(left))
    norm_right = dist(right, [0] * len(right))
    return fsum(a * b for a, b in zip(left, right, strict=True)) / (norm_left * norm_right)


def rank(query, candidates):
    scored = [
        {"page": page["page"], "source": page["source"], "cosine": cosine(query, vector)}
        for page, vector in candidates
    ]
    return sorted(scored, key=lambda row: -row["cosine"])


def run(port, model, include_vectors):
    data = json.loads(FIXTURE.read_text(encoding="utf-8"))
    pages, queries = data["pages"], data["queries"]
    texts = [f"search_document: {page['text']}" for page in pages]
    texts += [f"search_query: {query['text']}" for query in queries]
    vectors = embed_batch(port, model, texts)
    documents = list(zip(pages, vectors[:len(pages)], strict=True))
    without_ocr = [item for item in documents if item[0]["source"] == "markitdown"]
    results = {
        "endpoint": "/api/embed",
        "model": model,
        "vectors": len(vectors),
        "dimensions": len(vectors[0]),
        "truncate": False,
        "comparisons": [
            {"query": query, "markitdown_only": rank(vector, without_ocr), "with_ocr": rank(vector, documents)}
            for query, vector in zip(queries, vectors[len(pages):], strict=True)
        ],
    }
    if include_vectors:
        results["vector_inputs"] = texts
        results["response_embeddings"] = vectors
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=11434, help="Port of your local Ollama server.")
    parser.add_argument("--model", default=MODEL, help="Exact locally installed Nomic Embed Text v1.5 tag.")
    parser.add_argument("--vectors", action="store_true", help="Include the exact input strings and returned vectors.")
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("Port must be between 1 and 65535.")
    print(json.dumps(run(args.port, args.model, args.vectors), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
