import os,tempfile,subprocess,sys,json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
plugin='''import { Plugin } from "@opencode/plugin"
import { writeFileSync } from "node:fs"

export default Plugin.define({
  id: "ipunk.local-probe",
  async setup() {
    writeFileSync(process.env.IPUNK_PLUGIN_MARKER, "IPUNK_LOCAL_PLUGIN_READY")
  },
})
'''
def probe(case):
    with tempfile.TemporaryDirectory(prefix='ipunk-plugin-') as tmp:
        root=Path(tmp).resolve()
        p=root/'project'; p.mkdir()
        subprocess.run(['git','init','-q',str(p)],check=True)
        if case == 'discovered':
            f=p/'.opencode/plugins/local-probe/index.ts'
        else:
            f=p/'fixtures/local-probe/index.ts'
            (p/'opencode.json').write_text(json.dumps({'plugins':['./fixtures/local-probe'+('/index.ts' if case=='configured-file' else '')]}))
        f.parent.mkdir(parents=True); f.write_text(plugin)
        env={**{k:os.environ[k] for k in ('PATH','TMPDIR','LANG') if k in os.environ},'HOME':str(root),'OPENCODE_DISABLE_AUTOUPDATE':'true','IPUNK_PLUGIN_MARKER':str(root/'ready.txt'),**{f'XDG_{k.upper()}_HOME':str(root/k) for k in ('config','data','cache','state','runtime')}}
        common=['--standalone','--print-logs','--log-level','debug']
        listing=subprocess.run([sys.argv[1],'plugin','list',*common],cwd=p,env=env,text=True,capture_output=True,timeout=20)
        marker=root/'ready.txt'
        list_marker=marker.exists()
        marker.unlink(missing_ok=True)
        agents=subprocess.run([sys.argv[1],'debug','agents',*common],cwd=p,env=env,text=True,capture_output=True,timeout=20)
        return {'case':case,
                'plugin_list_exit_status':listing.returncode,
                'plugin_list_reported_no_plugins':'No plugins found' in listing.stdout,
                'plugin_list_setup_marker':list_marker,
                'debug_agents_exit_status':agents.returncode,
                'loader_logged_entrypoint':any('loading plugin' in line and 'local-probe' in line for line in agents.stderr.splitlines()),
                'configured_file_warning':'configured plugin path must be a directory' in agents.stderr,
                'debug_agents_setup_marker':marker.exists()}
with ThreadPoolExecutor() as pool:
    results=list(pool.map(probe,['discovered','configured-directory','configured-file']))
print(json.dumps({'version':subprocess.check_output([sys.argv[1],'--version'],text=True).strip(),
                  'commands':['opencode plugin list --standalone --print-logs --log-level debug','opencode debug agents --standalone --print-logs --log-level debug'],
                  'scope':'Three isolated temporary Git workspaces on macOS arm64; no model calls. Records local server setup for the fixture, not Desktop or TUI compatibility.',
                  'cases':results},indent=2))
