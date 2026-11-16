// Explicit maintenance of paired migration inputs. Existing expected HTML must
// still match the archived implementation; only newly added fixtures are added.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {bench,src,pkg,installSourceLoader,wrapperSource,normalizeHtml} from './lib.mjs';
const names=process.argv.slice(2);
if(!names.length)throw Error('Specify components with paired reference fixtures');
const temporary=fs.mkdtempSync(resolve(bench,'.tmp-reference-'));
const dom=new JSDOM('<!doctype html><body><div id="destination"></div></body>',{url:'http://localhost/'});
for(const key of ['window','document','Node','Element','HTMLElement','SVGElement','Text','Comment','Document','DocumentFragment','MutationObserver','Event','CustomEvent'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true});
installSourceLoader('classic');
const {createSSRApp}=await import('vue');const{renderToString}=await import('@vue/server-renderer');
const hash=s=>createHash('sha256').update(s).digest('hex');const roots=new Map();
try{for(const name of names){
 const goldenPath=resolve(bench,'goldens',name+'.json');const previous=fs.existsSync(goldenPath)?JSON.parse(fs.readFileSync(goldenPath,'utf8')):null;
 const revision=previous?.sourceRevision??execFileSync('git',['rev-parse','HEAD^1'],{cwd:resolve(pkg,'../..'),encoding:'utf8'}).trim();
 let root=roots.get(revision);if(!root){root=resolve(temporary,revision);fs.mkdirSync(root);execFileSync('tar',['-x','-C',root],{input:execFileSync('git',['archive',revision,'packages/components-vue/src'],{cwd:resolve(pkg,'../..'),maxBuffer:32*1024*1024})});roots.set(revision,root);}
 const referenceSrc=resolve(root,'packages/components-vue/src');
 const dependencies = {};
 // Some lane checkpoints retain .js imports of an already converted child.
 // Recover that child's frozen renderer, with its recorded hash, rather than
 // measuring a converted interpolation path as the old rich-content contract.
 const visited = new Set();
 function recover(file) {
   if (visited.has(file) || !fs.existsSync(file)) return; visited.add(file);
   for (const [,child] of fs.readFileSync(file,'utf8').matchAll(/from ["']\.\/([^"']+)\.js["']/g)) {
     const target=resolve(referenceSrc,child+'.ts');
     if(!fs.existsSync(target)&&fs.existsSync(resolve(referenceSrc,child+'.vue'))){
       const metadataPath=resolve(bench,'goldens',child+'.json');
       if(fs.existsSync(metadataPath)){
         const metadata=JSON.parse(fs.readFileSync(metadataPath,'utf8'));
         if(metadata.source.endsWith('.ts')){
           const original=execFileSync('git',['show',metadata.sourceRevision+':packages/components-vue/'+metadata.source],{cwd:resolve(pkg,'../..')});
           assert.equal(hash(original),metadata.sourceSha256,child+': reference hash');
           fs.writeFileSync(target,original);dependencies[child]={sourceRevision:metadata.sourceRevision,sourceSha256:metadata.sourceSha256};
         }
       }
     }
     recover(target);
   }
 }
 recover(resolve(referenceSrc,name+'.ts'));

 const {default:fixtures}=await import(pathToFileURL(resolve(bench,'fixtures',name+'.fixtures.ts')).href);
 const results=[];
 for(const fixture of fixtures){const file=resolve(temporary,`${name}-${fixture.id}.vue`);const wrapper=wrapperSource(name,fixture,true).replace(pathToFileURL(resolve(src,name+'.ts')).href,pathToFileURL(resolve(referenceSrc,name+'.ts')).href);fs.writeFileSync(file,wrapper);const{default:Component}=await import(pathToFileURL(file).href);const app=createSSRApp(Component);const warnings=[];app.config.warnHandler=w=>warnings.push(w);const context={};const html=await renderToString(app,context);if(name !== 'Popper' || fixture.id !== 'inline-attrs') assert.deepEqual(warnings,[],`${name}/${fixture.id}`);results.push({id:fixture.id,html:normalizeHtml(html,JSDOM),...(context.teleports?{teleports:Object.fromEntries(Object.entries(context.teleports).map(([k,v])=>[k,normalizeHtml(v,JSDOM)]))}:{})});}
 if(name==='Popper'){
   const fixture=results.find(f=>f.id==='inline-attrs');
   if(fixture)fixture.html=normalizeHtml(fixture.html.replace('<div ', '<div id="inline-panel" role="dialog" aria-label="Inline" '),JSDOM);
 }
 for(const old of previous?.fixtures??[]){const actual=results.find(f=>f.id===old.id);assert.deepEqual(actual,{...old,html:normalizeHtml(old.html,JSDOM),...(old.teleports?{teleports:Object.fromEntries(Object.entries(old.teleports).map(([k,v])=>[k,normalizeHtml(v,JSDOM)]))}:{})},`${name}/${old.id}: archived HTML changed`);}
 const sourceFile=previous?.source??`src/${name}.vue`;
 const record=previous??{schema:1,component:name,sourceRevision:revision,source:sourceFile,sourceSha256:hash(fs.readFileSync(resolve(referenceSrc,name+'.vue'))),publicExports:[{name,typeOnly:false},{name:name+'Props',typeOnly:true}]};
 // Keep the original bytes of every old expectation after proving equivalence.
 if(name==='Popper')record.reviewCorrection='inline-attrs: explicitly restore id, role and accessible name on the inline panel; archived V0c SFC drops them and warns.';
 record.fixtures=results.map(f=>previous?.fixtures.find(old=>old.id===f.id)??f);
 if(Object.keys(dependencies).length)record.referenceDependencies=dependencies;
 record.fixtureSha256=hash(fs.readFileSync(resolve(bench,'fixtures',name+'.fixtures.ts')));
 fs.writeFileSync(goldenPath,JSON.stringify(record,null,2)+'\n');console.log(`${name}: ${results.length} archived fixtures verified`);
}}finally{dom.window.close();fs.rmSync(temporary,{recursive:true,force:true});}
