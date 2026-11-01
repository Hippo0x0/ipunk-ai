#!/usr/bin/env python3
"""Read-only sequential short inference benchmark. Does not configure a server."""
import argparse
import json
import os
import time
import urllib.request
from urllib.parse import urlparse

parser = argparse.ArgumentParser()
parser.add_argument('--base-url', required=True)
parser.add_argument('--model', required=True)
args = parser.parse_args()
parsed = urlparse(args.base_url)
if parsed.scheme not in ('http', 'https') or parsed.hostname not in ('localhost', '127.0.0.1', '::1'):
    parser.error('This public example only sends benchmark prompts to a loopback server.')

prompts = [
    ('short', '请用中文解释为什么月球不会掉到地球上，连续写一段，至少300字。'),
    ('medium', 'Background information: ' + 'The system keeps a local backup model for network failures. ' * 80
     + '\n请用中文解释本地模型作为备用服务的优点，连续写一段，至少300字。'),
]
for case, prompt in prompts:
    body = {'model': args.model, 'messages': [{'role': 'user', 'content': prompt}],
            'temperature': 0, 'max_tokens': 64, 'stream': True,
            'stream_options': {'include_usage': True}, 'chat_template_kwargs': {'enable_thinking': False}}
    headers = {'Content-Type': 'application/json'}
    if os.environ.get('LOCAL_LLM_API_KEY'):
        headers['Authorization'] = 'Bearer ' + os.environ['LOCAL_LLM_API_KEY']
    request = urllib.request.Request(args.base_url.rstrip('/') + '/chat/completions',
                                     data=json.dumps(body).encode(), headers=headers)
    started = time.monotonic()
    first = None
    usage = {}
    with urllib.request.urlopen(request, timeout=600) as response:
        for line in response:
            if not line.startswith(b'data: '):
                continue
            payload = line[6:].strip()
            if payload == b'[DONE]':
                break
            chunk = json.loads(payload)
            if chunk.get('usage'):
                usage = chunk['usage']
            for choice in chunk.get('choices', []):
                delta = choice.get('delta', {})
                if first is None and (delta.get('content') or delta.get('reasoning_content')):
                    first = time.monotonic()
    ended = time.monotonic()
    count = usage.get('completion_tokens', 0)
    print(json.dumps({'case': case, 'prompt_tokens': usage.get('prompt_tokens'),
                      'completion_tokens': count, 'cached_prompt_tokens': usage.get('prompt_tokens_details', {}).get('cached_tokens'),
                      'ttft_seconds': None if first is None else first - started,
                      'total_seconds': ended - started,
                      'decode_tokens_per_second': None if first is None or count < 2 else (count - 1) / (ended - first)}, ensure_ascii=False))
