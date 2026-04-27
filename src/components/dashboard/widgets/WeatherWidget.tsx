"use client"

// WIDGET-CONTRACT : data = pseudo-forecast dérivé du mois eventDate ; pas de
// fetch externe (pas de clé API météo). Mock cohérent climat Maroc.
export default function WeatherWidget({ eventDate }: { eventDate: string }) {
  const date = new Date(eventDate)
  const month = date.getMonth()
  // Pseudo-forecast based on month (Maroc climate)
  const forecast =
    month >= 5 && month <= 8 ? { icon: "☀️", temp: 28, cond: "Ensoleillé",  rain: 5  } :
    month >= 2 && month <= 4 ? { icon: "🌤️", temp: 22, cond: "Partiel",     rain: 15 } :
    month >= 9 && month <= 10 ? { icon: "🌥️", temp: 18, cond: "Nuageux",     rain: 25 } :
    { icon: "🌧️", temp: 14, cond: "Averses",    rain: 55 }
  return (
    <div style={{ padding: "12px 16px 16px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, boxSizing: "border-box" }}>
      <div style={{ fontSize: "var(--text-2xl)" }}>{forecast.icon}</div>
      <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--dash-text,#121317)" }}>{forecast.temp}°</div>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--dash-text-2,#45474D)", fontWeight: 500 }}>{forecast.cond}</div>
      <div style={{ fontSize: "var(--text-2xs)", color: "var(--dash-text-3,#9a9aaa)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        💧 {forecast.rain}% pluie
      </div>
    </div>
  )
}
