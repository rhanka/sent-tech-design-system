#!/usr/bin/env python3
"""Build reviewable study/architecture from the augmented baseline and named design decisions.
No network, no runtime execution, no Track write. Run after collect.py + collect_local.py.
"""
import collections,copy,datetime,hashlib,json,re
from pathlib import Path
from model import P,FW,FEATURE_OWNERS,category
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
BASE=json.loads((ROOT/'.astra-inputs/graph-dataviz-reference-catalog.json').read_text())
LIVE=json.loads((HERE/'live-evidence.json').read_text());LOCAL=json.loads((HERE/'local-evidence.json').read_text())
SRC=json.loads((HERE/'source-exports.json').read_text())
E=[];CHECKS=[];GAPS=[]
MANDATE='.astra-inputs/graph-dataviz-repatriation-MANDATE.md'
def full(n):return n if n.startswith('@sentropic/') else '@sentropic/'+n

def add(key,name,area,owner,need,source,status='verified-reference',features=None,contributors=(),**more):
 r={'entry_key':key,'name':name,'area':area,'owner_package':full(owner),'need':need,'sources':[source] if isinstance(source,str) else source,'evidence_status':status,'implementation_status':'source-present; migration/qualification unverified' if status=='verified-source' else 'planned; not implemented/qualified by this design','qualification_status':'unverified','features':features or [],'contributor_packages':sorted(set(full(x) for x in contributors if full(x)!=full(owner))),**more};E.append(r);return r

def option_owner(r):
 id=r['source_id']
 if 'libavoid' in id:return 'graph-routing'
 return 'graph-layout'
def meta_detail(url):
 d=LIVE['details'][url];return {row[0].rstrip(':'):row[1] for table in d['tables'] for row in table if len(row)==2 and row[0]!='Property'}
def description(url):
 s=LIVE['details'][url]['text']
 if 'Description ' in s:return s.split('Description ',1)[1]
 return LIVE['details'][url]['description'] or s[:900]

# Baseline identities remain unchanged. Verify sets independently against official indexes.
for field,area in [('elk_algorithms','ELK algorithmes'),('elk_option_groups','ELK groupes options'),('elk_options','ELK options'),('graphviz_engines','Graphviz moteurs')]:
 before={r['reference_url'] for r in BASE[field]};now={r['reference_url'] for r in LIVE['indexes'][field]['rows']}
 CHECKS.append({'check':field+' baseline ↔ live','before':len(before),'live':len(now),'added':sorted(now-before),'missing':sorted(before-now)})
 # No newly discovered identity is discarded.
 old={r['reference_url']:r for r in BASE[field]}
 for rr in LIVE['indexes'][field]['rows']:
  r=old.get(rr['reference_url'],{**rr,'entry_key':field+':'+rr['source_id']})
  detail=meta_detail(r['reference_url']);owner=option_owner(r)
  if field=='elk_algorithms':owner='graph-routing' if r['source_id']=='org.eclipse.elk.alg.libavoid' else 'graph-layout'
  elif field=='graphviz_engines':owner='graph-layout'
  need=r.get('capability') or description(r['reference_url']) or r['name']
  if field=='elk_option_groups':need='Configuration '+r['source_id']+' ; membres directs et sous-groupes distincts.'
  row=add(r['entry_key'],r['name'],area,owner,need,r['reference_url'],source_id=r['source_id'],metadata=detail,baseline=copy.deepcopy(r),source_snapshot_sha256=next(s['sha256'] for s in LIVE['sources'] if s['url']==r['reference_url']))
  if field=='elk_options':
   assert not detail.get('Identifier') or detail['Identifier']==r['source_id'],(r,detail)
   row.update(group_ids=r.get('source_group_ids',[]),algorithm_ids=r.get('source_supported_by_algorithm_ids',[]),algorithm_scope=r.get('algorithm_scope_from_document_path'),contributors_note='graph-routing pour contraintes ports/routes/labels ; graph-scene pour application géométrique ; codecs ne garantissent pas la sémantique.',contributor_packages=['@sentropic/graph-routing','@sentropic/graph-scene'])
  if field=='elk_option_groups':row.update(option_keys=r.get('source_direct_option_entry_keys',[]),subgroup_ids=r.get('source_subgroup_ids',[]))
  if field=='elk_algorithms':row.update(option_keys=r.get('source_supported_option_entry_keys',[]),elkjs_availability=r.get('elkjs_0_12_0_readme_availability','unverified'))

# Every attribute, including style, output and platform-specific properties.
ATTR_OWNERS={}
def attrs(owner,names):
 for n in names.split():ATTR_OWNERS[n]=owner
attrs('graph-export','center charset comment dpi fontnames fontpath imagepath landscape layer layerlistsep layers layerselect layersep linelength outputorder page pagedir resolution rotate size stylesheet truecolor viewport xdotversion')
attrs('graph-svg','class edgehref edgetarget edgetooltip edgeURL headhref headtarget headtooltip headURL href id labelhref labeltarget labeltooltip labelURL tailhref tailtarget tailtooltip tailURL target tooltip URL')
attrs('graph-scene','_background arrowhead arrowsize arrowtail bb bgcolor color colorscheme decorate distortion fillcolor fixedsize fontcolor fontname fontsize gradientangle head_lp height image imagepos imagescale label labelfontcolor labelfontname labelfontsize labeljust labelloc lheight lp lwidth margin nojustify orientation pad pencolor penwidth peripheries pos quantum rects regular samplepoints scale shape shapefile showboxes sides skew style tail_lp vertices width xlabel xlp z')
attrs('graph-routing','concentrate dir esep forcelabels headclip headlabel headport labelangle labeldistance labelfloat lhead ltail radius samehead sametail splines tailclip taillabel tailport')
for r in LIVE['indexes']['graphviz_attributes']['rows']:
 owner=ATTR_OWNERS.get(r['source_id'],'graph-layout')
 add('graphviz-attribute:'+r['source_id'],r['source_id'],'Graphviz attributs',owner,r['description'],r['reference_url'],metadata={k:r[k] for k in ['used_by','type','default','minimum','engine_restrictions']},contributors=['graph-codecs'],semantic_policy='DOT parser preserve extension; owner implements semantics only when qualified; otherwise unsupported diagnostic.')

# All output parameters from official table + documented additions in detail text.
for r in LIVE['indexes']['graphviz_outputs']['rows']:
 params=list(r.get('index_parameters',[]));d=LIVE['details'][r['reference_url']]
 if r['source_id']=='vt' and 'vt-8up2' in d['text']:params.append('vt-8up2')
 for n in dict.fromkeys(params):
  kind='interactive-surface' if n in ['gtk','x11','xlib','cgimage'] else 'terminal-protocol' if n.startswith(('vt','kitty')) else 'file-format-or-variant'
  note='documented reference; capability absent in Sentropic until qualified'
  if n in ['vml','vmlz']:note='retired upstream since Graphviz 8.0.1; preserve reference, no runtime support claimed'
  if n=='ps2':note='PostScript with PDF annotations; requires conversion to become PDF'
  add('graphviz-output:'+n,n,'Graphviz sorties','graph-export',r.get('description') or r['name'],r['reference_url'],output_kind=kind,reference_status=note,index_presence=n in r.get('index_parameters',[]),family=r['source_id'],contributors=['graph-codecs'] if r['source_id'] in ['canon','json','plain'] else ['graph-scene'])

# True current engines / orchestration: preserve all 15 input rows and verify paths.
for r in BASE['sentropic_actual_engines']:
 p=Path(r['local_source_path']);p=p if p.is_absolute() else ROOT/p
 owners={'graphify-worker':'graph-worker','graphify-worker-client':'graph-worker','graphify-layout-wiring':'graph-compiler','dataviz-force-builder':'dataviz-core'}
 row=add(r['entry_key'],r['name'],'Sentropic moteurs',owners.get(r['source_id'],'graph-layout'),r['current_sentropic_equivalent'],r['reference_url'],'verified-source' if p.exists() else 'source-gap',local_path=str(p),source_id=r['source_id'],source_sha256=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else None,baseline=r)
 if r['source_id']=='graphify-layout-wiring':row['consumer_boundary']='Selection env GRAPHIFY_LAYOUT stays in graphify; generic compile port in graph-compiler; no app import into core.'
for fw in ['react','vue','angular']:
 rel='packages/components-react/src/catalog.tsx' if fw=='react' else f'packages/components-{fw}/src/ForceGraph.ts'
 add('sentropic-current:ds-force-'+fw,'ForceGraph '+fw,'Sentropic moteurs','graph-layout','Simulation locale force O(n²) + rendu SVG ; future extraction calcul commun, wrapper conservé.',rel,'verified-source',contributors=['design-system-'+fw],local_path=str(ROOT/rel))
for id,need in [('export-circle','toSvg : placement circulaire uniforme dans export.ts, distinct de BFS radial'),('obsidian-canvas-grid','toCanvas : grille de groupes/communautés et cartes, dimensionnement/packing')]:
 add('sentropic-current:graphify-'+id,id,'Sentropic moteurs','graph-layout',need,'/home/antoinefa/src/graphify/src/export.ts','verified-source',contributors=['graph-export','graph-codecs'])
# The remaining render/data engines are enumerated by actual source module and DS component below.
NOTABLE={
'TreemapChart':'Squarify ; rectangles proportionnels hiérarchiques',
'PackedBubblesChart':'Placement spirale et collisions de cercles',
'WordCloudChart':'Placement spirale des mots et boîte de collision',
'SankeyChart':'Couches de flux, positions et largeurs de liens',
'OrganizationChart':'Placement hiérarchique organisationnel',
'TreegraphChart':'Profondeur et positions de l’arbre',
'SunburstChart':'Partition radiale hiérarchique',
'ChordDiagram':'Angles proportionnels et rubans de flux',
'DependencyWheelChart':'Géométrie circulaire des dépendances',
'VennChart':'Intersections/disposition des ensembles',
'GeoChart':'Projections equirectangular/Mercator, binning hexagonal et clustering glouton',
'ArcDiagramChart':'Placement linéaire et arcs par paires',
'FlamegraphChart':'Rectangles imbriqués de traces',
'DecompositionTreeChart':'Disposition hiérarchique de contributions'}
for n,need in NOTABLE.items():
 rows=[r for r in LOCAL['ds_components'] if r['export']==n]
 add('sentropic-current:ds-kernel-'+n,n+' : calcul géométrique','Sentropic moteurs','graph-layout',need,[r['implementation'] for r in rows],'verified-source',contributors=['design-system-'+fw for fw in FW],evidence_note='Implementations présentes ; description principale examinée côté Svelte ; parité des calculs 4-fw unverified.',implementations=[{k:r[k] for k in ['framework','implementation','status']} for r in rows])
