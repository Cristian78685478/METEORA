export default async function handler(req,res){
 const feeds={WF:"https://www.gdacs.org/contentdata/xml/gdacsWF.geojson",FL:"https://www.gdacs.org/contentdata/xml/gdacsFL.geojson",TC:"https://www.gdacs.org/contentdata/xml/gdacsTC.geojson",EQ:"https://www.gdacs.org/contentdata/xml/gdacsEQ.geojson",VO:"https://www.gdacs.org/contentdata/xml/gdacsVO.geojson",DR:"https://www.gdacs.org/contentdata/xml/gdacsDR.geojson"};
 try{
  const packs=await Promise.all(Object.entries(feeds).map(async([type,url])=>{try{const r=await fetch(url,{cache:"no-store"});if(!r.ok)return{type,ok:false,features:[]};const g=await r.json();return{type,ok:true,features:g.features||[]}}catch{return{type,ok:false,features:[]}}}));
  const events=[];
  for(const pack of packs) for(const f of pack.features.slice(0,150)){const p=f.properties||{},c=f.geometry?.coordinates,xy=Array.isArray(c?.[0])?c[0]:c,raw=String(p.alertlevel||p.alertLevel||"").toLowerCase();events.push({type:pack.type,name:p.name||p.eventname||p.eventName||p.description||"Evento",country:p.country||p.Country||"",level:raw.includes("red")?"red":raw.includes("orange")?"orange":raw.includes("yellow")?"yellow":"green",lat:Number(xy?.[1]),lon:Number(xy?.[0]),source:"GDACS"})}
  res.setHeader("Cache-Control","s-maxage=180, stale-while-revalidate=600");res.status(200).json({events,unavailable:packs.filter(x=>!x.ok).map(x=>x.type)});
 }catch{res.status(502).json({events:[],unavailable:["WF","FL","TC","EQ","VO","DR"]})}
}