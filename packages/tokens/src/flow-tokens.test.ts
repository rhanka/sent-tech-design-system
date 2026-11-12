/// <reference types="vite/client" />
import { describe,expect,it } from "vitest";
import { createComponent,component } from "./component.js";
import { semantic } from "./semantic.js";
import { componentDark } from "./component.dark.js";
import { DEFAULT_FLOW_TOKENS } from "../../diagram-canvas/dist/index.js";
const themes=import.meta.glob<{[key:string]:unknown}>(["../../theme-*/src/index.ts","../../themes/src/themes/*.ts"],{eager:true});
type RGB=readonly number[];
const gamma=(value:number)=>value<=0.0031308?12.92*value:1.055*Math.pow(value,1/2.4)-0.055;
function color(text:string):RGB{
 if(/^#[0-9a-f]{3}$/i.test(text))return [...text.slice(1)].map((c)=>parseInt(c+c,16)/255);
 if(/^#[0-9a-f]{6}$/i.test(text))return [1,3,5].map((i)=>parseInt(text.slice(i,i+2),16)/255);
 const values=text.match(/[-+]?\d*\.?\d+/g)?.map(Number)??[];
 if(text.startsWith("oklch")){
  const[L0,C=0,h=0]=values,L=(L0??0)/(text.includes("%")?100:1),a=C*Math.cos(h*Math.PI/180),b=C*Math.sin(h*Math.PI/180);
  const l=(L+0.3963377774*a+0.2158037573*b)**3,m=(L-0.1055613458*a-0.0638541728*b)**3,s=(L-0.0894841775*a-1.291485548*b)**3;
  return [4.0767416621*l-3.3077115913*m+0.2309699292*s,-1.2684380046*l+2.6097574011*m-0.3413193965*s,-0.0041960863*l-0.7034186147*m+1.707614701*s].map((v)=>Math.max(0,Math.min(1,gamma(v))));
 }
 if(text.startsWith("hsl")){const[h=0,s0=0,l0=0]=values,s=s0/100,l=l0/100;const a=s*Math.min(l,1-l);return[0,8,4].map((n)=>{const k=(n+h/30)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1));});}
 if(text.startsWith("rgb"))return values.slice(0,3).map((v)=>v/255);
 throw Error("unsupported color "+text);
}
const mix=(a:RGB,b:RGB,alpha:number)=>a.map((v,i)=>v*alpha+b[i]!*(1-alpha));
const luminance=(rgb:RGB)=>rgb.map((v)=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i]!,0);
const ratio=(a:RGB,b:RGB)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
describe("DC-2c A14 frozen geometry and contrast",()=>{
 it("pins engine numbers and geometry in both modes",()=>{
  for(const c of [component,componentDark])for(const[key,value]of Object.entries(DEFAULT_FLOW_TOKENS))expect(c.diagramScene[key as keyof typeof c.diagramScene]).toBe(String(value));
  expect(component.diagramScene.flowBadgeFontSize).toBe("16px");expect(component.diagramScene.flowBadgeLineHeight).toBe("20px");expect(component.diagramScene.flowDimOpacity).toBe("0.6");
 });
 it("keeps text, pressed text, strokes and focus contrast in every shipped theme mode, including dimming",()=>{
  let modes=0;
  for(const[path,module]of Object.entries(themes))for(const theme of new Set(Object.values(module))){
   if(theme===null||typeof theme!=="object"||!("tokens"in theme))continue;
   const typed=theme as {tokens:{semantic:Parameters<typeof createComponent>[0];foundation:Parameters<typeof createComponent>[1]};tokensDark?:{semantic:Parameters<typeof createComponent>[0];foundation:Parameters<typeof createComponent>[1]}};
   for(const[mode,tokens]of Object.entries({light:typed.tokens,...(typed.tokensDark?{dark:typed.tokensDark}:{})})){
    const c=createComponent(tokens.semantic,tokens.foundation).diagramScene,bg=color(c.flowBadgeBackground),surface=color(tokens.semantic.surface.default);
    for(const alpha of [1,Number(c.flowDimOpacity)]){
     const restBg=mix(bg,surface,alpha),pressedBg=mix(color(c.flowPrimaryStroke),surface,alpha);
     expect(ratio(mix(color(c.flowBadgeText),surface,alpha),restBg),path+" "+mode+" rest "+alpha).toBeGreaterThanOrEqual(4.5);
     expect(ratio(mix(bg,surface,alpha),pressedBg),path+" "+mode+" pressed "+alpha).toBeGreaterThanOrEqual(4.5);
     for(const leaf of ["flowStroke","flowPrimaryStroke","flowFocusOutline"]as const)expect(ratio(mix(color(c[leaf]),surface,alpha),surface),path+" "+mode+" "+leaf).toBeGreaterThanOrEqual(3);
    }modes++;
   }
  }expect(modes).toBeGreaterThan(150);
 });
});
