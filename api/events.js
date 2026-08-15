export default async function handler(req, res) {
  const feeds = {
    WF: "https://www.gdacs.org/contentdata/xml/gdacsWF.geojson",
    FL: "https://www.gdacs.org/contentdata/xml/gdacsFL.geojson",
    TC: "https://www.gdacs.org/contentdata/xml/gdacsTC.geojson",
    EQ: "https://www.gdacs.org/contentdata/xml/gdacsEQ.geojson",
    VO: "https://www.gdacs.org/contentdata/xml/gdacsVO.geojson",
    DR: "https://www.gdacs.org/contentdata/xml/gdacsDR.geojson"
  };

  try {
    const packs = await Promise.all(
      Object.entries(feeds).map(async ([type, url]) => {
        try {
          const response = await fetch(url, {
            cache: "no-store"
          });

          if (!response.ok) {
            return {
              type,
              ok: false,
              features: []
            };
          }

          const data = await response.json();

          return {
            type,
            ok: true,
            features: data.features || []
          };
        } catch {
          return {
            type,
            ok: false,
            features: []
          };
        }
      })
    );

    const events = [];

    for (const pack of packs) {
      for (const feature of pack.features.slice(0, 150)) {
        const properties = feature.properties || {};
        const coordinates = feature.geometry?.coordinates;

        const xy = Array.isArray(coordinates?.[0])
          ? coordinates[0]
          : coordinates;

        const rawLevel = String(
          properties.alertlevel ||
          properties.alertLevel ||
          ""
        ).toLowerCase();

        let level = "green";

        if (rawLevel.includes("red")) {
          level = "red";
        } else if (rawLevel.includes("orange")) {
          level = "orange";
        } else if (rawLevel.includes("yellow")) {
          level = "yellow";
        }

        events.push({
          type: pack.type,

          name:
            properties.name ||
            properties.eventname ||
            properties.eventName ||
            properties.description ||
            "Evento",

          country:
            properties.country ||
            properties.Country ||
            "",

          level,

          lat: Number(xy?.[1]),
          lon: Number(xy?.[0]),

          source: "GDACS"
        });
      }
    }

    res.setHeader(
      "Cache-Control",
      "s-maxage=180, stale-while-revalidate=600"
    );

    return res.status(200).json({
      events,
      unavailable: packs
        .filter(pack => !pack.ok)
        .map(pack => pack.type)
    });

  } catch (error) {

    return res.status(502).json({
      events: [],
      unavailable: [
        "WF",
        "FL",
        "TC",
        "EQ",
        "VO",
        "DR"
      ]
    });
  }
}
