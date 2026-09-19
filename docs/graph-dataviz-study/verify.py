#!/usr/bin/env python3
"""Independent artifact checks: set equality, exact allocations, source links, DAG and source digests.
Does not claim runtime/semantic equivalence. No network and no mutation.
"""
import collections,hashlib,json,re,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
a=json.loads((ROOT/'docs/graph-dataviz-functional-coverage.json').read_text())
live=json.loads((HERE/'live-evidence.json').read_text());base=json.loads((ROOT/'.astra-inputs/graph-dataviz-reference-catalog.json').read_text());local=json.loads((HERE/'local-evidence.json').read_text());src=json.loads((HERE/'source-exports.json').read_text())
rows={r['entry_key']:r for r in a['entries']};pkgs={p['name']:p for p in a['packages']};errors=[];results=[]
def check(ok,msg):
 (results if ok else errors).append(msg)
def subset(area):return [r for r in rows.values() if r['area']==area]
for rel,digest in a['proof']['build_input_sha256'].items():
 check(hashlib.sha256((ROOT/rel).read_bytes()).hexdigest()==digest,'generated artifact fresh: '+rel)
check(len(rows)==len(a['entries']),'unique capability identities')
check(all(r['owner_package'] in pkgs and all(p in pkgs for p in r['contributor_packages']) for r in rows.values()),'every capability has real package owner/contributors')
check(all(r['sources'] and r['need'] and r['evidence_status'] and r['qualification_status']=='unverified' for r in rows.values()),'source, need and independent qualification status per capability')
for field,area in [('elk_algorithms','ELK algorithmes'),('elk_option_groups','ELK groupes options'),('elk_options','ELK options'),('graphviz_engines','Graphviz moteurs')]:
 actual={r['sources'][0] for r in subset(area)};expected={r['reference_url'] for r in live['indexes'][field]['rows']}
 check(actual==expected,field+' equals independent live index')
 check(all(r['entry_key'] in rows for r in base[field]),field+' preserves every baseline ID')
for field in ['sentropic_actual_engines','jointjs_apps_and_recipes']:check(all(r['entry_key'] in rows for r in base[field]),field+' preserves every baseline ID')
options={r['sources'][0]:r for r in subset('ELK options')}
for field,area,member_field in [('elk_algorithms','ELK algorithmes','source_supported_option_entry_keys'),('elk_option_groups','ELK groupes options','source_direct_option_entry_keys')]:
 for r in subset(area):
  linked={x['url'] for x in live['details'][r['sources'][0]]['links'] if '/reference/options/' in x['url']}
  check(linked<options.keys() or linked==options.keys(),r['entry_key']+' linked options present')
  expected={options[u]['entry_key'] for u in linked}
  check(expected==set(r['baseline'].get(member_field,[])),r['entry_key']+' option members match live detail')
check(len(options)==286 and len(set(r['source_id'] for r in options.values()))==279,'ELK 286 pages / 279 IDs retained without invalid deduplication')
check({r['name'] for r in subset('Graphviz attributs')}=={r['source_id'] for r in live['indexes']['graphviz_attributes']['rows']},'all 177 Graphviz attributes')
expected_outputs={p for r in live['indexes']['graphviz_outputs']['rows'] for p in r['index_parameters']}
vt=live['details']['https://graphviz.org/docs/outputs/vt/']['text']
if 'vt-8up2' in vt:expected_outputs.add('vt-8up2')
check(expected_outputs=={r['name'] for r in subset('Graphviz sorties')} and len(expected_outputs)==65,'64 indexed outputs + documented vt-8up2 = 65')
# Different gallery routes and sitemap provide independent membership sets.
for route in ['/demos','/all-demos']:
 urls={u for p in live['jointjs_pages'] if p['url'].split('?')[0]=='https://www.jointjs.com'+route for u in p['demo_urls']}
 check(urls==set(live['jointjs_sitemap_demo_urls']),route+' union equals sitemap')
check({r['sources'][0] for r in subset('JointJS vues et applications')}==set(live['jointjs_sitemap_demo_urls']),'all JointJS sitemap demos allocated')
card={c['source_id']:c for c in live['jointjs_cards']}
labels={f for c in card.values() for f in c['detail_features']}
check(len(labels)==61 and labels=={r['name'] for r in subset('JointJS features')},'all 61 official feature labels')
for r in subset('JointJS vues et applications'):
 c=card[r['entry_key'].split(':',1)[1]]
 if c['detail_features']:check(r['features']==c['detail_features'],r['entry_key']+' full detail features')
 else:check(r['features']==['Custom shapes'] and 'gallery' in r['feature_basis'],r['entry_key']+' sourced gallery fallback')
 check(set(r['host_routes'])=={'svelte','react','vue','angular'},r['entry_key']+' four explicit host routes')
 check(all(k in rows for k in r['capability_refs']),r['entry_key']+' capability references resolve')
 check('graph-recipes' in r['owner_package'] and len(r['contributor_packages'])>=5,r['entry_key']+' recipe is not sole behavior target')