# Explicit bridges and producers outside the six packages; generic part is assigned,
# application-specific production remains in the consumer and is never imported by the core.
bridges={
 'src/scene-hierarchies.ts':('graph-processing','Construction des hiérarchies et contraintes à projeter ; données knowledge restent produit'),
 'src/scene-hierarchies-emitter.ts':('graph-compiler','Émission de hiérarchies pour scène ; contrat de projection générique, contenu produit conservé'),
 'src/studio-render-buffers.ts':('graph-scene','Bridge serveur vers builders de buffers canoniques'),
 'src/studio-scene.ts':('graph-compiler','Producteur de scène knowledge : adaptation par port, producteur conservé chez graphify'),
 'studio/src/lib/renderBackend.js':('graph','Sélection WebGL/Canvas2D, fallback et overlays de texte'),
 'studio/src/lib/graphRendererPayload.js':('graph-compiler','Adaptation scène produit vers buffers/styles et choix de layout ; séparer mapping métier des fonctions génériques'),
 'studio/src/lib/graphAdapter.js':('graph-compiler','Mapping graph.json knowledge vers scène ; consommateur graphify, pas import produit dans compiler'),
 'studio/src/components/GraphCanvas.svelte':('graph-svelte','Binding Svelte du renderer et interactions ; extraction derrière API contrôlée DS'),
 'apps/docs/src/lib/feedback/DiagramAnnotator.svelte':('graph-canvas','Recette cerclage ellipse/rectangle et composition PNG ; extraire gestes/commandes, UI docs reste host')}
for m in LOCAL['extra_files']:
 if m['path'] not in bridges:continue
 owner,need=bridges[m['path']]
 add('sentropic-bridge:'+m['repository']+':'+m['path'],Path(m['path']).name,'Sentropic ponts et producteurs',owner,need,m['path'],m['status'],source_repository=m['repository'],source_sha256=m.get('sha256'),function_definitions=m['function_definitions'],consumer_boundary='Generic contract/extraction target only; application producer, data access and environment choices remain in consumer.')
# Every actual source module, with all canonical export names, gets a destination.
def module_owner(m):
 n=m['package'];p=Path(m['path']).name
 if n=='@sentropic/graph':
  if p.startswith('layout'):return 'graph-layout'
  if p in ['buffers.ts','positions.ts','styles.ts','mat4.ts','shape-geometry.ts','render-geometry.ts','edge-geometry.ts','gitflow-labels.ts']:return 'graph-scene'
  return 'graph'
 return n
for m in LOCAL['modules']:
 if m['package'] not in P:continue
 add('sentropic-module:'+m['package']+':'+m['path'],Path(m['path']).name,'Sentropic modules',module_owner(m),m['summary'] or 'Surface source : '+', '.join(m['exports']),m['path'],m['status'],source_package=m['package'],source_repository=m['repository'],exports=m['exports'],source_sha256=m.get('sha256'),public_compatibility_package=m['package'],function_definitions=m['function_definitions'])
# Group same chart contract, but enumerate every framework implementation/source separately in the row.
for name in sorted(set(r['export'] for r in LOCAL['ds_components'])):
 rows=[r for r in LOCAL['ds_components'] if r['export']==name]
 for r in rows:
  add('ds-component:'+r['framework']+':'+name,name,'DS rendu/dataviz',r['package'],'Composant/primitive présentationnelle existante ; '+NOTABLE.get(name,'contrat du barrel et rendu conservés.'),r['implementation'],'verified-source',framework_implementations=[{k:r[k] for k in ['framework','package','barrel','source','implementation','status']}],ownership_note='Canonical owner of this framework implementation; parity with other frameworks unverified.')

# Mandated capabilities, explicitly source-backed as requirements rather than existing implementations.
CAPABILITIES=[
('document','graph-model','Document typé : entités, relations, hyper-relations, références stables ; extensions validées'),
('views-occurrences','graph-model','Vues et occurrences : même entité en plusieurs vues ; sélection occurrence/entité/vue explicite'),
('profiles-versioned','graph-profiles','Identifiant/version/migrations de chaque profil, validation structurelle et métier'),
('processing-projection','graph-processing','Projection de calcul avec provenance ; SCC/parcours/tri topologique/contraintes'),
('commands','graph-model','Commandes typées identiques pour humains et agents ; validation et refus structurés'),
('transactions','graph-canvas','Aperçu séparé du commit transactionnel et de la persistance ; undo/redo atomique'),
('persistence-ports','graph-model','Ports storage, ressources et présence ; utilisation hors Sentropic'),
('snapshot-revision','graph-worker','Snapshot doc/view/projection versionné ; annulation et rejet de résultats obsolètes'),
('layout-diagnostics','graph-layout','Contraintes infaisables et options non supportées : diagnostic, seed et stabilité incrémentale distinguées'),
('relation-routing','graph-routing','Routes orthogonales/octilinéaires/courbes, obstacles, ports, labels, self-loops et relations de relations'),
('scene','graph-scene','Contrat géométrique unique : nœuds/rects/ports/routes/labels/identités/métriques'),
('picking','graph-scene','Picking/sélection géométrique partagé, coordonnées caméra et tolérances backend indépendants'),
('resource-metrics','graph-compiler','Compiler avec ports de mesure texte/fonts/images ; mêmes mesures pour layout/rendu/export'),
('single-compiler','graph-compiler','Un compilateur partagé, quatre adaptateurs qualifiés ; aucune copie de logique selon framework'),
('agent-presence','graph-canvas','Adaptation activité/présence après audit de source ; scopes h2a/Track ne deviennent pas des verrous'),
('full-app-hosts','graph-recipes','Applications complètes rendues par 4 hosts docs ; palettes/inspecteurs/outils inclus, pas seulement scènes statiques')]
for id,owner,need in CAPABILITIES:add('mandate:'+id,id,'Contrats et canvas',owner,need,MANDATE,'verified-requirement')
RENDER=[
('svg-vector','graph-svg','Primitives SVG, routes, marqueurs, texte/labels, gradients, clip/mask et images',['graph-scene']),
('svg-dom','graph-svg','Identités occurrence↔élément, événements accessibles et sélection externe',['graph-canvas']),
('svg-ssr','graph-svg','Sérialisation sans DOM et scènes hydratables déterministes',['graph-compiler']),
('html-nodes','graph-dom','Nœuds HTML : formulaires DS, focus, clavier, IME et mesure ResizeObserver',['graph-scene']),
('html-edges','graph-dom','Arêtes déléguées à SVG/WebGL, ports/coords/caméra synchronisés ; pas de routage CSS implicite',['graph-svg','graph']),
('hybrid','graph-dom','Composition HTML + SVG/WebGL avec z-order, overlays et hit-testing cohérents',['graph-scene','graph-canvas']),
('webgl-buffers','graph','WebGL2 instancié, typed arrays positions/style, glyphes SDF',['graph-scene']),
('webgl-edges','graph','Arêtes instanciées, dash arc-length, flèches, flow-ports',['graph-routing']),
('webgl-text','graph','Boxes et atlas texte, métriques communes et fallback overlays Canvas2D',['graph-scene']),
('canvas2d','graph','Backend Canvas2D actuel de référence et fallback de compatibilité',['graph-scene']),
('camera','graph-scene','Caméra, transforms, zoom/pan, coordonnées world/screen, matrice ortho',['graph-canvas']),
('virtual-render','graph-scene','Culling, niveau de détail, invalidation et virtual rendering ; budget mémoire',['graph','graph-svg','graph-dom']),
('tokens','design-system-themes','Résolution tokens --st-* et thème tenant vers styles scène exportables',['design-system-tokens']),
('selection-edit','graph-canvas','Sélection/lasso, drag/redim, snap/groupes, liens/ports et clipboard',['graph-model']),
('annotations','graph-canvas','Annotation, cerclage, image+formes ; identité doc vs annotation chart explicite',['graph-scene','dataviz-core']),
('a11y','graph-canvas','Parité navigation, focus, clavier, annonces, contraste et alternatives textuelles',['graph-svelte','graph-react','graph-vue','graph-angular']),
('csp','graph-dom','Qualification CSP styles dynamiques/ressources ; policy explicite du host',['graph-svelte','graph-react','graph-vue','graph-angular'])]
for id,owner,need,contributors in RENDER:add('render:'+id,id,'Rendu capacités',owner,need,MANDATE,'verified-requirement',contributors=contributors)
CODECS=[
('document-json','graph-codecs','JSON document natif versionné, pas JSON dashboard ni Graphviz JSON'),
('mermaid','graph-codecs','Mermaid : AST/CST, dialectes et sous-ensembles publiés avec rapports pertes'),
('plantuml','graph-codecs','PlantUML/UML : source texte et profil UML, sous-ensembles qualifiés'),
('bpmn-xml-di','graph-codecs','BPMN 2 XML + DI, modèle natif, events/flows/pools/swimlanes et occurrences'),
('archimate-exchange','graph-codecs','Open Group ArchiMate Exchange + profil natif, pas uniquement la Business Layer de la démo'),
('drawio-mxgraph','graph-codecs','draw.io mxGraph XML, compression et styles/extensions conservés selon qualification'),
('sparx-ea-xmi','graph-codecs','Sparx EA : XMI/profils/version outil explicités ; aucun format universel inventé'),
('visio-vsdx','graph-codecs','Visio VSDX : packages XML/ZIP, import BPMN/orgchart/flowchart et export BPMN selon fiches'),
('dot-xdot','graph-codecs','DOT et xdot : syntaxe, attributs connus/extensions et géométrie ; pas invocation Graphviz'),
('conversion-report','graph-codecs','Rapport par conversion : converti / conservé-extension / dégradé / ignoré / non-supporté'),
('bpmn-native','graph-profiles','Profil BPMN natif et versions sans dépendance bpmn-js/diagram-js'),
('archimate-native','graph-profiles','Profil ArchiMate natif et versions sans dépendance JointJS')]
for id,owner,need in CODECS:
 src='https://www.jointjs.com/demos/visio-bpmn-import' if id=='visio-vsdx' else MANDATE
 add('codec:'+id,id,'Domaines et codecs',owner,need,src,'verified-reference' if src.startswith('http') else 'verified-requirement')
