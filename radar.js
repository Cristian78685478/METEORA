export default async function handler(req,res){
  try{
    const r=await fetch("https://api.rainviewer.com/public/weather-maps.json",{cache:"no-store"});
    if(!r.ok) throw new Error("Radar upstream");
    const data=await r.json();
    res.setHeader("Cache-Control","s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({radar:{past:data.radar?.past||[]}});
  }catch(e){res.status(502).json({error:"radar_unavailable"});}
}