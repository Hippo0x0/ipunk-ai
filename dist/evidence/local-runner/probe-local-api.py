#!/usr/bin/env python3
"""Probe a user-selected loopback OpenAI-compatible API with a synthetic prompt."""
import argparse
import datetime
import json
import os
import re
import socket
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

PROMPT = 'Reply with exactly LOCAL_OK and nothing else.'
LIMIT = 1_000_000

def validate_base(value):
    try:
        parsed = urllib.parse.urlsplit(value)
        port = parsed.port
    except ValueError as error:
        raise ValueError('Use an explicit loopback host and port.') from error
    if (parsed.scheme not in ('http', 'https') or parsed.hostname not in ('127.0.0.1', '::1')
            or port is None or not 1 <= port <= 65535 or parsed.username is not None
            or parsed.password is not None or parsed.query or parsed.fragment
            or parsed.path.rstrip('/') != '/v1'):
        raise ValueError('Use http://127.0.0.1:PORT/v1 or an explicit IPv6 loopback equivalent; no credentials or query parameters.')
    return value.rstrip('/')

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def opener():
    # Do not route a local API key through a proxy or follow an external redirect.
    return urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())

def request(client, base, path, body, timeout, key):
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    if key:
        headers['Authorization'] = 'Bearer ' + key
    return client.open(urllib.request.Request(base + path, data=None if body is None else json.dumps(body).encode(), headers=headers), timeout=timeout)

def read_json(response):
    data = response.read(LIMIT + 1)
    if len(data) > LIMIT:
        raise ValueError('Response exceeds 1 MB.')
    return json.loads(data)

def parse_stream(response):
    text, finished, done, byte_count = [], None, False, 0
    for _ in range(10000):
        line = response.readline(LIMIT + 1)
        if not line:
            break
        byte_count += len(line)
        if byte_count > LIMIT:
            raise ValueError('Stream exceeds 1 MB.')
        if not line.startswith(b'data:'):
            continue
        payload = line[5:].strip()
        if payload == b'[DONE]':
            done = True
            break
        frame = json.loads(payload)
        if not isinstance(frame, dict) or 'error' in frame:
            raise ValueError('Invalid stream frame.')
        choices = frame.get('choices', [])
        if choices:
            choice = choices[0]
            delta = choice.get('delta', {}).get('content')
            if delta is not None:
                if not isinstance(delta, str):
                    raise ValueError('Invalid content delta.')
                text.append(delta)
            if choice.get('finish_reason') is not None:
                finished = str(choice['finish_reason'])[:80]
    content = ''.join(text)
    if len(content) > 10000:
        raise ValueError('Output exceeds 10000 characters.')
    return {'content': content, 'finish_reason': finished, 'done_marker': done,
            'protocol_completed': done and finished is not None,
            'prompt_followed': content.strip() == 'LOCAL_OK'}

def probe(base, model, label, timeout=30, key=''):
    base = validate_base(base)
    if not isinstance(model, str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_./:@+\-]{0,199}', model):
        raise ValueError('Use a model identifier of 1–200 supported characters.')
    if label not in ('ollama', 'lmstudio') or not 1 <= timeout <= 60:
        raise ValueError('Use a listed runtime label and a timeout from 1 to 60 seconds.')
    result = {'version': 1, 'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'runtime_label': label, 'base_url': base, 'model_requested': model,
              'prompt': PROMPT, 'status': 'incomplete',
              'qualification': 'Client-observed API behavior for this synthetic request; runtime label is supplied by the operator, not independently authenticated.'}
    client = opener()
    with request(client, base, '/models', None, timeout, key) as response:
        models = read_json(response)
    if not isinstance(models, dict) or not isinstance(models.get('data'), list):
        raise ValueError('Expected a model-list data array.')
    result['listed_model_ids'] = [str(item['id'])[:200] for item in models['data'][:100] if isinstance(item, dict) and 'id' in item]
    body = {'model': model, 'messages': [{'role': 'user', 'content': PROMPT}], 'temperature': 0, 'max_tokens': 32, 'stream': False}
    with request(client, base, '/chat/completions', body, timeout, key) as response:
        answer = read_json(response)
    if not isinstance(answer, dict) or not answer.get('choices'):
        raise ValueError('Expected a chat-completion choice.')
    choice = answer['choices'][0]
    content = choice.get('message', {}).get('content')
    if not isinstance(content, str) or len(content) > 10000:
        raise ValueError('Expected bounded message text.')
    result['non_stream'] = {'content': content, 'returned_model': str(answer.get('model', 'unknown'))[:200],
                            'finish_reason': str(choice.get('finish_reason', 'unknown'))[:80],
                            'prompt_followed': content.strip() == 'LOCAL_OK'}
    body['stream'] = True
    with request(client, base, '/chat/completions', body, timeout, key) as response:
        result['stream'] = parse_stream(response)
    result['status'] = 'completed' if result['stream']['protocol_completed'] else 'incomplete'
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', required=True)
    parser.add_argument('--model', required=True)
    parser.add_argument('--label', choices=['ollama', 'lmstudio'], required=True)
    parser.add_argument('--timeout', type=int, default=30)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    try:
        result = probe(args.base_url, args.model, args.label, args.timeout, os.environ.get('LOCAL_LLM_API_KEY', ''))
    except urllib.error.HTTPError as error:
        result = {'version': 1, 'runtime_label': args.label, 'status': 'error', 'error_code': f'HTTP_{error.code}'}
        error.close()
    except (ValueError, KeyError, TypeError, IndexError, UnicodeError, urllib.error.URLError, socket.timeout, TimeoutError):
        result = {'version': 1, 'runtime_label': args.label, 'status': 'error', 'error_code': 'invalid_input_or_incomplete_api_response'}
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'status': result['status'], 'output': str(args.output)}))
    return 0 if result['status'] == 'completed' else 1

if __name__ == '__main__':
    raise SystemExit(main())
