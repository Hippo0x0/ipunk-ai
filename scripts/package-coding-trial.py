"""Verify the fixed fixture and package it without a reference solution."""
from pathlib import Path
import tempfile,shutil,subprocess,zipfile,json,hashlib

root=Path(__file__).resolve().parents[1]/'dist/evidence/coding-trial'
baseline=subprocess.run(['node','--test','--test-reporter=tap','test/orders.test.mjs'],cwd=root/'fixture',capture_output=True,text=True)
if baseline.returncode!=1 or '# pass 2\n' not in baseline.stdout or '# fail 10\n' not in baseline.stdout:
    raise RuntimeError('The starter no longer reproduces the recorded 2-pass/10-fail baseline.')
(root/'baseline-tests.tap').write_text(baseline.stdout)
with tempfile.TemporaryDirectory(prefix='ipunk-trial-check-') as tmp:
    dest=Path(tmp)/'fixture';shutil.copytree(root/'fixture',dest)
    shutil.copyfile(root/'reference/orders.mjs',dest/'src/orders.mjs')
    result=subprocess.run(['node','--test','--test-reporter=tap','test/orders.test.mjs'],cwd=dest,capture_output=True,text=True)
    if result.returncode:raise RuntimeError(result.stdout+result.stderr)
    (root/'reference-tests.tap').write_text(result.stdout)
with zipfile.ZipFile(root/'coding-trial.zip','w',compression=zipfile.ZIP_DEFLATED) as z:
    for p in sorted((root/'fixture').rglob('*')):
        if not p.is_file():continue
        info=zipfile.ZipInfo('coding-trial/'+str(p.relative_to(root/'fixture')),(2026,11,27,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
        z.writestr(info,p.read_bytes())
    info=zipfile.ZipInfo('coding-trial/prompt.txt',(2026,11,27,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
    z.writestr(info,(root/'prompt.txt').read_bytes())
manifest={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(root.rglob('*')) if p.is_file() and p.name!='manifest.json'}
(root/'manifest.json').write_text(json.dumps({'date':'2026-11-27','files':manifest,'reference_origin':'Author-written; not a provider output.','tests':12},indent=2)+'\n')
print('Reference: 12/12 checks. Packaged the faulty starter, tests, README and prompt.')
