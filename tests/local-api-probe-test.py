import importlib.util
import io
import json
from pathlib import Path
import threading
import unittest
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.dont_write_bytecode=True
spec=importlib.util.spec_from_file_location('probe',Path(__file__).resolve().parents[1]/'dist/evidence/local-runner/probe-local-api.py')
probe=importlib.util.module_from_spec(spec);spec.loader.exec_module(probe)

class Handler(BaseHTTPRequestHandler):
    mode='normal'
    def log_message(self,*args):pass
    def do_GET(self):
        if self.mode=='redirect':
            self.send_response(302);self.send_header('Location','https://example.com/');self.end_headers();return
        self.send_response(200);self.end_headers();self.wfile.write(json.dumps({'data':[{'id':'test-model'}]}).encode())
    def do_POST(self):
        body=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        self.send_response(200);self.end_headers()
        if body['stream']:
            self.wfile.write(b'data: {"choices":[{"delta":{"content":"LOCAL_"},"finish_reason":null}]}\n\n')
            self.wfile.write(b'data: {"choices":[{"delta":{"content":"OK"},"finish_reason":"stop"}]}\n\n')
            self.wfile.write(b'data: [DONE]\n\n')
        else:self.wfile.write(json.dumps({'model':'test-model','choices':[{'message':{'content':'LOCAL_OK'},'finish_reason':'stop'}]}).encode())

class ProbeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.base=f'http://127.0.0.1:{cls.server.server_port}/v1'
    @classmethod
    def tearDownClass(cls):cls.server.shutdown();cls.server.server_close();cls.thread.join()
    def setUp(self):Handler.mode='normal'
    def test_loopback_only(self):
        for value in ['https://example.com/v1','http://0.0.0.0:1234/v1','http://localhost:1234/v1','http://user:pass@127.0.0.1:1234/v1','http://127.0.0.1:1234/v1?secret=x','http://127.0.0.1/v1']:
            with self.assertRaises(ValueError):probe.validate_base(value)
        self.assertEqual(probe.validate_base('http://[::1]:1234/v1/'),'http://[::1]:1234/v1')
    def test_models_and_both_response_modes(self):
        r=probe.probe(self.base,'test-model','ollama',5,key='SYNTHETIC_KEY')
        self.assertEqual(r['status'],'completed');self.assertTrue(r['stream']['prompt_followed']);self.assertTrue(r['non_stream']['prompt_followed'])
        self.assertNotIn('SYNTHETIC_KEY',json.dumps(r));self.assertEqual(r['listed_model_ids'],['test-model'])
    def test_external_redirect_not_followed(self):
        Handler.mode='redirect'
        with self.assertRaises(probe.urllib.error.HTTPError) as caught:probe.probe(self.base,'test-model','lmstudio',5)
        self.assertEqual(caught.exception.code,302)
        caught.exception.close()
    def test_truncated_stream_is_incomplete(self):
        r=probe.parse_stream(io.BytesIO(b'data: {"choices":[{"delta":{"content":"LOCAL_OK"},"finish_reason":"stop"}]}\n'))
        self.assertFalse(r['protocol_completed']);self.assertTrue(r['prompt_followed'])
    def test_error_and_oversized_streams_rejected(self):
        for raw in [b'data: {"error":"do not publish raw errors"}\n',b'data: '+b'x'*(probe.LIMIT+1)]:
            with self.assertRaises(ValueError):probe.parse_stream(io.BytesIO(raw))
    def test_invalid_parameters_rejected(self):
        for model in ['',"bad;command",'x'*201]:
            with self.assertRaises(ValueError):probe.probe(self.base,model,'ollama',5)
        with self.assertRaises(ValueError):probe.probe(self.base,'model','unknown',5)
        with self.assertRaises(ValueError):probe.probe(self.base,'model','ollama',100)

if __name__=='__main__':unittest.main()
