"""Inspect ordered edit rules in fresh V2 projects on macOS without provider calls."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile


def read_rules(binary, policy, root, name, rules):
    profile = root / name
    project = profile / "project"
    project.mkdir(parents=True)
    subprocess.run(["git", "init", "-q", str(project)], check=True)
    config = {"permissions": rules}
    (project / "opencode.json").write_text(json.dumps(config), encoding="utf-8")
    env = {"PATH": os.environ["PATH"], "HOME": str(profile), "OPENCODE_DISABLE_AUTOUPDATE": "true"}
    for kind in ("CONFIG", "DATA", "CACHE", "STATE", "RUNTIME"):
        env[f"XDG_{kind}_HOME"] = str(profile / kind.lower())
    output = subprocess.check_output(
        ["sandbox-exec", "-f", str(policy), str(binary), "debug", "agents", "--standalone"],
        text=True, cwd=project, env=env, timeout=30,
    )
    build = next(agent for agent in json.loads(output) if agent.get("id") == "build")
    configured = [rule for rule in build["permissions"] if rule in rules]
    if configured != rules:
        raise ValueError(f"{name}: debug output did not retain the configured rule order")
    return {"case": name, "config": config, "debug_build_edit_rules": configured}


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python3 check-rule-order.py OPENCode_V2_BINARY LOOPBACK_ONLY_POLICY")
    binary, policy = (Path(value).resolve(strict=True) for value in sys.argv[1:])
    broad = {"action": "edit", "resource": "*", "effect": "ask"}
    specific = {"action": "edit", "resource": "notes.txt", "effect": "deny"}
    with tempfile.TemporaryDirectory(prefix="opencode-rule-order-") as directory:
        root = Path(directory).resolve()
        version = subprocess.check_output(
            ["sandbox-exec", "-f", str(policy), str(binary), "--version"],
            text=True, cwd=root, env={"PATH": os.environ["PATH"], "HOME": str(root)},
            timeout=15,
        ).strip()
        observations = [
            read_rules(binary, policy, root, "specific-last", [broad, specific]),
            read_rules(binary, policy, root, "broad-last", [specific, broad]),
        ]
    print(json.dumps({
        "version": version,
        "command": "opencode debug agents --standalone",
        "scope": "Local configuration and built-in Build agent rule ordering; no model turns, approval replies or file edit actions.",
        "observations": observations,
    }, indent=2))


if __name__ == "__main__":
    main()
