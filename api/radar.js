export default async function handler(req,res){
try{const r=await fetch("https://api.rainviewer.com/public/weather-maps.json",{cache:"no-store"});if(!r.ok)throw 0;const d=await r.json();res.setHeader("Cache-Control","s-maxage=60, stale-while-revalidate=300");res.status(200).json({radar:{past:d.radar?.past||[]}})}catch{res.status(502).json({error:"radar_unavailable"})}}