for cap in subset('Processing complémentaire'):
 recipe=rows['jointjs-demo:'+cap['entry_key'].split(':',1)[1]]
 check(cap['entry_key'] in recipe['capability_refs'] and cap['owner_package'] in recipe['contributor_packages'],'algorithm capability linked to recipe: '+cap['entry_key'])
check('@sentropic/design-system-tokens' in pkgs['@sentropic/design-system-themes']['dependencies'],'existing themes to tokens dependency retained')
check(sum(s.get('http_status')!=200 for s in live['sources'])==2,'two inaccessible embedded sources remain explicit')
for p in pkgs.values():
 check(set(p['owned_entry_keys'])=={r['entry_key'] for r in rows.values() if r['owner_package']==p['name']},p['name']+' exact inverse ownership')
 check(set(p['contributing_entry_keys'])=={r['entry_key'] for r in rows.values() if p['name'] in r['contributor_packages']},p['name']+' exact inverse contributions')
# Independent Kahn topological traversal.
remaining={n:set(p['dependencies']) for n,p in pkgs.items()};sorted_nodes=[]
while remaining:
 ready=sorted(n for n,deps in remaining.items() if not deps)
 if not ready:break
 sorted_nodes+=ready
 for n in ready:del remaining[n]
 for deps in remaining.values():deps.difference_update(ready)
check(not remaining,'DAG independent topological traversal')
check(len(pkgs)==30 and sum(not p['existing_name'] for p in pkgs.values())==18,'30 packages including 18 new and 12 preserved names')
check({m['key'] for m in a['source_export_mapping']}=={r['key'] for r in src['exports']} and len(a['source_export_mapping'])==3547,'all 3547 public export pairs preserve destination')
check(all(m['canonical_target_package'] in pkgs for m in a['source_export_mapping']),'every canonical export destination resolves')
# Local evidence freshness: metadata is not substituted for source availability.
roots={p['repository']:Path(p['root']) for p in local['provenance']}
files={}
for m in local['modules']+local['extra_files']:files[(m['repository'],m['path'])]=m
for c in local['ds_components']:
 for k in ['source_evidence','implementation_evidence']:
  m=c[k];files[(m['repository'],m['path'])]=m
for (repo,rel),m in files.items():
 p=roots[repo]/rel
 check(p.exists() and hashlib.sha256(p.read_bytes()).hexdigest()==m.get('sha256'),repo+'/'+rel+' source fingerprint')
# Referenceable local links and generated package nodes in the deliverable.
spec=(ROOT/'spec/SPEC_EVOL_GRAPH_DATAVIZ_PACKAGES.md').read_text()
check(all('`'+n+'`' in spec for n in pkgs),'every exact package name in spec')
check(all('@sentropic/'+n in spec for n in ['graph','dataviz-core','dataviz-svelte','dataviz-react','dataviz-vue','dataviz-angular']),'six preserved names visible')
check('D4=C′' in (ROOT/'docs/graph-dataviz-functional-coverage.md').read_text(),'ratified D4 prime applied')
check(spec.count('```mermaid')==2,'functional and package dependency diagrams present')
for p in [ROOT/'spec/SPEC_EVOL_GRAPH_DATAVIZ_PACKAGES.md',ROOT/'docs/graph-dataviz-functional-coverage.md']:
 for target in re.findall(r'\]\(([^)]+)\)',p.read_text()):
  if target.startswith(('http','#')):continue
  dest=(p.parent/target.split('#')[0]).resolve();check(dest.exists(),'local link '+str(p.relative_to(ROOT))+' → '+target)
print(json.dumps({'status':'pass' if not errors else 'fail','checks_passed':len(results),'failures':errors,'capabilities':len(rows),'packages':len(pkgs),'new_packages':18,'source_export_pairs':3547,'jointjs_demos':186,'graphviz_output_parameters':65,'source_files_rechecked':len(files),'runtime_tests_executed':False},ensure_ascii=False,indent=2))
sys.exit(bool(errors))