EXPORTS=[
('pdf','graph-export','PDF vectoriel et pages, fonts/images et rapport pertes ; code actuel lazy jspdf/svg2pdf.js','packages/dataviz-svelte/src/lib/chart-export.ts','verified-source'),
('png','graph-export','PNG raster et échelle/fond ; extrait de SVG/scene, ne prouve pas snapshot WebGL identique','packages/dataviz-svelte/src/lib/chart-export.ts','verified-source'),
('svg','graph-export','SVG autonome avec styles/ressources ; façade serializeSvg conservée','packages/dataviz-svelte/src/lib/chart-export.ts','verified-source'),
('jpeg','graph-export','JPEG (raster avec fond opaque), demandé par features JointJS Export to PNG/JPEG','https://www.jointjs.com/demos/pdf-export','verified-reference'),
('pptx','graph-export','PPTX : paquet OOXML slides/médias/relations ; export image de slide vs objets vectoriels éditables distingués','owner prompt 2026-09-15 : tâche 1 exports PDF PNG SVG PPTX JSON','verified-requirement'),
('json-document','graph-codecs','JSON sémantique document/profils/vues ; réimport avec migrations',MANDATE,'verified-requirement'),
('json-scene','graph-scene','JSON studio-scene produit incluant géométrie et identités ; adapter vers scène canonique, conserver champs knowledge au consommateur','graphify/src/studio-scene.ts','verified-source'),
('json-dashboard','dataviz-core','Sérialisations séparées état/filtres/sélections/drill, layout et annotations ; leur assemblage dashboard complet est une cible à qualifier',['packages/dataviz-core/src/serialize.ts','packages/dataviz-core/src/layout.ts','packages/dataviz-core/src/annotations.ts'],'verified-source'),
('csv','dataviz-core','CSV tabulaire rowsToCsv actuel dans les wrappers ; extraction pure future sans modification API','packages/dataviz-svelte/src/lib/ExportMenu.svelte','verified-source'),
('html','graph-export','HTML portable avec SVG/ressources et comportement optionnel, sans script arbitraire embarqué','graphify/src/studio-export.ts','verified-source'),
('print','graph-export','Impression navigateur et pagination, sauvegarde PDF utilisateur distincte encodeur PDF','packages/dataviz-svelte/src/lib/chart-export.ts','verified-source'),
('md','graph-codecs','Markdown wiki toWiki : projection produit conservée dans graphify, encodage textuel générique seulement à adapter','graphify/src/wiki.ts','verified-source'),
('graphml','graph-codecs','GraphML XML toGraphml existant : 4 attributs nœud (label,file_type,source_file,community) et 2 arête (relation,confidence) ; extension du codec à qualifier','graphify/src/export.ts','verified-source'),
('cypher','graph-codecs','Cypher toCypher : script textuel ; ne transporte ni Neo4j driver ni push réseau','graphify/src/export.ts','verified-source'),
('spanner-ddl','graph-codecs','GoogleSQL Spanner DDL : schéma/property graph via spannerDdlLines ; modèle produit reste consommateur','graphify/src/export.ts','verified-source'),
('spanner-dml','graph-codecs','GoogleSQL Spanner DML : INSERT OR UPDATE via toSpanner ; pas de client cloud','graphify/src/export.ts','verified-source'),
('obsidian-canvas','graph-codecs','Obsidian .canvas JSON via toCanvas : groupes/cartes/liens, pas Canvas2D ; troncature source à 200 arêtes explicitée','graphify/src/export.ts','verified-source'),
('graphify-json','graph-codecs','graph.json et sidecars/citations JSON : modèle knowledge produit conservé ; adaptation vers document natif explicite','graphify/src/export.ts','verified-source')]
for id,owner,need,src,status in EXPORTS:add('export:'+id,id.upper(),'Exports Sentropic / mandat',owner,need,src,status,format_qualification='Source presence or requirement only; exact encoding fidelity unverified.')

# Every official demo: all source features, individual need, explicit analytical category,
# implementation host route and source/embedded access kept separate.
base_demo={r['source_id']:r for r in BASE['jointjs_apps_and_recipes']}
feature_labels=set(t for r in LIVE['jointjs_cards'] for t in r.get('detail_features',[]))
for f in sorted(feature_labels):
 assert f in FEATURE_OWNERS,f
 owner=FEATURE_OWNERS[f];contributors=[]
 if owner=='graph-svelte':
  owner='design-system-themes' if f=='CSS styling' else 'graph-canvas'
  contributors=['graph-'+fw for fw in FW]
 add('jointjs-feature:'+f,f,'JointJS features',owner,'Capacité UI/document/rendu annoncée par les fiches officielles : '+f,'https://www.jointjs.com/demos',contributors=contributors)
for c in sorted(LIVE['jointjs_cards'],key=lambda c:c['source_id']):
 old=base_demo.get(c['source_id'],{});features=c.get('detail_features',[]);basis='individual-page'
 if not features:
  features=[f for f in c.get('index_features',[]) if f in FEATURE_OWNERS];basis='gallery fallback; no feature list on individual page'
 needs=c.get('detail_description') or ' / '.join(c['card_descriptions']) or c['name']
 owners=[FEATURE_OWNERS[f] for f in features];contributors=set(owners+['graph-compiler','graph-canvas','graph-svg']+['graph-'+fw for fw in FW]);contributors.discard('graph-recipes')
 row=add('jointjs-demo:'+c['source_id'],c['name'],'JointJS vues et applications','graph-recipes',needs,c['reference_url'],features=features,contributors=contributors,category=category(c['source_id']),category_basis='classification analytique Sentropic ; champ officiel CMS type vide',gallery_full_labels=c.get('gallery_full_labels',[]),official_taxonomy_membership='source-gap; not exposed in inspected CMS card fields',feature_basis=basis,recipe_id='jointjs/'+c['source_id'],recipe_family=category(c['source_id']),host_routes={fw:'/graph-recipes/'+c['source_id']+'?framework='+fw for fw in FW},host_status='planned route; no UI built in design lane',source_license_marker=c.get('license_marker') or old.get('source_license_marker','unverified'),embedded_sources=c['embedded_sources'],detail_http_status=c['detail_http_status'],baseline=old)
 row['capability_refs']=['jointjs-feature:'+f for f in features]
 row['runtime_policy']='Reference coverage only. Reimplement/adapt Sentropic; no JointJS/vendor runtime, commercial code or named integration imported.'
 for em in c['embedded_sources']:
  if em['http_status']!=200:GAPS.append({'id':'jointjs-embedded:'+c['source_id'],'status':'source-gap','source':em['url'],'result':'HTTP '+str(em['http_status']),'owner':'design-system / S5+S7','acceptance':'A live source/fixture and executable behavior scenario are available; retain catalogue entry until then.'})
 if basis!='individual-page':GAPS.append({'id':'jointjs-features:'+c['source_id'],'status':'source-gap-detail','source':c['reference_url'],'result':'Feature list absent on detail; Custom shapes documented in gallery.','owner':'design-system / S5','acceptance':'Use cited gallery feature; qualify actual behavior before claiming implementation.'})
# Explicit algorithmic recipes beyond ELK/Graphviz ensure no algorithm is hidden in apps.
for id,owner,need in [
('shortest-path-algorithm','graph-processing','Dijkstra chemins pondérés ; distinct du routage visuel'),
('find-all-cells-between-2-elements','graph-processing','Sous-graphe/chemins entre éléments'),
('convex-hull-algorithm','graph-scene','Enveloppe convexe de points'),
('msagl-layout','graph-layout','Référence MSAGL : placement automatique ; compat MSAGL exhaustive non revendiquée'),
('directed-graph-layout','graph-layout','Graphe orienté hiérarchique ; référence layout de la démo'),
('hexagonal-grid','graph-layout','Placement grille hexagonale'),
('serpentine-layout','graph-layout','Placement serpentin responsive'),
('force-directed-radial-force','graph-layout','Force contrainte radialement'),
('libavoid-standalone-link-routing','graph-routing','Routage autonome avec ports/obstacles ; libavoid reste référence')]:
 add('jointjs-algorithm:'+id,id,'Processing complémentaire',owner,need,'https://www.jointjs.com/demos/'+id,contributors=['graph-recipes'])

for capability in [r for r in E if r['area']=='Processing complémentaire']:
 slug=capability['entry_key'].split(':',1)[1]
 recipe=next(r for r in E if r['entry_key']=='jointjs-demo:'+slug)
 recipe['capability_refs'].append(capability['entry_key'])
 recipe['contributor_packages']=sorted(set(recipe['contributor_packages']+[capability['owner_package']]))
# Native domain capabilities are explicit, even when a gallery feature is merely Custom shapes.
for id,slug,need in [('uml','uml-class-diagrams','Profil UML versionné : classes/use cases/activité/séquence/statechart, sous-ensembles validés'),('sysml','parametric-diagram','Profil SysML paramétrique versionné, contraintes et ports'),('entity-relationship','data-modeling','Modèle entité-relation natif typé et cardinalités'),('process','flowchart','Profil processus/workflow et transitions, contraintes déclaratives'),('circuit','logic-circuits','Profil circuits/ports et règles de connexion ; simulation applicative séparée')]:
 add('profile:'+id,id,'Domaines et codecs','graph-profiles',need,'https://www.jointjs.com/demos/'+slug,profile_status='Sentropic profile target, not a claim of upstream normative completeness')
domain_recipes={
 'codec:bpmn-native':['bpmn-editor','bpmn-pools-swimlanes-milestones','visio-bpmn-import','visio-bpmn-export'],
 'codec:bpmn-xml-di':['bpmn-editor','bpmn-pools-swimlanes-milestones'],
 'codec:archimate-native':['the-archimate-enterprise-architecture-modeling-language'],
 'codec:visio-vsdx':['visio-bpmn-import','visio-bpmn-export','visio-org-chart-import','visio-flowchart-import'],
 'profile:uml':['uml-class-diagrams','use-case-diagram','activity-diagram','sequence-diagram','uml-statechart-diagram','uml-class-shape-inspector'],
 'profile:sysml':['parametric-diagram'],
 'profile:entity-relationship':['data-modeling','database'],
 'profile:process':['workflow-builder','flowchart','finite-state-machines','petri-nets'],
 'profile:circuit':['logic-circuits','dwdm-circuit','electric-generator','scada']}
for cap,slugs in domain_recipes.items():
 capability=next(r for r in E if r['entry_key']==cap)
 for slug in slugs:
  recipe=next(r for r in E if r['entry_key']=='jointjs-demo:'+slug)
  recipe['capability_refs'].append(cap)
  recipe['contributor_packages']=sorted(set(recipe['contributor_packages']+[capability['owner_package']]))
