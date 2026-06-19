// services/open-notify.ts
export async function getISSPosition(): Promise<{ timestamp: number; iss_position: { latitude: string; longitude: string } }> {
  const res = await fetch("http://api.open-notify.org/iss-now.json");
  const data = await res.json();

  return {
    timestamp: data.timestamp,
    iss_position: {
      latitude: data.iss_position.latitude,
      longitude: data.iss_position.longitude,
    },
  };
}