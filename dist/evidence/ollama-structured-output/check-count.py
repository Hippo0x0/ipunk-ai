#!/usr/bin/env python3
"""Read an Ollama response for the guide's one-field count example."""

import argparse
import json
from pathlib import Path


def unique_object(pairs):
    obj = dict(pairs)
    if len(obj) != len(pairs):
        raise ValueError("Response contains duplicate JSON keys.")
    return obj


def parse_count(response):
    if "choices" in response:
        choice = response["choices"][0]
        reason = choice["finish_reason"]
        message = choice["message"]
    else:
        if response["done"] is not True:
            raise ValueError("Native response is incomplete.")
        reason = response["done_reason"]
        message = response["message"]

    if reason != "stop":
        raise ValueError(f"Generation did not stop normally: {reason}.")
    value = json.loads(message["content"], object_pairs_hook=unique_object)
    if type(value) is not dict or set(value) != {"count"} or type(value["count"]) is not int:
        raise ValueError("Expected exactly one field, count, with an integer value.")
    return value


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("response", type=Path, help="One non-streaming response saved as JSON")
    parser.add_argument("--expected", type=int, help="Optional, known count for a test input")
    args = parser.parse_args()
    try:
        with args.response.open(encoding="utf-8") as file:
            response = json.load(file, object_pairs_hook=unique_object)
        value = parse_count(response)
        if args.expected is not None and value["count"] != args.expected:
            raise ValueError("The output matched the shape but the count differed.")
    except (OSError, ValueError, KeyError, IndexError, TypeError) as error:
        parser.exit(1, f"{error}\n")
    print(json.dumps(value))


if __name__ == "__main__":
    main()
