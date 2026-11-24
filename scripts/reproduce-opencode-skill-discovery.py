import json, os, subprocess, tempfile, sys, platform, hashlib
from pathlib import Path
binary=sys.argv[1]
version=subprocess.check_output([binary,'--version'],text=True).strip()
name='ipunk-skill-check'
marker='PROJECT_SKILL_FIXTURE'
def fixture(description,marker):
    return f'---\nname: {name}\n'+('description: Check discovery with a local marker\n' if description else '')+f'---\n{marker}\n'
cases=[]
for case,filename,desc,dupe in [('valid','SKILL.md',True,False),('wrong-filename','guide.md',True,False),('missing-description','SKILL.md',False,False),('duplicate-global-project','SKILL.md',True,True)]:
    with tempfile.TemporaryDirectory() as tmp:
        p=Path(tmp)
        root=p/'repo'
        path=root/'.opencode'/'skills'/name/filename
        path.parent.mkdir(parents=True)
        path.write_text(fixture(desc,marker))
        subprocess.run(['git','init','-q',str(root)],check=True)
        if dupe:
            globalpath=p/'config'/'opencode'/'skills'/name/'SKILL.md'
            globalpath.parent.mkdir(parents=True)
            globalpath.write_text(fixture(True,'GLOBAL_SKILL_FIXTURE'))
        env={**{k:os.environ[k] for k in ('PATH','LANG','TMPDIR') if k in os.environ},'HOME':str(p),'OPENCODE_DISABLE_EXTERNAL_SKILLS':'true',**{f'XDG_{x.upper()}_HOME':str(p/x) for x in ('config','data','cache','state')}}
        run=subprocess.run([binary,'debug','skill','--pure'],cwd=root,env=env,text=True,capture_output=True,timeout=20,check=True)
        found=[item for item in json.loads(run.stdout) if item.get('name')==name]
        for item in found:
            if 'location' in item:
                item['location']=str(Path(item['location']).relative_to(p.resolve()))
        cases.append(dict(case=case,filename=filename,description=desc,duplicate_global=dupe,exit_status=run.returncode,observed=found))
print(json.dumps(dict(version=version,platform=platform.system()+' '+platform.machine(),command='opencode debug skill --pure',reproduction='Temporary Git repositories and isolated HOME/XDG paths; project and global marker files only. No model requests. Output filtered to the authored fixture name; temporary paths made relative.',cases=cases),indent=2))
