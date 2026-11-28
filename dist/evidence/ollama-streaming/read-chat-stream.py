#!/usr/bin/env python3
"""Read one completed, text-only Ollama chat response from a saved stream."""

import argparse
import json
from pathlib import Path


def record(payload):
    value = json.loads(payload)
    if not isinstance(value, dict):
        raise ValueError("Expected a JSON object.")
    if "error" in value:
        raise ValueError(f"Stream error: {value['error']}")
    return value


def append_text(parts, content):
    if content is not None:
        if not isinstance(content, str):
            raise ValueError("Expected text content.")
        parts.append(content)


def require_stop(reason):
    if reason != "stop":
        raise ValueError(f"Generation did not stop normally: {reason}.")


def native_chat(lines):
    parts = []
    for line in lines:
        if not line.strip():
            continue
        frame = record(line)
        append_text(parts, frame.get("message", {}).get("content"))
        if frame.get("done") is True:
            require_stop(frame.get("done_reason"))
            return "".join(parts)
    raise ValueError("Stream ended before done: true.")


def sse_payloads(lines):
    fields = []
    for line in lines:
        line = line.rstrip("\r\n")
        if line == "":
            if fields:
                yield "\n".join(fields)
                fields.clear()
            continue
        name, _, field = line.partition(":")
        if name == "data":
            fields.append(field.removeprefix(" "))


def compatible_chat(lines):
    parts = []
    reason = None
    for payload in sse_payloads(lines):
        if payload == "[DONE]":
            if reason is None:
                raise ValueError("The [DONE] event arrived without a finish reason.")
            require_stop(reason)
            return "".join(parts)
        for choice in record(payload).get("choices", []):
            if choice.get("index") != 0:
                raise ValueError("The example expects exactly one chat choice.")
            append_text(parts, choice.get("delta", {}).get("content"))
            if choice.get("finish_reason") is not None:
                reason = choice["finish_reason"]
    raise ValueError("Stream ended before the [DONE] event.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=["native", "compatible"])
    parser.add_argument("file", type=Path)
    args = parser.parse_args()
    read = native_chat if args.mode == "native" else compatible_chat
    try:
        with args.file.open(encoding="utf-8-sig") as stream:
            output = read(stream)
    except (OSError, ValueError, AttributeError, TypeError) as error:
        parser.exit(1, f"{error}\n")
    print(output)


if __name__ == "__main__":
    main()
