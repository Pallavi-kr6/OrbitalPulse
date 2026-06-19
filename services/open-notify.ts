// services/open-notify.ts
export async function getISSPosition() {
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