# Stable requirements for each actual framework binding, not a wildcard package.
for fw in FW:
 add('adapter:graph-'+fw,'Graph adapter '+fw,'Adaptateurs 4-fw','graph-'+fw,'Même sortie du compilateur et commandes ; tokens DS, renderer lifecycle, SSR/a11y/CSP qualifiés.',MANDATE,'verified-requirement',contributors=['graph-compiler','graph-canvas','design-system-'+fw])
 add('adapter:dataviz-'+fw,'Dataviz adapter '+fw,'Adaptateurs 4-fw','dataviz-'+fw,'Store bridge et totalité des exports/wrappers '+fw+' conservés ; parité vérifiée par composant.','packages/dataviz-'+fw+'/package.json','verified-source',contributors=['dataviz-core','design-system-'+fw])
# No inherited Track ID is treated as a local creation or a claim of acceptance.
for r in E:
 r['contributor_packages']=sorted(set(p for p in r['contributor_packages'] if p!=r['owner_package']))
 r['track_write']='none; conductor owns programme synchronization'
 if 'baseline' in r and 'track_id' in r['baseline']:r['inherited_track_id']=r['baseline']['track_id']

GAPS += [
{'id':'execution','status':'unverified','result':'No upstream engines or JointJS apps executed; no semantic equality or production readiness inferred.','owner':'design-system / M3–M5','acceptance':'Reference-ID fixtures and behavior suites including 4-framework parity.'},
{'id':'elk-browser','status':'unverified','result':'ELK docs include Java/GMF/Graphviz/libavoid connectors; presence ≠ elkjs/browser availability. Source docs are not tied to runtime-tested release.','owner':'design-system / S6','acceptance':'Per-engine Sentropic runtime capability matrix and explicit unsupported diagnostics.'},
{'id':'licenses-integrations','status':'source-gap','result':'JointJS+ commercial source not accessed; third-party integrations and native Graphviz surfaces are coverage references only.','owner':'design-system / S4+S6','acceptance':'Sentropic implementation/port and tests; explicit owner decision only if a new third-party runtime is proposed.'},
{'id':'package-names-registry','status':'unverified','result':'No local manifest collision for new names; npm availability/ownership not audited.','owner':'design-system / release','acceptance':'Read-only npm namespace check before allocating releases; preserve existing package names.'},
{'id':'pins-and-parity','status':'unverified','result':'Compatibility pins, Angular seam line, GeoMap→GeoChart compatibility, WP20 and full apps parity require qualification.','owner':'design-system / S2+S6','acceptance':'Published exact matrix and M1/M3 fixtures; no guessed compatible versions.'}]

# Validate allocation and DAG mechanically before rendering claims.
keys=[r['entry_key'] for r in E];assert len(keys)==len(set(keys)),'duplicate capability'
for r in E:
 assert r['owner_package'] in P,(r['entry_key'],r['owner_package'])
 assert r['sources'] and r['need'],r['entry_key']
 assert all(p in P for p in r['contributor_packages']),r
 assert all(k in keys for k in r.get('capability_refs',[])),r
manifest_by_name={m['manifest']['name']:m['manifest'] for m in LOCAL['manifests']}
for p in P.values():
 manifest=manifest_by_name.get(p['name'],{})
 p['source_manifest_version']=manifest.get('version')
 p['source_dependencies']=manifest.get('dependencies',{})
 p['source_peer_dependencies']=manifest.get('peerDependencies',{})
 p['target_framework_peer_names']=[]
 for fw in FW:
  if p['name'].endswith('-'+fw):p['target_framework_peer_names']={'svelte':['svelte'],'react':['react','react-dom'],'vue':['vue'],'angular':['@angular/core','@angular/common']}[fw]
 assert all(d in P for d in p['dependencies']),p
 p['owned_entry_keys']=[r['entry_key'] for r in E if r['owner_package']==p['name']]
 p['contributing_entry_keys']=[r['entry_key'] for r in E if p['name'] in r['contributor_packages']]
 p['coverage_count']={'owner':len(p['owned_entry_keys']),'contributor':len(p['contributing_entry_keys'])}
seen=set();active=set();order=[]
def visit(n):
 assert n not in active,'package cycle '+n
 if n in seen:return
 active.add(n)
 for d in P[n]['dependencies']:visit(d)
 active.remove(n);seen.add(n);order.append(n)
for n in P:visit(n)
# Full source export compatibility mapping, including aliases/reexports.
compat=[]
module_map={(r.get('source_package'),r.get('sources',[None])[0]):r for r in E if r['area']=='Sentropic modules'}
for s in SRC['exports']:
 o=s['origin'];m=module_map.get((o['package'],o['file']))
 canonical=m['owner_package'] if m else o['package']
 compat.append({'key':s['key'],'public_package':s['source']['package'],'public_export':s['source']['export'],'origin_file':o['file'],'origin_line':o['line'],'canonical_target_package':canonical,'public_name_policy':'preserved; delegation only after compatibility proof'})
