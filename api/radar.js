export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.rainviewer.com/public/weather-maps.json",
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error("Radar upstream error");
    }

    const data = await response.json();

    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );

    return res.status(200).json({
      radar: {
        past: data.radar?.past || []
      }
    });

  } catch (error) {

    return res.status(502).json({
      error: "radar_unavailable"
    });
  }
}
