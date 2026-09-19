#!/usr/bin/env python3
"""Read-only official-source census. Requires beautifulsoup4 (audit tool only).
Run: PYTHONPATH=/tmp/gd-study-python python3 docs/graph-dataviz-study/collect.py
HTTP bodies are cached in /tmp/gd-study-cache; evidence is stored beside this script.
No upstream program or demonstration is executed.
"""
import concurrent.futures as cf
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import urllib.error
import urllib.parse as up
import urllib.request as req
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
CACHE=Path(os.environ.get('GD_STUDY_CACHE','/tmp/gd-study-cache'));CACHE.mkdir(exist_ok=True)
BASE=json.loads((ROOT/'.astra-inputs/graph-dataviz-reference-catalog.json').read_text())
SOURCES={}
def fetch(url):
    key=hashlib.sha256(url.encode()).hexdigest(); body=CACHE/(key+'.body');meta=CACHE/(key+'.json')
    if meta.exists() and os.environ.get('GD_STUDY_REFRESH') != '1':
        m=json.loads(meta.read_text());b=body.read_bytes() if body.exists() else b''
    else:
        m={'url':url,'fetched_at_utc':dt.datetime.now(dt.timezone.utc).isoformat()};b=b''
        try:
            with req.urlopen(req.Request(url,headers={'User-Agent':'Mozilla/5.0 (Sentropic coverage study)'}),timeout=35) as r:
                b=r.read();m.update(http_status=r.status,final_url=r.url,last_modified=r.headers.get('Last-Modified'))
        except Exception as e:m.update(http_status=getattr(e,'code',None),error=str(e))
        m.update(bytes=len(b),sha256=hashlib.sha256(b).hexdigest() if b else None)
        if b:body.write_bytes(b)
        meta.write_text(json.dumps(m))
    SOURCES[url]=m
    return BeautifulSoup(b,'html.parser'),m

def pool(urls):
    with cf.ThreadPoolExecutor(max_workers=10) as ex:
        return dict(zip(urls,ex.map(fetch,urls)))
def txt(e):return ' '.join(e.get_text(' ',strip=True).split()) if e else ''

def tables(s):return [[ [txt(c) for c in tr.find_all(['td','th'],recursive=False)] for tr in t.select('tr')] for t in s.select('table')]

# Independent index sets, not the input catalogue's own count.
indexes={}
for label,url in [('elk_algorithms','https://eclipse.dev/elk/reference/algorithms.html'),('elk_option_groups','https://eclipse.dev/elk/reference/groups.html'),('elk_options','https://eclipse.dev/elk/reference/options.html')]:
    s,m=fetch(url);rows=[]
    for tr in s.select('table tr'):
        cells=tr.find_all('td',recursive=False)
        if len(cells)>=2 and cells[0].find('a'):
            a=cells[0].find('a');rows.append({'name':txt(a),'source_id':txt(cells[1]),'reference_url':up.urljoin(url,a['href'])})
    indexes[label]={'source_url':url,'rows':rows}
print('ELK indexes',[(k,len(v['rows'])) for k,v in indexes.items()],flush=True)
s,m=fetch('https://graphviz.org/docs/layouts/')
engines={}
for a in s.select('main a[href]'):
    u=up.urljoin(m['url'],a['href']);p=up.urlparse(u).path
    if re.fullmatch('/docs/layouts/[^/]+/',p) and not p.endswith('/writing-layout-plugins/'):
        engines[u]={'name':txt(a),'source_id':p.split('/')[-2],'reference_url':u}
indexes['graphviz_engines']={'source_url':m['url'],'rows':list(engines.values())}
s,m=fetch('https://graphviz.org/doc/info/attrs.html');attrs=[]
for tr in s.select('table')[0].select('tr'):
    cs=tr.find_all('td',recursive=False)
    if len(cs)==6:
        a=cs[0].find('a');attrs.append(dict(zip(['source_id','used_by','type','default','minimum','description'],map(txt,cs)),reference_url=up.urljoin(m['url'],a['href']),engine_restrictions=[txt(x) for x in cs[5].select('a[href*="/layouts/"]')]))
indexes['graphviz_attributes']={'source_url':m['url'],'rows':attrs}
s,m=fetch('https://graphviz.org/docs/outputs/');formats={}
for a in s.select('main a[href]'):
    u=up.urljoin(m['url'],a['href']);p=up.urlparse(u).path
    if re.fullmatch('/docs/outputs/[^/]+/',p):
        clean=u.split('#')[0];formats.setdefault(clean,{'source_id':p.split('/')[-2],'name':txt(a),'reference_url':clean,'index_labels':[]})['index_labels'].append(txt(a))
for tr in s.select('table tr'):
    cs=tr.find_all('td',recursive=False)
    if len(cs)==3 and cs[0].find('a'):
        u=up.urljoin(m['url'],cs[0].find('a')['href'])
        formats[u]['index_parameters']=[txt(c) for c in cs[1].select('code')]
        formats[u]['description']=txt(cs[2])
indexes['graphviz_outputs']={'source_url':m['url'],'rows':list(formats.values())}