counts=dict(collections.Counter(r['area'] for r in E))
build_inputs={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [Path(__file__).resolve(),HERE/'model.py',HERE/'live-evidence.json',HERE/'local-evidence.json',HERE/'source-exports.json',ROOT/'.astra-inputs/graph-dataviz-reference-catalog.json']}
proof={'build_input_sha256':build_inputs,'capability_rows':len(E),'counts_by_area':counts,'original_catalogue_rows':sum(len(BASE[k]) for k in ['elk_algorithms','elk_option_groups','elk_options','graphviz_engines','sentropic_actual_engines','jointjs_apps_and_recipes']),'original_entry_keys_preserved':all(r['entry_key'] in keys for k in ['elk_algorithms','elk_option_groups','elk_options','graphviz_engines','sentropic_actual_engines','jointjs_apps_and_recipes'] for r in BASE[k]),'elk_distinct_option_ids':len(set(r['source_id'] for r in BASE['elk_options'])),'packages':len(P),'new_packages':sum(not p['existing_name'] for p in P.values()),'unassigned_capabilities':0,'duplicate_capabilities':0,'dependency_cycle_count':0,'topological_order':order,'source_export_pairs':len(compat),'live_sources':len(LIVE['sources']),'http_failures':[s for s in LIVE['sources'] if s.get('http_status')!=200],'baseline_live_checks':CHECKS}
artifact={'schema_version':2,'generated_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ratified_decisions':{'D1':'A','D2':'C','D3':'A','D4':'C-prime','D5':'B','D6':'C','D7':'A'},'scope':'Closed official index sets as retrieved; source census; required capabilities. Inventory is not implementation.','proof':proof,'packages':list(P.values()),'entries':E,'gaps':GAPS,'source_export_mapping':compat,'sources':LIVE['sources'],'local_provenance':LOCAL['provenance']}
(ROOT/'docs/graph-dataviz-functional-coverage.json').write_text(json.dumps(artifact,ensure_ascii=False,indent=2)+'\n')
(HERE/'validation.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
# Markdown functions: exact rows, never sample/top-N.
def esc(x):return str(x if x is not None else '—').replace('|','\\|').replace('\n',' ').replace('<','&lt;').replace('>','&gt;')
def table(headers,rows):return '\n'.join(['| '+' | '.join(headers)+' |','|'+'|'.join('---' for _ in headers)+'|']+['| '+' | '.join(esc(v) for v in r)+' |' for r in rows])+'\n'
def short(p):return p.removeprefix('@sentropic/')
def source(r):
 u=r['sources'][0];return '[source]('+u+')' if u.startswith('http') else '`'+u+'`'
def select(area):return [r for r in E if r['area']==area]
def pkglabel(r):return '`'+r['owner_package']+'`'

md='''# Étude fonctionnelle exhaustive graph + dataviz

État : lane DESIGN, couverture inventoriée et affectée ; implémentation et qualification ouvertes. D1=A, D2=C, D3=A, D4=C′, D5=B, D6=C, D7=A appliquées. Les références tierces ne deviennent pas des dépendances runtime.

## 1. Ce qui constitue la preuve

Le catalogue fourni est **augmenté**, avec ses identifiants d’origine conservés. Trois preuves distinctes : `verified-reference` = présence documentaire et données extraites ; `verified-source` = code source présent et recensé ; `verified-requirement` = capacité demandée par le mandat. Aucun de ces états ne signifie `implemented`, conformité normative, ni qualification runtime. Les champs JSON séparent ces axes.

Le périmètre externe est borné par les index officiels, leurs pages détaillées, leur pagination et le sitemap, aux dates de lecture enregistrées par source. « Toutes les bibliothèques au monde » n’est pas un ensemble démontrable ; ici ELK, Graphviz, chaque démo JointJS et toutes les surfaces source Sentropic du mandat ont des identifiants explicites. MSAGL/Dagre/libavoid cités par des démos sont enregistrés comme références supplémentaires ; leur API entière n’est pas assimilée à celle d’ELK.

Sources originales : `.astra-inputs/graph-dataviz-reference-catalog.{md,json}`, source-map, audit DS, inv-graphify-graph, inv-dataviz, mandat et notes owner. Les entrées ont des granularités distinctes (option, algorithme, module, feature, recette) : leur total ne désigne pas autant de fonctions indépendantes. Le JSON compagnon contient une ligne par entrée de couverture, le package propriétaire, les contributeurs, la provenance, les métadonnées, les identités initiales et le rattachement export public→propriétaire canonique. La table aire→package figure dans la spec ; les listes exactes par package figurent dans [package-coverage.md](graph-dataviz-study/package-coverage.md).

'''
md+=table(['Ensemble énuméré','Total','Preuve / borne'],[
['ELK algorithmes',21,'Index indépendant = catalogue initial, 21 fiches relues'],['ELK groupes d’options',60,'Axe séparé ; membres et sous-groupes explicites'],['ELK fiches d’options',286,'279 IDs distincts ; 7 fiches supplémentaires de portée fournisseur ; ne pas dédupliquer par ID seul'],['Graphviz moteurs',10,'Index layouts, auteur de plugins exclu'],['Graphviz attributs',177,'Tous attributs, types, défauts, usage et restrictions documentées'],['Graphviz sorties',65,'64 paramètres index + vt-8up2 sur fiche VT100 ; 36 pages ; formats/variantes/surfaces distingués'],['JointJS vues/démos/apps',186,'Union /demos et /all-demos paginés = sitemap, zéro écart'],['JointJS features',61,'Labels officiels individuels, avec correspondance package'],['Sentropic exports source',3547,'Checker TypeScript = parcours AST indépendant ; 6 packages, 1564 identités canoniques'],['DS composants/helpers graphiques',93,'371 couples framework/export runtime au total, React Dashboard absent'],['Entrées de couverture affectées',len(E),'0 oubli d’une entrée initiale, 0 doublon, 0 package absent'],['Packages du graphe cible',len(P),str(sum(not p['existing_name'] for p in P.values()))+' nouveaux + noms existants conservés ; DAG vérifié']])
md+='''
Les dates UTC exactes, statuts HTTP, URLs finales et SHA-256 sont dans [live-evidence.json](graph-dataviz-study/live-evidence.json). La documentation ELK/Graphviz est mouvante : les versions 0.12.0 / 16.1.0 du catalogue initial sont des repères de release, pas une preuve que chaque page correspond à ces binaires. JointJS core 4.3.3 et JointJS+ n’ont pas une version commune prouvée. Aucun runtime upstream n’a été exécuté. Les écarts source/artefact npm restent `unverified`.

### 1.1 Pagination et rapprochement JointJS

'''
md+=table(['Page officielle','URL distinctes sur cette page','Suite découverte'],[[p['url'],len(p['demo_urls']),', '.join(p['pagination_urls']) or 'fin'] for p in LIVE['jointjs_pages']])
md+='''
Les cartes promotionnelles répètent des entrées : les comptes par page ne s’additionnent pas. Les URL sont dédupliquées, puis comparées comme ensembles au sitemap et au catalogue initial. Les 186 fiches sont HTTP 200. **184 destinations embarquées sont accessibles en HTTP ; 2 renvoient 404** (voir gaps). Accessibilité HTTP ne vaut pas exécution. Les 185 fiches comportant une liste de features sont lues intégralement ; `scale-svgmarker` utilise le tag galerie `Custom shapes`, faute de liste sur sa fiche.

Les catégories suivantes sont une **classification analytique Sentropic**, pas des catégories officielles inventées. Les labels galerie supplémentaires sont conservés ; l’appartenance par démo aux tags taxonomiques du site reste source-gap ; `BPMN` dans une carte peut être un tag, pas une 62e feature.

## 2. ELK — algorithmes (axe 1)

Chaque ligne conserve l’ID exact et l’URL. Le libellé « équivalent Sentropic » du catalogue initial reste une piste de réemploi, pas une preuve d’identité algorithmique. Les connecteurs Draw2D/Graphviz/Libavoid ne sont pas présumés exécutables dans elkjs. Toutes les implémentations futures respectent D7=A.

'''
md+=table(['ID source','Algorithme / capacité','Package canonique','Réemploi constaté / limite','Source'],[[r['source_id'],r['name']+' — '+r['need'],pkglabel(r),r['baseline'].get('current_sentropic_equivalent','unverified'),source(r)] for r in select('ELK algorithmes')])
md+='''
## 3. ELK — groupes et options (axe 2)

### 3.1 Tous les groupes

Un groupe n’est pas un algorithme. Options directes et sous-groupes sont distingués pour éviter les doubles comptes. Les options sont aussi recensées depuis leur index indépendant : les pages référencées par les algorithmes/groupes ne suffisent pas à retrouver les 286 fiches.

'''
md+=table(['ID groupe','Options directes (clés de fiche)','Sous-groupes','Package','Source'],[[r['source_id'],', '.join(r['option_keys']) or 'aucune directe',', '.join(r['subgroup_ids']) or 'aucun',pkglabel(r),source(r)] for r in select('ELK groupes options')])
md+='''
### 3.2 Toutes les fiches d’options

Clé de fiche distincte de l’ID : les variantes fournisseur conservent leur page. Domaines/types/défauts proviennent des fiches officielles ; leur transcription n’est pas une qualification des interactions. Les listes de groupes et d’algorithmes supporteurs sont conservées intégralement dans le JSON, ainsi que toute la table de métadonnées source.

'''
md+=table(['Clé de fiche / ID source','Nom et type','Valeurs / défaut / portée','Package','Source'],[[r['entry_key']+' / '+r['source_id'],r['name']+' ; '+r['metadata'].get('Value Type','—'),'; '.join(k+'='+str(r['metadata'][k]) for k in ['Possible Values','Default Value','Lower Bound','Upper Bound','Applies To'] if k in r['metadata']),pkglabel(r),source(r)] for r in select('ELK options')])
md+='\n## 4. Graphviz — moteurs, attributs, sorties\n\n### 4.1 Tous les moteurs/layouts\n\n'
md+=table(['ID','Capacité','Package','Source'],[[r['source_id'],r['need'],pkglabel(r),source(r)] for r in select('Graphviz moteurs')])
md+='''
### 4.2 Tous les attributs

Les 177 attributs sont conservés, même ceux spécifiques au rendu, à une plateforme ou à l’export. Le parser DOT appartient à `graph-codecs` ; la colonne package désigne le propriétaire du **comportement**. Un attribut reconnu mais non implémenté doit être conservé ou diagnostiqué, jamais silencieusement accepté comme fonctionnel. L’absence de restriction explicite dans la table ne prouve pas que tous les moteurs l’appliquent.

'''
md+=table(['Attribut','Usage ; type ; défaut ; min','Fonction / restriction documentée','Package','Source'],[[r['name'],'; '.join(k+'='+str(v) for k,v in r['metadata'].items() if k!='engine_restrictions'),r['need'],pkglabel(r),source(r)] for r in select('Graphviz attributs')])
md+='''
### 4.3 Tous les paramètres de sortie

Un paramètre n’est pas toujours un format de fichier : GTK/X11/CGImage sont des surfaces natives ; Kitty/VT des protocoles terminal ; `ps2` est du PostScript annoté, pas un encodeur PDF. `vml/vmlz` sont documentés mais retirés upstream. Tous ont un propriétaire de capacité, sans prétendre les implémenter ni importer leurs librairies natives. SVG/PNG/PDF conservent en plus leur voie Sentropic actuelle, distincte de la compatibilité Graphviz.

'''
md+=table(['Paramètre','Famille et nature','Statut référence','Package','Source'],[[r['name'],r['family']+' ; '+r['output_kind'],r['reference_status'],pkglabel(r),source(r)] for r in select('Graphviz sorties')])
md+='''
## 5. Moteurs, calculs et surfaces réellement présents chez Sentropic

### 5.1 Moteurs et orchestration identifiés

`forceLayout` transmet les positions ; le calcul Barnes–Hut se trouve dans `graphify/src/graph-layout.ts`. `buildForceGraphData` transforme les données, sans résoudre la simulation. Un worker exécute un calcul ; une sélection de layout dans `scene-layout.ts` reste un raccord consommateur. Les copies DS sont inventoriées comme sources à réutiliser et à faire déléguer, pas comme nouveaux solveurs concurrents.

'''
md+=table(['ID','Fonction constatée','Package canonique cible','Source'],[[r['entry_key'],r['name']+' — '+r['need'],pkglabel(r),source(r)] for r in select('Sentropic moteurs')])
md+='\n### 5.1 bis. Ponts de scène, backends et producteurs hors package\n\n'
md+=table(['Source','Responsabilité / frontière consommateur','Package générique cible','Preuve'],[[r['sources'][0],r['need'],pkglabel(r),r['evidence_status']] for r in select('Sentropic ponts et producteurs')])
md+='''
### 5.2 Chaque module dataviz-core

Toutes les fonctions publiées sont nommées ci-dessous ; types et autres modules des six bibliothèques figurent dans [source-modules.md](graph-dataviz-study/source-modules.md). Le manifeste des [3547 exports](graph-dataviz-study/source-exports.json) et son script AST sont réutilisés du M0 puis revérifiés. Les définitions privées trouvées par lecture servent de points d’entrée, sans être transformées artificiellement en API publique.

'''
md+=table(['Module','Exports canoniques','Rôle source / point d’entrée','Package'],[[r['name'],', '.join(r['exports']),r['need'],pkglabel(r)] for r in select('Sentropic modules') if r.get('source_package')=='@sentropic/dataviz-core'])
md+='''
### 5.3 Toutes les vues/composants graphiques DS recensés

Le détail par framework renvoie au vrai fichier d’implémentation (React délègue souvent à `catalog.tsx`). Chaque contrat garde le nom `@sentropic/design-system-<fw>`. Un composant présent ne prouve pas la parité, notamment WP20. Les entrées ci-dessous sont le corpus graphique de l’audit fourni, pas une prétention de recenser tout le DS.

'''
md+=table(['Vue/helper','Implémentations exactes par framework','Propriétaires de rendu'],[[r['name'],'; '.join(x['framework']+': `'+x['implementation']+'`' for x in r['framework_implementations']),', '.join('`'+x['package']+'`' for x in r['framework_implementations'])] for r in [{ 'name':name,'framework_implementations':[x for x in LOCAL['ds_components'] if x['export']==name]} for name in sorted(set(x['export'] for x in LOCAL['ds_components']))]])
for title,area in [('6. Contrats, pivots et canvas','Contrats et canvas'),('7. Domaines et codecs','Domaines et codecs'),('8. Backends de rendu et composition','Rendu capacités'),('9. Formats Sentropic et mandat complémentaires','Exports Sentropic / mandat'),('10. Adaptateurs qualifiés quatre frameworks','Adaptateurs 4-fw')]:
 md+='\n## '+title+'\n\n'
 md+=table(['ID','Besoin / capacité','Package','État preuve','Source'],[[r['entry_key'],r['need'],pkglabel(r),r['evidence_status'],source(r)] for r in select(area)])
md+='''
Pour PPTX, ni un renommage de PNG ni une impression PDF ne constituent la couverture. Le contrat distingue slide avec image, primitives vectorielles éditables et sémantique du document : chaque mode a un rapport de pertes. HTML interactif/DOM n’est pas automatiquement exportable en vectoriel ; les ressources, polices et régions non représentables sont explicites. JSON document, JSON scène, JSON Graphviz et JSON dashboard ont quatre contrats distincts.

## 11. JointJS — toutes les features et toutes les vues

### 11.1 Features officielles → propriétaires

Les contrats UI appartiennent au contrôleur/thème, avec quatre bindings de rendu distincts. Chaque framework est qualifié séparément. La recette fournit la composition et le scénario.

'''
md+=table(['Feature exacte','Package propriétaire','Contributeurs'],[[r['name'],pkglabel(r),', '.join(r['contributor_packages']) or '—'] for r in select('JointJS features')])
md+='''
### 11.2 Énumération complète des 186 vues/démos/applications

Le besoin reprend la description officielle, sans ajouter des comportements supposés. Les features sont celles de la fiche complète (repli galerie explicitement marqué). Chaque entrée a une recette stable `jointjs/<slug>` dans `@sentropic/graph-recipes`, et quatre routes de host prévues ; le slug est une clé de données, pas 186 sous-chemins npm. Les packages contributifs exacts et les routes sont dans le JSON compagnon. Les intégrations nommées (OpenAI, MSAGL, ELK, Bryntum, Bootstrap, Handsontable…) sont des capacités à adapter par ports, sans dépendance implicitement autorisée.

'''
md+=table(['Vue/démo officielle et URL','Catégorie analytique','Besoin documenté','Toutes les features documentées','Recette / accès'],[[f"[{r['name']}]({r['sources'][0]})",r['category'],r['need'],', '.join(r['features'])+(' [galerie]' if r['feature_basis']!='individual-page' else ''),'`'+r['recipe_id']+'` ; fiche '+str(r['detail_http_status'])+' ; embed '+','.join(str(e['http_status']) for e in r['embedded_sources'])+' ; exécution unverified'] for r in select('JointJS vues et applications')])
md+='\n### 11.3 Algorithmes complémentaires portés par les démos\n\n'
md+=table(['ID','Besoin','Package','Source'],[[r['entry_key'],r['need'],pkglabel(r),source(r)] for r in select('Processing complémentaire')])
md+='\n## 12. Gaps et critères de fermeture\n\n'
md+=table(['Gap','État / résultat','Responsable proposé','Critère observable'],[[g['id'],g['status']+' — '+g['result'],g['owner'],g['acceptance']] for g in GAPS])
md+='''
Les anciens gaps 403 BPMN/ArchiMate sont clos **pour la lecture documentaire**. La démo ArchiMate ne couvre que sa Business Layer selon sa propre description ; le profil natif et le pivot Exchange du mandat ont un périmètre propre. Les détails d’options ELK ont désormais une preuve documentaire (types/domaines/défauts), mais leur implémentation et leurs interactions restent à qualifier.

## 13. Reproduction et contrôle

```bash
# BeautifulSoup est un outil d’audit, pas une dépendance runtime des packages.
python3 -m pip install --target /tmp/gd-study-python beautifulsoup4
PYTHONPATH=/tmp/gd-study-python python3 docs/graph-dataviz-study/collect.py
node docs/graph-dataviz-study/source-exports.audit.mjs
python3 docs/graph-dataviz-study/collect_local.py
python3 docs/graph-dataviz-study/build.py
python3 docs/graph-dataviz-study/verify.py
```

`collect.py` réemploie le cache `/tmp/gd-study-cache`. Pour une nouvelle consultation : `GD_STUDY_REFRESH=1` ou un `GD_STUDY_CACHE` vide. Les dates de fetch par URL font foi, pas la date de génération. Les étapes collect nécessitent les sources locales indiquées ; la vérification des artefacts et la génération restent hors réseau. `source-exports.audit.mjs` réutilise le checker/AST M0 et TypeScript installé dans dataviz ; `--write` n’est utile que pour renouveler intentionnellement son snapshot.

La [validation](graph-dataviz-study/validation.json) vérifie les identités, affectations et l’absence de cycles du **design** ; elle ne prétend pas vérifier les futurs manifests ou la compatibilité binaire. Aucun ledger Track n’a été écrit : les IDs hérités sont conservés à titre de rapprochement pour le conducteur.
'''
(ROOT/'docs/graph-dataviz-functional-coverage.md').write_text(md)
mods='# Tous les modules source et leurs destinations\n\nChaque export canonique est listé ; les aliases par point d’entrée sont dans source-exports.json. M1 conserve toutes les API publiques, M2+ fait déléguer aux propriétaires cibles après preuve.\n\n'
mods+=table(['ID / module source','Package public préservé','Package canonique cible','Exports canoniques (énumération)','Preuve'],[[r['entry_key'],r.get('public_compatibility_package'),r['owner_package'],', '.join(r['exports']) or '(module interne)',r['evidence_status']+' / sha256 '+str(r.get('source_sha256'))] for r in select('Sentropic modules')])
(HERE/'source-modules.md').write_text(mods)
alloc='# Allocation exhaustive par package\n\nGénéré depuis le même modèle que la spec et le DAG. Une capacité a un propriétaire principal ; les contributeurs sont des participations fonctionnelles, pas automatiquement des dépendances statiques. Les références ci-dessous sont les clés exactes du JSON de couverture.\n\n'
for p in P.values():
 alloc+='## '+p['name']+'\n\n'+p['scope']+'\n\n### Propriétaire\n\n'+('\n'.join('- `'+k+'`' for k in p['owned_entry_keys']) or 'Aucune entrée principale ; socle partagé.')+'\n\n### Contributeur\n\n'+('\n'.join('- `'+k+'`' for k in p['contributing_entry_keys']) or 'Aucune contribution supplémentaire.')+'\n\n'
(HERE/'package-coverage.md').write_text(alloc)
print(json.dumps({'rows':len(E),'counts':counts,'packages':len(P),'new_packages':proof['new_packages'],'unassigned':0,'cycles':0},ensure_ascii=False,indent=2))

# Package architecture is generated from exactly the allocation/dependency graph above.
arch='''# SPEC_EVOL_GRAPH_DATAVIZ_PACKAGES — architecture et nommage D5

Révision : étude de complétude du 15–16 septembre 2026. Lane DESIGN ; conducteur **design-system** ; revue fable prévue avant réalisation. Cette spec applique les décisions ratifiées. Elle définit la cible ; elle ne prétend pas que les packages nouveaux sont créés, publiés ou qualifiés.

## 1. Résultat et décisions appliquées

**24 packages graph/dataviz, dont 18 nouveaux et 6 noms existants préservés**, avec six dépendances DS déjà nommées. Le découpage résulte de la nature des contrats, des consommateurs autonomes et des frontières de chargement. Ni ELK ni Graphviz ni JointJS n’apparaissent dans un nom de package Sentropic : ce sont des références de capacités. Les familles d’algorithmes et les recettes deviennent des sous-chemins ou des données, pas une multiplication de packages par fournisseur ou démo.

Le [catalogue fonctionnel](../docs/graph-dataviz-functional-coverage.md) énumère les capacités et leurs sources. Le [JSON compagnon](../docs/graph-dataviz-functional-coverage.json) relie **chaque entrée** au propriétaire et aux contributeurs. [L’allocation inverse](../docs/graph-dataviz-study/package-coverage.md) énumère les clés exactes couvertes par chaque package ; elle fait partie de chaque fiche ci-dessous. Le [catalogue des modules](../docs/graph-dataviz-study/source-modules.md) et le mapping des 3547 exports garantissent le maintien des noms publics.

| Décision ratifiée | Application concrète |
|---|---|
| D1=A | `graph-model` typé ; `graph-profiles` versionnés, migrations et diagnostics explicites. |
| D2=C | Versions indépendantes pour chaque package ; tags `<package-sans-scope>@<semver>`. Aucun nouveau `v*` global. |
| D3=A | Un `graph-compiler` agnostique ; `graph-svelte`, `graph-react`, `graph-vue`, `graph-angular` qualifiés séparément. Les builders dataviz restent partagés dans core. |
| D4=C′ | `dataviz-angular` garde son nom ; seam expérimental sur une ligne de versions distincte, distribué sous `next`. La qualification BI se mesure sur les composants BI, pas sur la tranche diagramme M3. |
| D5=B | Étude exhaustive, noms justifiés et rattachement complet dans cette spec ; aucune décision déjà ratifiée remise en question. |
| D6=C | Versions/pins décidés par matrice de compatibilité vérifiée ; aucun alignement artificiel au numéro du DS ou du core. |
| D7=A | Réutilisation Sentropic puis réimplémentation/adaptateur autonome ; nouveau runtime tiers seulement après décision owner explicite. |

Le JSON de ratification abrège D4 en C ; l’instruction owner et le mandat précisent C′ et prévalent. Les anciens inventaires contiennent deux faits corrigés par le mandat : DS Angular est publié (correction F1), et DashboardGrid fait partie des versions dataviz indiquées par F2. Le tarball local reste un raccord source à remplacer, pas la preuve que le DS n’est pas publié. L’état npm courant n’est pas extrapolé.

## 2. Méthode de découpage et vocabulaire

Un package est justifié lorsque son contrat peut être consommé seul, que son environnement ou sa politique de dépendances diffère, ou que sa qualification exige un cycle propre. Une option ELK, un moteur du même registre, un format dans une famille d’encodeurs et une démo composée ne suffisent pas à créer un package.

| Terme dans le nom | Responsabilité précise | Frontière |
|---|---|---|
| `model` | Identité sémantique, document, occurrences, commandes et ports | Sans géométrie, framework ou persistance imposée |
| `profiles` | Vocabulaires et contraintes métier versionnés | Un schéma de profil ne suit pas automatiquement le SemVer du package |
| `codecs` | Sources et modèles interopérables, AST/CST, rapports de conversion | Aucun encodeur de capture d’écran ni service réseau |
| `processing` | Topologie, sous-graphes, chemins et projections | Dijkstra ne produit pas une route graphique |
| `layout` | Placement, phases, contraintes, registres et options | Résultat géométrique ; familles partageant les contrats |
| `routing` | Trajectoires visuelles, ports et obstacles | Utilisable sans déplacer les nœuds ; dépendance vers le bas depuis layout |
| `scene` | Géométrie, caméra, buffers, picking et métriques | Une scène n’est pas le document sémantique |
| `worker` | Protocole d’exécution hors thread et snapshots | Le transport ne devient pas un solveur |
| `compiler` | Transformation partagée document/vue/profil→scène | Les quatre frameworks n’en possèdent pas une copie |
| `svg`, `dom` | Backends avec environnements et coûts spécifiques | WebGL/Canvas2D restent dans `graph` existant |
| `canvas` | Session et contrôleur d’édition | Ce nom ne force pas le backend Canvas2D |
| `export` | Production d’artefacts et fidélité de sortie | JSON métier délégué aux codecs ; état BI conservé dans dataviz |
| `recipes` | Compositions et scénarios d’applications | Pas un autre moteur UI, pas une bibliothèque par démo |
| suffixe framework | Lifecycle, réactivité, DOM et primitives DS du framework | Aucun état BI ou calcul métier recopié |

Le split `graph-processing` / `graph-layout` est retenu malgré un package supplémentaire : des clients de chemins/projections n’ont besoin ni de solveur ni de géométrie. `graph-routing` reste autonome pour rerouter après déplacement sans recomposer tout un layout. Les profils et codecs partagent des sous-chemins de domaine ; aucun package BPMN/ArchiMate/UML séparé sans besoin de release démontré.

Le package `graph` conserve ses API WebGL/Canvas2D et son entrée `.`. Les extractions se font derrière cette façade. Les cinq packages dataviz conservent tous leurs exports, y compris les réexports de core : ceux-ci ne deviennent pas des copies. Le DS général dépend au plus des calculs purs extraits ; les nouveaux adaptateurs graph consomment le DS et détiennent la composition canvas.

## 3. Flux fonctionnel et modèle formel

```mermaid
flowchart LR
  Sources["Sources texte / XML / JSON / données"] --> Codecs["graph-codecs : parse + rapport pertes"]
  Codecs --> Document["graph-model + graph-profiles : document sémantique"]
  Document --> Views["vues / occurrences / références de source"]
  Views --> Compiler["graph-compiler unique"]
  Compiler --> Projection["projection de processing + contraintes"]
  Projection --> Processing["graph-processing / layout / routing"]
  Processing --> Scene["graph-scene : géométrie + identités + diagnostics"]
  Scene --> Render["graph WebGL/Canvas2D · graph-svg · graph-dom"]
  Scene --> Export["graph-export : SVG PNG PDF PPTX HTML autres"]
  Render --> Bindings["graph-svelte / react / vue / angular"]
  Bindings --> Canvas["graph-canvas : aperçu puis commande"]
  Canvas --> Document
  Data["DataModel / Row"] --> BI["dataviz-core : filtres crossfilter builders état"]
  BI --> BIAdapters["dataviz-svelte / react / vue / angular"]
  BIAdapters --> DS["composants DS contrôlés + thèmes"]
```

Ce diagramme décrit les échanges de données, donc la boucle d’édition. Le **graphe de dépendances de packages** au §6 est, lui, acyclique.

Cinq objets restent distincts : document sémantique ; vues/occurrences ; projection de processing ; géométrie/scène ; sources AST/CST. Les refs identifient les relations aussi bien que les entités, avec références relation→relation et occurrences de liens. Les éléments inconnus des codecs restent en extensions typées ou déclenchent un rapport ; ils ne disparaissent pas silencieusement. Une vue peut montrer plusieurs occurrences d’une même entité et une relation peut traverser des groupes/vues selon le profil.

Les commandes contiennent une cible (entité, relation, occurrence ou vue), une révision attendue et un payload typé. Humain et agent passent par la même validation. Le contrôleur produit un aperçu réversible, puis une transaction atomique, puis une requête de persistance par port. Undo/redo applique l’inverse ou un changement validé ; l’état inter-vues BI reste dans dataviz-core.

Le worker reçoit `protocolVersion`, `documentRevision`, `viewRevision`, `projectionHash`, `jobId`, `generation`, seed et options normalisées. Son résultat contient les mêmes corrélations et une géométrie riche. Une édition invalide l’ancien résultat ; une annulation suivie d’un nouveau job ne réactive jamais l’ancien. Aucun accès global `Worker`, `document` ou `window` à l’import des noyaux. Les mesures texte/images sont injectées et réutilisées au layout, au rendu et à l’export.

## 4. Aire fonctionnelle → packages

Les tableaux détaillés du catalogue ont une destination pour chaque ligne. Ce tableau donne les regroupements ; l’annexe inverse conserve toutes les clés, sans sélection de quelques exemples.

'''
areas={
'Contrats / modèle / commandes':'graph-model, graph-profiles',
'Pivots et AST/CST / JSON sémantique / XML / DSL':'graph-codecs (+ graph-profiles)',
'Parcours / composantes / chemins / projections':'graph-processing',
'21 références ELK, 60 groupes, 286 fiches, 10 moteurs Graphviz':'graph-layout ; libavoid/contraintes de routage → graph-routing',
'177 attributs Graphviz':'graph-codecs parse ; behavior owner par attribut : layout/routing/scene/svg/export',
'Graphify force / hierarchy / registry / grilles / scènes':'graph-layout, graph-worker, graph-compiler, graph-scene ; sélection produit reste graphify',
'Rendu GPU / Canvas2D de compatibilité':'graph',
'SVG / HTML-DOM / composition hybride':'graph-svg, graph-dom ; géométrie commune graph-scene',
'65 sorties Graphviz + PDF PNG SVG JPEG PPTX HTML print':'graph-export ; variantes et surfaces natives explicitement qualifiées',
'GraphML / DOT / mxGraph / XMI / Mermaid / PlantUML / BPMN / ArchiMate / VSDX / Canvas JSON / Cypher / GoogleSQL':'graph-codecs ; projection métier et push réseau restent produits',
'CSV / état et JSON dashboard / builders / crossfilter':'dataviz-core ; wrappers dataviz-<framework> conservés',
'Canvas / outils / édition / sélection / annotations':'graph-canvas ; graph-model validation ; graph-scene picking',
'Compilation commune + DS quatre frameworks':'graph-compiler + graph-svelte/react/vue/angular',
'186 vues JointJS et 61 features':'graph-recipes + propriétaire de chaque feature + quatre graph adapters + hosts docs',
'Charts et helpers DS actuels':'design-system-svelte/react/vue/angular ; calculs purs → layout/scene par tranche compatible',
'Thèmes / tokens':'design-system-themes, design-system-tokens'}
arch+=table(['Aire fonctionnelle','Package(s) cible(s)'],list(areas.items()))
arch+='''
## 5. Fiche de chaque package

Les dépendances ci-dessous sont la **cible après extraction**, pas une modification des manifests pendant cette lane. M1 rapatrie l’existant sans refonte. Les sous-chemins indiqués sont des contrats à créer et qualifier, pas des exports déjà publiés. Pour chaque fiche, la section correspondante de [package-coverage.md](../docs/graph-dataviz-study/package-coverage.md) donne la liste exacte des entrées possédées et contributrices ; les fichiers source et noms d’exports sont dans source-modules.md.

'''
for i,p in enumerate(P.values(),1):
 arch+=f"### 5.{i}. `{p['name']}`\n\n"
 arch+=p['scope']+'\n\n'
 arch+='- **Nom :** '+p['name_rationale']+'\n'
 arch+='- **Couche / environnement :** '+p['layer']+' ; '+p['environment']+'.\n'
 arch+='- **Surface prévue :** '+(', '.join('`'+x+'`' for x in p['subpaths']) or 'API existante conservée')+'.\n'
 arch+='- **Entrées exactes :** [allocation '+p['name']+'](../docs/graph-dataviz-study/package-coverage.md#'+p['name'].replace('@','').replace('/','')+') ; '+str(len(p['owned_entry_keys']))+' entrées principales, '+str(len(p['contributing_entry_keys']))+' contributions. '
 ownareas=collections.Counter(next(r['area'] for r in E if r['entry_key']==k) for k in p['owned_entry_keys'])
 arch+=', '.join(a+' ('+str(n)+')' for a,n in ownareas.items())+'.\n'
 arch+='- **Dépendances internes :** '+(', '.join('`'+d+'`' for d in p['dependencies']) or 'aucune')+'.\n'
 arch+='- **Dépendances externes / peers :** '+(' '.join(p['third_party_dependencies']) if p['third_party_dependencies'] else 'aucun nouveau runtime tiers ; manifests existants conservés en M1, versions effectives par matrice D6')+'\n'
 if p['target_framework_peer_names']:arch+='- **Peers framework cibles :** '+', '.join('`'+n+'`' for n in p['target_framework_peer_names'])+' ; versions selon matrice qualifiée D6.\n'
 if p['source_manifest_version']:
  arch+='- **Manifest source '+p['source_manifest_version']+' :** dependencies '+(', '.join('`'+n+'@'+v+'`' for n,v in p['source_dependencies'].items()) or 'aucune')+' ; peers '+(', '.join('`'+n+'@'+v+'`' for n,v in p['source_peer_dependencies'].items()) or 'aucun')+'. Cette combinaison est un constat source, pas une nouvelle matrice certifiée.\n'
 arch+='- **Réemploi :** '+(p['reuse'] or 'Socle DS existant.')+'\n'
 arch+='- **Version et tag :** '+p['version_policy'].replace(short(p['name'])+'@<version>', '`'+short(p['name'])+'@<version>`')+'.\n'
 arch+='- **Qualification :** '+p['acceptance']+'\n\n'
arch+='''
### 5.31. Pourquoi les applications ne créent pas 186 packages

`graph-recipes/catalog` fournit une collection de définitions typées : `recipeId`, document/profil, configuration de vue et processing, commandes/outils, capability refs, fixtures et scénario de vérification. La clé `jointjs/<slug>` est une donnée stable. Le catalogue énumère individuellement toutes les démos et tous leurs besoins/features ; aucune suppression n’est autorisée au motif qu’une démo est une intégration ou un micro-exemple.

Les hosts sont des applications privées de documentation, pas des bibliothèques publiées supplémentaires. `apps/docs` reçoit une route `graph-recipes/<slug>` avec sélection de framework ; les exemples/îlots React, Vue, Svelte et Angular chargent leur adapter propre. Les routes dans le JSON sont **prévues**, non des liens à des pages déjà construites. L’acceptation de chaque recette exige un écran exécutable et ses interactions, pas uniquement le rendu d’une scène.

Exemples de compositions qui doivent rester explicites :

| Recette identifiée | Besoin de composition | Dépendances de comportement (pas imports tiers) |
|---|---|---|
| `jointjs/bpmn-editor` | Modèle BPMN, XML+DI, palette, validation, inspector, undo/redo, export | profiles/codecs/model/canvas/layout/routing/export + 4 adapters |
| `jointjs/the-archimate-enterprise-architecture-modeling-language` | Business Layer de la démo, connexions explicites/implicites, conteneurs/context menu | profiles/model/canvas/scene ; le pivot Exchange et le profil complet gardent leur propre qualification |
| `jointjs/html-form-ports` | Formulaires HTML avec ports alignés aux champs | dom/scène/routing/canvas + bindings DS |
| `jointjs/bryntum-integration` | Liaison PERT/Gantt et sélection inter-vues | recette + layouts + dataviz par port de host ; Bryntum non ajouté |
| `jointjs/pdf-export` | PDF + PNG/JPEG + SVG + JSON | export/codecs ; continuité PDF Sentropic existante |
| `jointjs/ai-workflow-builder` | Prompts/outils/agents comme blocs connectés, état/simulation d’exemple | modèles/recette/canvas + ports d’intégration ; aucun appel provider requis pour la recette locale |

## 6. DAG complet des packages

Une flèche signifie **importe/dépend de**. Les injections de renderer/transport/stockage depuis un host sont des ports, pas des arêtes statiques supplémentaires. `graph-recipes` contient des définitions ; le host compose les moteurs, adaptateurs, exporteurs et éventuel dataviz. Les dépendances PDF conditionnelles et les peers framework sont énoncés hors du DAG interne.

'''
arch+='```mermaid\nflowchart TB\n'
nodeid={n:'p'+str(i) for i,n in enumerate(P)}
for n in P:arch+='  '+nodeid[n]+'["'+n+'"]\n'
for n,p in P.items():
 for dep in p['dependencies']:arch+='  '+nodeid[n]+' --> '+nodeid[dep]+'\n'
arch+='```\n\n'
arch+='''
Contrôles structurels : aucune couche basse n’importe `graph` façade ; `graph-layout → graph-routing`, jamais l’inverse ; aucun noyau n’importe un framework ; aucun composant DS n’importe canvas, dataviz-core ou recettes. Les composants DS peuvent appeler les sous-chemins **purs** de layout/scene pour retirer les quatre simulations dupliquées. Le registre de tous les solveurs n’est pas importé par `ForceGraph`. `graph-export` ne remonte pas vers les adapters ; les adapters dataviz gardent des façades vers ses helpers à chargement différé.

Ce graphe comporte 30 packages, incluant les six socles DS préexistants ; une traversée topologique du JSON produit zéro cycle. Les futures dépendances statiques, conditionnelles, workers et types devront toutes passer le même contrôle sur les manifests/artefacts réels.

## 7. Qualification, versions, tags et pins

Quatre versions ne doivent jamais être confondues : **SemVer du package**, **version du schéma Document**, **identifiant/version du profil**, **version du protocole worker**. Un profil expose au minimum son ID, version, schéma, migrations, contrat document compatible et capabilities. Le changelog décrit les changements de sémantique des algorithmes et des options ; l’ID source externe reste une référence, pas un prétexte pour modifier silencieusement un comportement.

Le tag exact de release est `<nom-sans-@sentropic/>@<semver>`, par exemple `graph-layout@0.1.0` ou `dataviz-core@0.4.53` **à titre de syntaxe**, sans annoncer ces releases. Le bump d’un moteur n’entraîne pas celui des thèmes ou de tous les adapters. Les workflows choisissent le package à partir du préfixe, vérifient sa version/artefact et utilisent OIDC/trusted publishing. La politique de provenance ne rajoute aucun trailer d’attribution aux commits.

La ligne du seam Angular et la future ligne pleinement qualifiée sont distinctes. Exemple de forme : `dataviz-angular@0.5.0-seam.1` avec dist-tag `next`, future ligne complète `1.x` sous `latest` après gates ; les numéros définitifs restent à allouer d’après le registre. Pas de promotion automatique `next→latest`, pas de lockstep imposé aux autres packages et pas d’assimilation à l’API diagramme M3.

Une ligne de matrice D6 contient les versions exactes productrices et consommatrices, environnement, build/types/pack/SSR, comportement et preuve. Les ranges de peers expriment le support qualifié ; un pin d’application/fixture assure la reproductibilité. Une range permissive n’est pas une preuve de compatibilité. Champs minimaux :

| Dimension | À conserver / qualifier |
|---|---|
| graphe | package graph, model/schema, profils/version, scene, layout/routing, compiler, protocole worker |
| framework | package adapter, framework peer exact, DS, themes et moteur choisi |
| BI | dataviz-core, dataviz-framework, DS, export, état/schema et contrats WP20 |
| capacités | ID reference, statut implemented/partial/unsupported, fixture, limites et diagnostics |
| publication | tag préfixé, dist-tag, versions résolues, tarball/import/CSS/assets, provenance/OIDC |

Les manifests sources donnent le point de départ (graph 0.2.0 ; dataviz 0.4.52 ; DS Svelte 0.35.0, DS React/Vue/Angular 0.37.0 dans ce checkout). Ils ne valident pas automatiquement leur combinaison. Les peers graph adapters sont explicitement Svelte `svelte`, React `react` + `react-dom`, Vue `vue`, Angular `@angular/core` + `@angular/common` ; versions prises dans les lignes qualifiées, sans intervalle inventé ici.

## 8. Politique tiers et coût de chargement

ELK/elkjs, Graphviz/viz.js/WASM, diagram-js/bpmn-js, JointJS/JointJS+, MSAGL/Dagre et bibliothèques citées par une démo ne sont **aucune** dépendance nouvelle autorisée. Les compatibilités de formats et d’options se construisent par réemploi puis implémentation autonome ou port. La présence d’un format exotique dans la table ne justifie pas d’importer Cairo, GTK, X11 ou un encodeur natif.

`jspdf` et `svg2pdf.js` sont déjà déclarés et chargés à la demande par dataviz Svelte/React/Vue. M1 les conserve ; l’extraction vers `graph-export/pdf` garde cette continuité et ses tests. Elle ne rend pas ces imports obligatoires à la racine `graph-export`, ni dans model/layout/dataviz-core. Les helpers restent publiquement accessibles par les adapters existants. Graphology et ses extensions de connaissance/retrieval, PDF viewer, stockage Neo4j/Spanner et providers d’IA restent dans les produits consommateurs.

Les sous-chemins lourds sont explicitement isolés : parsers de dialectes, solveurs spécialisés, PDF/PPTX, backends browser et workers. Le critère observable est un import minimal de modèle, CSV ou layout dans Node sans DOM qui ne charge ni renderer, ni framework, ni PDF. La configuration `exports` et `sideEffects` doit rendre cette isolation réelle ; écrire seulement « lazy » dans la doc ne suffit pas.

## 9. Réemploi et migration par tranches

| Lot mandat | Travail concret de package | Sortie vérifiable |
|---|---|---|
| M1 | Rapatrier graph et les cinq dataviz intacts, APIs/peer/CSS/licences/provenance et tests ; corriger raccords workspace | 3547 couples export conservés, import ESM/CJS/types, tarballs, quatre adapters inclus ; aucun renommage |
| M2 | Introduire model/profiles/scene/processing/layout/routing/worker/canvas/compilation ; extraire calculs Sentropic derrière façades | Une implémentation canonique, schémas et commandes testés, worker périmé rejeté, aucune copie active divergente |
| M3 | Diagramme éditable complet, SVG/WebGL et saisie HTML, quatre bindings, profils BPMN/ArchiMate natifs | Scénario vertical par framework, focus/IME/undo/routage/export, diagnostics visibles |
| M4 | Codecs de pivots, encodages d’artefacts et rapports pertes | Fixtures par dialecte/version ; PDF/PNG/SVG régressions et PPTX qualifié selon mode |
| M5 | Toutes entrées ELK/Graphviz, 186 recettes/61 features et formats supplémentaires | Matrice par ID, implémentation ou gap explicite ; options/contraintes et écrans démontrés |
| M6 | Graphify/dataviz/Sentropic consomment le canonique DS, release/adoption et retrait des anciennes voies | Imports consommateurs, preuve de distribution, double implémentation retirée après bascule vérifiée |

Le choix de layout par variable d’environnement, l’ingestion, l’evidence/knowledge et les projections métier restent dans graphify. Les exports GraphML/Cypher/Spanner/Obsidian y possèdent aujourd’hui des paramètres métier ; seuls les encodeurs/primitives génériques se raccordent aux nouveaux codecs. Les commandes de push vers une base ne sont pas rapatriées avec l’encodeur texte.

Chaque item du conducteur garde un propriétaire principal dans les streams existants S1–S7 ; les dépendances sont liées, non copiées. Cette lane n’a pas écrit Track ni fabriqué d’acceptation. Les clés et IDs hérités du catalogue restent des références à rapprocher par le conducteur.

## 10. Revue de conception et points encore à arbitrer

Deux lectures indépendantes ont challengé la preuve documentaire et les frontières de packages. Corrections intégrées : 65 paramètres de sortie au lieu de 36 pages ; vrai corpus de calculs DS ; catégories JointJS explicitement analytiques ; repli `scale-svgmarker` ; cache rafraîchissable ; séparation processing/layout ; nom `graph-compiler` ; recettes avec hosts exécutables ; séparation codecs/export ; versions de profils et protocoles ; imports workers sans global browser. Le détail est dans [review-notes.md](../docs/graph-dataviz-study/review-notes.md). **La revue fable prévue reste à effectuer.**

Aucune des sept décisions n’attend une nouvelle ratification. Les choix d’implémentation ordinaires et les pins sont du ressort de la qualification. Un arbitrage owner deviendrait nécessaire si un lot proposait : (a) une nouvelle dépendance runtime tierce ou l’accès à une source commerciale, (b) une réduction du périmètre exhaustif, (c) une perte de fidélité acceptée comme engagement produit malgré un profil/format requis. Aucun de ces écarts n’est autorisé ni consommé par cette spec. La profondeur normative et les objectifs de performance seront précisés par fixtures dans le plan ; une démo fonctionnelle seule ne constitue pas une conformité BPMN/ArchiMate/UML.

## CHECKPOINT

'''
arch+=f"**Livré :** {len(E)} entrées de couverture affectées, {len(compat)} mappings package/export, 24 packages graph/dataviz détaillés (18 nouveaux), six socles DS conservés, DAG de 30 nœuds sans cycle.\n\n"
arch+='''**Exhaustif prouvé sur les ensembles consultés :** 21 algorithmes ELK, 60 groupes, 286 fiches/279 IDs d’options ; 10 moteurs et 177 attributs Graphviz ; 65 paramètres de sortie ; 186 URL JointJS identiques entre galeries paginées et sitemap, leurs besoins/features documentés ; toutes les surfaces des six packages source conservées, moteurs hors package et calculs DS complémentaires explicités.

**Gaps restants :** deux démos embarquées HTTP 404, une fiche sans liste de features détaillée, code commercial non accessible, exécution/parité/conformité runtime non qualifiées, versions npm futures/pins non validés. Catalogue et architecture sont produits ; le programme de migration/implémentation reste ouvert.

**Prochaine étape du conducteur :** revue fable de ces artefacts, intégration de l’allocation dans les items existants puis réalisation M1/M2 sous les décisions ratifiées. Aucun build de package, aucune publication, aucun commit ni mutation Track n’a été réalisé dans cette lane.
'''
(ROOT/'spec/SPEC_EVOL_GRAPH_DATAVIZ_PACKAGES.md').write_text(arch)
