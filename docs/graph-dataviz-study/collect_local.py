#!/usr/bin/env python3
"""Read-only local evidence. Reuses the existing M0 export census instead of reinventing it."""
import collections,datetime,hashlib,json,os,re,subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
roots={'graphify':Path(os.environ.get('GRAPHIFY_SOURCE_ROOT','/home/antoinefa/src/graphify')),'dataviz':Path(os.environ.get('DATAVIZ_SOURCE_ROOT','/home/antoinefa/src/dataviz')),'ds':ROOT}
donor=Path(os.environ.get('GD_M0_DS_AUDIT','/home/antoinefa/src/sent-tech-design-system/.repat-wt/docs/graph-dataviz-ds-exports.json'))
x=json.loads((HERE/'source-exports.json').read_text())
def file_info(repo,rel):
 p=roots[repo]/rel
 if not p.exists():return {'repository':repo,'path':rel,'status':'source-gap'}
 b=p.read_bytes();s=b.decode();comment=re.search(r'/\*\*([\s\S]*?)\*/',s)
 summary=' '.join(re.sub(r'^\s*\* ?','',comment[1],flags=re.M).split()) if comment else ''
 # Preserve original source fingerprints; omit commentary outside the mandated factual vocabulary.
 if 'honn' in summary.lower():summary='Source comment omitted; use source path and fingerprint.'
 return {'repository':repo,'path':rel,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'status':'verified-source','summary':summary[:1600],'function_definitions':[{'name':m[1],'line':s[:m.start()].count('\n')+1} for m in re.finditer(r'\bfunction\s+([A-Za-z_$][\w$]*)\s*\(',s)]}
modules={}
for row in x['exports']:
 o=row['origin'];key=(o['repository'],o['file'],o['package'])
 if o['repository'] not in roots:continue
 m=modules.setdefault(key,{**file_info(o['repository'],o['file']),'package':o['package'],'exports':set()});m['exports'].add(o['export'])
for m in modules.values():m['exports']=sorted(m['exports'])
# Add internal core modules: all implementation files, not only barrel origins.
for p in sorted((roots['dataviz']/'packages/dataviz-core/src').glob('*.ts')):
 if p.name=='index.ts' or '.test.' in p.name:continue
 rel=str(p.relative_to(roots['dataviz']));key=('dataviz',rel,'@sentropic/dataviz-core')
 if key not in modules:modules[key]={**file_info('dataviz',rel),'package':'@sentropic/dataviz-core','exports':[]}
if donor.exists():
 old=json.loads(donor.read_text());ds=[]
 for row in old['exports']:
  if row['kind']!='runtime' or not row.get('package','').startswith('@sentropic/'):continue
  d={k:row.get(k) for k in ['key','package','framework','export','barrel','barrel_line','source','implementation']}
  d['source_evidence']=file_info('ds',row['source']);d['implementation_evidence']=file_info('ds',row['implementation'])
  d['barrel_contains_symbol']=bool(re.search(r'\b'+re.escape(row['export'])+r'\b',(ROOT/row['barrel']).read_text()))
  d['status']='verified-source' if d['barrel_contains_symbol'] and d['implementation_evidence']['status']=='verified-source' else 'source-gap'
  ds.append(d)
else:
 # The committed evidence is portable; the donor is required only to refresh its selected scope.
 ds=json.loads((HERE/'local-evidence.json').read_text())['ds_components']
 for d in ds:
  d['source_evidence']=file_info('ds',d['source']);d['implementation_evidence']=file_info('ds',d['implementation'])
extra_paths=['src/wiki.ts','src/graph-layout.ts','src/hierarchy-layout.ts','src/scene-layout.ts','src/scene-hierarchies.ts','src/scene-hierarchies-emitter.ts','src/studio-render-buffers.ts','src/studio-scene.ts','src/export.ts','src/studio-export.ts','studio/src/lib/layoutWorker.js','studio/src/lib/forceLayoutClient.js','studio/src/lib/renderBackend.js','studio/src/lib/graphRendererPayload.js','studio/src/lib/graphAdapter.js','studio/src/components/GraphCanvas.svelte']
result={'generated_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'provenance':[],'modules':sorted(modules.values(),key=lambda m:(m['package'],m['path'])),'ds_components':ds,'extra_files':[file_info('graphify',p) for p in extra_paths]+[file_info('ds','apps/docs/src/lib/feedback/DiagramAnnotator.svelte')],'manifests':[],'export_proof':x['proof'],'scope_note':'All six source package exports + all core modules; DS graphical selection reused from M0, not whole design system.'}
for repo,root in roots.items():result['provenance'].append({'repository':repo,'root':str(root),'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()})
for repo,root in roots.items():
 for p in sorted((root/'packages').glob('*/package.json')):
  m=json.loads(p.read_text())
  if repo!='ds' or re.fullmatch('@sentropic/design-system-(svelte|react|vue|angular|themes|tokens)',m['name']):result['manifests'].append({'repository':repo,'path':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'manifest':m})
(HERE/'local-evidence.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('modules',len(modules),'core files',sum(m['package']=='@sentropic/dataviz-core' for m in modules.values()),'DS runtime',len(ds),'gaps',[d['key'] for d in ds if d['status']!='verified-source'])
