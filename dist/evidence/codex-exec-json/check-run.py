"""Extract and check the final reply from one Codex exec JSONL transcript."""
import argparse
import json
from pathlib import Path


def checked_reply(path, process_status):
    if process_status != 0:
        raise ValueError(f"Codex exited with status {process_status}")
    thread_id = None
    turns_started = 0
    turns_completed = 0
    message = None
    with path.open(encoding="utf-8") as source:
        for line_number, line in enumerate(source, 1):
            try:
                event = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"invalid JSON on line {line_number}") from exc
            if not isinstance(event, dict):
                raise ValueError(f"expected an event object on line {line_number}")
            event_type = event.get("type")
            if event_type == "thread.started":
                if thread_id is not None:
                    raise ValueError("expected a transcript for one thread")
                thread_id = event.get("thread_id")
            elif event_type == "turn.started":
                turns_started += 1
            elif event_type == "turn.completed":
                turns_completed += 1
            elif event_type == "turn.failed":
                raise ValueError("Codex reported turn.failed")
            elif event_type == "item.completed":
                item = event.get("item")
                if isinstance(item, dict) and item.get("type") == "agent_message":
                    message = item.get("text")
    if not isinstance(thread_id, str) or not thread_id or turns_started != 1 or turns_completed != 1:
        raise ValueError("expected one started and completed turn with a thread ID")
    if not isinstance(message, str) or not message:
        raise ValueError("missing completed assistant message")
    return thread_id, message


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("events", type=Path)
    parser.add_argument("--exit-code", type=int, required=True, help="Original Codex process status")
    parser.add_argument("--check-example-schema", action="store_true")
    args = parser.parse_args()
    try:
        thread_id, message = checked_reply(args.events, args.exit_code)
        if args.check_example_schema:
            try:
                reply = json.loads(message)
            except json.JSONDecodeError as exc:
                raise ValueError("final reply is not valid JSON") from exc
            if not isinstance(reply, dict) or set(reply) != {"result"} or not isinstance(reply["result"], str):
                raise ValueError("expected a reply with exactly one string field named result")
        else:
            reply = message
    except (OSError, ValueError) as exc:
        parser.exit(1, f"{exc}\n")
    print(json.dumps({"thread_id": thread_id, "reply": reply}, ensure_ascii=False))


if __name__ == "__main__":
    main()
