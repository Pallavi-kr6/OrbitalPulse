import { NasaGibsLayer, NasaGibsResponse } from "@/types/clients";

const baseTemplate = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg";

export const nasaGibsLayers: NasaGibsLayer[] = [
  {
    id: "BLUE_MARBLE",
    title: "Blue Marble",
    description: "True-color global imagery from NASA Blue Marble.",
    tileUrlTemplate: baseTemplate,
  },
  {
    id: "MODIS_Terra_CorrectedReflectance_TrueColor",
    title: "MODIS Terra True Color",
    description: "Terra MODIS true-color surface imagery.",
    tileUrlTemplate: baseTemplate,
  },
  {
    id: "MODIS_Aqua_CorrectedReflectance_TrueColor",
    title: "MODIS Aqua True Color",
    description: "Aqua MODIS true-color surface imagery.",
    tileUrlTemplate: baseTemplate,
  },
  {
    id: "VIIRS_CityLights_2012",
    title: "Night Lights",
    description: "Night-time lights composite imagery.",
    tileUrlTemplate: baseTemplate,
  },
  {
    id: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
    title: "Cloud Cover",
    description: "Near real-time cloud cover from VIIRS on Suomi NPP.",
    tileUrlTemplate: baseTemplate,
  },
  {
    id: "MURAMA_L4_SST",
    title: "Sea Surface Temperature",
    description: "NASA sea surface temperature imagery.",
    tileUrlTemplate: baseTemplate,
  },
];

export function getGibsTileUrl(layerId: string, date = new Date()): string {
  const isoDate = date.toISOString().slice(0, 10);
  const template = baseTemplate.replace("{layer}", layerId);
  return template
    .replace("{time}", isoDate)
    .replace("{tileMatrixSet}", "GoogleMapsCompatible_Level9")
    .replace("{z}", "{z}")
    .replace("{y}", "{y}")
    .replace("{x}", "{x}");
}

export function getGibsLayers(): NasaGibsResponse {
  return { layers: nasaGibsLayers };
}
