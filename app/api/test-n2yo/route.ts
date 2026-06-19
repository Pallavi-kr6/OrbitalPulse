import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.N2YO_API_KEY;

  const res = await fetch(
    `https://api.n2yo.com/rest/v1/satellite/tle/25544&apiKey=${apiKey}`
  );

  const data = await res.json();

  return NextResponse.json(data);
}