# Follow actual CMS pagination on both gallery entry points; compare with sitemap.
queue=['https://www.jointjs.com/demos','https://www.jointjs.com/all-demos'];seen=set();cards={};pages=[]
while queue:
    url=queue.pop(0)
    if url in seen:continue
    seen.add(url);s,m=fetch(url);page_urls=set()
    for a in s.select('a[href]'):
        u=up.urljoin(url,a['href']);p=up.urlparse(u).path
        if re.fullmatch('/demos/[^/]+',p):
            u='https://www.jointjs.com'+p;page_urls.add(u)
            item=a.find_parent(class_='w-dyn-item') or a.parent
            title=item.find(['h3','h2','h4'])
            desc=item.select_one('._16px_text')
            card=cards.setdefault(u,{'source_id':p.split('/')[-1],'reference_url':u,'name':txt(title),'card_descriptions':[],'card_texts':[],'index_urls':[]})
            if not card['name']:card['name']=txt(title)
            category=txt(item.select_one('[fs-cmsfilter-field="type"]'))
            if category:card['official_category']=category
            license_label=txt(item.select_one('[fs-cmsfilter-field="license"]'))
            if license_label:card['license_marker']=license_label
            tags=[txt(e) for e in item.select('.featured_tags .demos-tags')]
            card['index_features']=list(dict.fromkeys(card.get('index_features',[])+tags))
            card['gallery_full_labels']=list(dict.fromkeys(card.get('gallery_full_labels',[])+[txt(e) for e in item.select('[id="tag-item"]')]))
            for k,v in [('card_descriptions',txt(desc)),('card_texts',txt(item)),('index_urls',url)]:
                if v and v not in card[k]:card[k].append(v)
        if '_page=' in a['href']:
            dest=up.urljoin(url,a['href'])
            if up.urlparse(dest).path in ['/demos','/all-demos'] and dest not in seen:queue.append(dest)
    pages.append({'url':url,'http_status':m.get('http_status'),'demo_urls':sorted(page_urls),'pagination_urls':sorted(set(up.urljoin(url,a['href']) for a in s.select('a[href*="_page="]')))})
    print('JointJS page',url,len(page_urls),flush=True)
s,m=fetch('https://www.jointjs.com/sitemap.xml')
sitemap_urls=sorted(set(re.findall(r'https://www\.jointjs\.com/demos/[^<\s]+',str(s))))
for u in sitemap_urls:
    cards.setdefault(u,{'source_id':up.urlparse(u).path.split('/')[-1],'reference_url':u,'name':'','card_descriptions':[],'card_texts':[],'index_urls':['https://www.jointjs.com/sitemap.xml']})
print('JointJS union',len(cards),'sitemap',len(sitemap_urls),flush=True)
# Every reference page, not only a subset. The details are evidence, not runtime qualification.
urls=sorted(set([r['reference_url'] for v in indexes.values() for r in v['rows']]+list(cards)))
responses=pool(urls)
details={}
for url,(s,m) in responses.items():
    main=s.select_one('.col-sm-9') or s.select_one('.td-content') or s.select_one('main') or s.select_one('article') or s.body or s
    for e in main.select('script,style,nav,footer'):e.decompose()
    details[url]={'http_status':m.get('http_status'),'title':txt(s.find('h1')) or txt(s.title),'description':(s.select_one('meta[name="description"]') or {}).get('content',''),'tables':tables(main),'headings':[txt(e) for e in main.select('h2,h3,h4')],'text':txt(main),'links':[{'text':txt(a),'url':up.urljoin(url,a['href'])} for a in main.select('a[href]')]}
    if url in cards:
        c=cards[url];c['detail_http_status']=m.get('http_status');c['detail_title']=details[url]['title'];c['detail_description']=details[url]['description'];c['detail_headings']=details[url]['headings']
        if not c['name']:c['name']=c['detail_title'] or c['source_id']
        c['detail_features']=list(dict.fromkeys(txt(e) for e in s.select('.modal_features .demos-tags') if txt(e)))
        c['embedded_demo_urls']=sorted(set(up.urljoin(url,a.get('src','')) for a in s.select('iframe[src]')))
embedded_urls=sorted(set(u for c in cards.values() for u in c['embedded_demo_urls']))
embedded_responses=pool(embedded_urls)
for c in cards.values():
    c['embedded_sources']=[{'url':u,'http_status':embedded_responses[u][1].get('http_status'),'title':txt(embedded_responses[u][0].title),'execution_status':'unverified; HTTP only; no application execution'} for u in c['embedded_demo_urls']]
print('Embeds checked',len(embedded_urls),flush=True)
result={'schema_version':1,'generated_at_utc':dt.datetime.now(dt.timezone.utc).isoformat(),'indexes':indexes,'jointjs_pages':pages,'jointjs_sitemap_demo_urls':sitemap_urls,'jointjs_cards':list(cards.values()),'details':details,'sources':sorted(SOURCES.values(),key=lambda x:x['url'])}
(OUT/'live-evidence.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('Saved',len(SOURCES),'sources;',[(k,len(v['rows'])) for k,v in indexes.items()],flush=True)
print('Failures',[(m['url'],m.get('http_status'),m.get('error')) for m in SOURCES.values() if m.get('http_status')!=200],flush=True)
