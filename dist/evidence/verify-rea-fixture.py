#!/usr/bin/env python3
"""Check the iPunk three-file fixture against REA 6.10.1 JSON output."""
import json,sys
from pathlib import Path

def verify(path):
    d=json.loads(Path(path).read_text(encoding='utf-8'))
    n=d['normalized_result'];g=n['graph'];stats=n['statistics']
    props=[o.get('properties',{}) for node in g['nodes'] for o in node.get('observations',[])]
    sources=[p for p in props if p.get('semantic_role')=='source-module']
    expected={'index.js','lib/price.js','lib/plugin.js'}
    if {p['path'] for p in sources}!=expected:
        raise ValueError('The three expected source modules do not match.')
    if stats['parsed_javascript_files']!=3 or stats['parse_failures']!=0:
        raise ValueError('Expected three parsed files and zero parse failures.')
    entry=next(p for p in sources if p['path']=='index.js')
    if entry['import_relationships']!=2:
        raise ValueError('Expected two static import relationships in index.js.')
    dynamic=[p for p in props if p.get('reference_kind')=='dynamic-import']
    if not any(p.get('resolution')=='unresolved' and p.get('specifier') is None for p in dynamic):
        raise ValueError('The variable dynamic import must remain unresolved.')
    return {'source_files':sorted(expected),'parsed_javascript_files':3,'parse_failures':0,'entry_static_import_relationships':2,'dynamic_import':'unresolved','graph_module_nodes':sum(x['kind']=='javascript-module' for x in g['nodes']),'graph_nodes':len(g['nodes']),'graph_edges':len(g['edges']),'numeric_invoice_result_verified_by_REA':False}

if __name__=='__main__':
    if len(sys.argv)!=2:raise SystemExit('Usage: python3 verify-rea-fixture.py result.json')
    try:print(json.dumps(verify(sys.argv[1]),indent=2))
    except (ValueError,KeyError,StopIteration,TypeError) as e:raise SystemExit('Fixture check failed: '+str(e))
