(function(root){
const C=typeof module!=='undefined'?require('./data.js'):root.ColdProcessCatalog,byKey=new Map(C.points.map(p=>[p.key,p]));
function createStore(){
 let values={};const reset=demo=>{values=Object.fromEntries(C.points.map(p=>[p.key,{value:demo?p.default:null,quality:demo&&p.default!==null?'reference':'unknown',timestamp:null}]));};reset(false);
 function updatePoints(input){
  if(!input||typeof input!=='object')return {accepted:0,rejected:[{error:'点位格式无效'}]};
  const items=Array.isArray(input)?input:Object.entries(input).map(([key,v])=>({...v&&typeof v==='object'?v:{value:v},key})),staged=[],rejected=[];
  for(const entry of items){try{if(!entry||!byKey.has(entry.key))throw Error('未知点位');const p=byKey.get(entry.key),v=entry.value;if(v!==null&&(p.type==='boolean'?typeof v!=='boolean':typeof v!=='number'||!Number.isFinite(v)))throw Error('点位类型无效');const quality=entry.quality??(v===null?'unknown':'good');if(!['good','bad','stale','unknown','reference'].includes(quality))throw Error('质量码无效');const timestamp=entry.timestamp??(quality==='reference'?null:new Date().toISOString());if(timestamp!==null&&!Number.isFinite(Date.parse(timestamp)))throw Error('时间戳无效');staged.push([entry.key,{value:v,quality:v===null?'unknown':quality,timestamp}]);}catch(e){rejected.push({key:entry?.key,error:e.message})}}
  if(rejected.length)return {accepted:0,rejected};for(const [k,v]of staged)values[k]=v;return {accepted:staged.length,rejected};
 }
 function read(key){const v=values[key];if(!v)return null;return {...v,quality:v.quality==='good'&&Date.now()-Date.parse(v.timestamp)>60000?'stale':v.quality};}
 function snapshot(){return Object.fromEntries(C.points.map(p=>[p.key,read(p.key)]));}
 return {read,snapshot,updatePoints,clear:()=>reset(false),reference:()=>reset(true)};
}
const api={createStore};if(typeof module!=='undefined')module.exports=api;else root.ColdProcessModel=api;
})(typeof window!=='undefined'?window:globalThis);
