// lib/provinces.ts
import { Province, phitsanulokDistricts, chiangMaiDistricts } from "./districts";

export const provinces: Province[] = [
  {
    id: "phitsanulok",
    name: "Phitsanulok",
    thaiName: "พิษณุโลก",
    districts: phitsanulokDistricts,
  },
  {
    id: "chiangmai",
    name: "Chiang Mai",
    thaiName: "เชียงใหม่",
    districts: chiangMaiDistricts,
  },
];