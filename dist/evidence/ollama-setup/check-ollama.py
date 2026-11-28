"""Check a loopback Ollama server using Python's standard library."""
import argparse
import json
from math import isfinite
from urllib import error, request

OPENER = request.build_opener(request.ProxyHandler({}))


def call(port, endpoint, payload=None):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = request.Request(
        f"http://127.0.0.1:{port}{endpoint}",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    try:
        with OPENER.open(req, timeout=45 if data else 5) as response:
            return json.load(response)
    except error.HTTPError as exc:
        raise ValueError(f"{endpoint}: HTTP {exc.code}") from exc
    except (OSError, ValueError) as exc:
        raise ValueError(f"{endpoint}: {exc}") from exc


def require_object(value):
    if not isinstance(value, dict):
        raise ValueError("expected a JSON object")
    return value


def model_ids(response, list_key, item_key):
    rows = require_object(response).get(list_key)
    if not isinstance(rows, list):
        raise ValueError(f"expected a {list_key} array")
    return [row[item_key] for row in rows if isinstance(row, dict) and isinstance(row.get(item_key), str)]


def check(port, chat_model, embedding_model):
    results = {}

    def read(name, operation):
        try:
            value = operation()
        except ValueError as exc:
            results[name] = {"ok": False, "error": str(exc)}
            return None
        results[name] = {"ok": True, "value": value}
        return value

    def version():
        value = require_object(call(port, "/api/version")).get("version")
        if not isinstance(value, str) or not value:
            raise ValueError("missing Ollama version")
        return value

    if read("server_version", version) is None:
        return results
    tags = read("native_model_tags", lambda: model_ids(call(port, "/api/tags"), "models", "name"))
    read("openai_compatible_model_ids", lambda: model_ids(call(port, "/v1/models"), "data", "id"))

    def installed(tag):
        if tags is None or tag not in tags:
            raise ValueError(f"exact tag not listed by /api/tags: {tag}")

    def chat():
        installed(chat_model)
        value = require_object(call(port, "/api/chat", {
            "model": chat_model,
            "messages": [{"role": "user", "content": "Reply with exactly LOCAL_OK and nothing else."}],
            "stream": False,
            "options": {"num_predict": 24, "temperature": 0},
            "keep_alive": "60s",
        }))
        content = require_object(value.get("message")).get("content")
        if value.get("done") is not True or not isinstance(content, str) or not content.strip():
            raise ValueError("chat did not finish with nonempty assistant text")
        return {"reply": content, "exact_probe_match": content.strip() == "LOCAL_OK"}

    def embeddings():
        installed(embedding_model)
        value = require_object(call(port, "/api/embed", {
            "model": embedding_model,
            "input": ["This is the first synthetic note.", "This is the second synthetic note."],
            "truncate": False,
        })).get("embeddings")
        if not isinstance(value, list) or len(value) != 2:
            raise ValueError("expected two embedding vectors")
        for vector in value:
            if not isinstance(vector, list) or not vector or any(
                type(x) not in (int, float) or not isfinite(x) for x in vector
            ):
                raise ValueError("expected nonempty vectors of finite numbers")
        if len(value[0]) != len(value[1]):
            raise ValueError("vectors have different dimensions")
        return {"vectors": 2, "dimensions": len(value[0])}

    if chat_model:
        read("native_chat", chat)
    if embedding_model:
        read("native_embeddings", embeddings)
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=11434)
    parser.add_argument("--chat-model", help="Exact installed tag, as shown by ollama list")
    parser.add_argument("--embedding-model", help="Exact installed tag, as shown by ollama list")
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("port must be between 1 and 65535")
    results = check(args.port, args.chat_model, args.embedding_model)
    print(json.dumps(results, indent=2, ensure_ascii=False))
    raise SystemExit(0 if all(row["ok"] for row in results.values()) else 1)


if __name__ == "__main__":
    main()
