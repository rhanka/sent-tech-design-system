/** Opaque shipped semantic colours; derive flow ink that survives the frozen dim opacity. */
function rgb(text:string):number[] {
  if(/^#[0-9a-f]{3}$/i.test(text))return [...text.slice(1)].map((c)=>parseInt(c+c,16)/255);
  if(/^#[0-9a-f]{6}$/i.test(text))return [1,3,5].map((i)=>parseInt(text.slice(i,i+2),16)/255);
  const values=text.match(/[-+]?\d*\.?\d+/g)?.map(Number)??[];
  if(text.startsWith("oklch")){
    const [raw=0,C=0,h=0]=values,L=raw/(text.includes("%")?100:1),a=C*Math.cos(h*Math.PI/180),b=C*Math.sin(h*Math.PI/180);
    const l=(L+0.3963377774*a+0.2158037573*b)**3,m=(L-0.1055613458*a-0.0638541728*b)**3,s=(L-0.0894841775*a-1.291485548*b)**3;
    return [4.0767416621*l-3.3077115913*m+0.2309699292*s,-1.2684380046*l+2.6097574011*m-0.3413193965*s,-0.0041960863*l-0.7034186147*m+1.707614701*s].map((v)=>Math.max(0,Math.min(1,v<=0.0031308?12.92*v:1.055*v**(1/2.4)-0.055)));
  }
  if(text.startsWith("hsl")){const[h=0,S=0,B=0]=values,s=S/100,l=B/100,a=s*Math.min(l,1-l);return[0,8,4].map((n)=>{const k=(n+h/30)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1));});}
  if(text.startsWith("rgb"))return values.slice(0,3).map((v)=>v/255);
  return [];
}
const luminance=(color:readonly number[])=>color.reduce((sum,v,i)=>sum+(v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4)*[0.2126,0.7152,0.0722][i]!,0);
const mix=(a:readonly number[],b:readonly number[],alpha:number)=>a.map((v,i)=>v*alpha+b[i]!*(1-alpha));
const ratio=(a:readonly number[],b:readonly number[])=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
export function flowInk(semanticInk:string,semanticBackground:string,semanticPage:string):string {
  const ink=rgb(semanticInk),background=rgb(semanticBackground),page=rgb(semanticPage);
  // Unresolved custom CSS inputs retain their authored token; shipped modes are gated in tests.
  if(ink.length!==3||background.length!==3||page.length!==3)return semanticInk;
  const extreme=luminance(background)>0.179?[0,0,0]:[1,1,1];
  for(let amount=100;amount>=0;amount--){
    const candidate=mix(ink,extreme,amount/100).map((v)=>Math.round(v*255)/255);
    if([1,0.6].every((alpha)=>ratio(mix(candidate,page,alpha),mix(background,page,alpha))>=4.5))return amount===100?semanticInk:"#"+candidate.map((v)=>Math.round(v*255).toString(16).padStart(2,"0")).join("");
  }
  return "#"+extreme.map((v)=>(v*255).toString(16).padStart(2,"0")).join("");
}
