// lib/provinces.ts
import { Timestamp } from 'firebase/firestore';
import { District, HistoricalPeriod, phitsanulokDistricts, chiangmaiDistricts } from './districts';

export interface Province {
  id: string;
  name: string;
  thaiName: string;
  totalArea: number;
  districts: District[];
  historicalPeriods: HistoricalPeriod[];
  collabSymbol?: string;
  tags: string[];
  createdAt: Timestamp;
  createdBy: string;
  lock: boolean;
  version: number;
  backgroundSvgPath?: string | null;
  backgroundImageUrl?: string | null;
  backgroundDimensions?: { width: number; height: number } | null;
}

export const provinces: Province[] = [
  {
    id: 'phitsanulok',
    name: 'Phitsanulok',
    thaiName: 'พิษณุโลก',
    totalArea: 10589,
    districts: phitsanulokDistricts,
    historicalPeriods: [
      {
        era: 'Sukhothai Kingdom',
        startYear: 1238,
        endYear: 1438,
        yearRange: '13th-14th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Phitsanulok was a key province during the Sukhothai Kingdom, with Muang District as a major city.',
        events: ['Founded as a significant administrative center'],
        landmarks: ['Wat Phra Si Rattana Mahathat'],
        media: []
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Phitsanulok became the capital of Ayutthaya from 1463 to 1488.',
        events: ['Capital of Ayutthaya Kingdom (1463-1488)'],
        landmarks: ['Wat Phra Si Rattana Mahathat'],
        media: []
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Phitsanulok modernized with infrastructure like airports and national parks.',
        events: ['Development of Phitsanulok Airport', 'Establishment of national parks'],
        landmarks: ['Phitsanulok Airport', 'Phu Hin Rong Kla National Park'],
        media: []
      }
    ],
    collabSymbol: 'https://example.com/phitsanulok-collab-logo.png',
    tags: ['Sukhothai', 'historical', 'collaboration'],
    createdAt: Timestamp.now(),
    createdBy: 'admin1',
    lock: true,
    version: 1
  },
  {
    id: 'chiangMai',
    name: 'Chiang Mai',
    thaiName: 'เชียงใหม่',
    totalArea: 20107,
    districts: chiangmaiDistricts,
    historicalPeriods: [
      {
        era: 'Foundation of Chiang Mai',
        startYear: 1296,
        endYear: 1296,
        yearRange: '13th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Founded by King Mangrai in 1296 as the capital of the Lanna Kingdom.',
        events: ['Founded by King Mangrai in 1296'],
        landmarks: ['Wat Chedi Luang', 'Wat Phra Singh'],
        media: []
      },
      {
        era: 'Burmese Rule',
        startYear: 1558,
        endYear: 1774,
        yearRange: '16th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Under Burmese control from 1558 until 1774.',
        events: ['Conquered by Burmese in 1558', 'Liberated from Burmese in 1774'],
        landmarks: ['Wat Phra That Doi Suthep'],
        media: []
      },
      {
        era: 'Siamese Integration',
        startYear: 1774,
        endYear: 1899,
        yearRange: 'Late 18th-19th Century',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Integrated into the Siamese Kingdom, leading to administrative reforms.',
        events: ['Annexed by Siam in 1774', 'Established as Mueang Chiang Mai district in 1899'],
        landmarks: ['Chiang Mai Old City'],
        media: []
      },
      {
        era: 'Modern Era',
        startYear: 1900,
        endYear: 2025,
        yearRange: '20th-21st Century',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Transitioned into a modern province, becoming a cultural and tourist hub.',
        events: ['Establishment of Chiang Mai University in 1964', 'Hosting of the 2006 ASEAN Summit'],
        landmarks: ['Chiang Mai University', 'Doi Suthep-Pui National Park'],
        media: []
      }
    ],
    collabSymbol: 'https://example.com/chiangmai-collab-logo.png',
    tags: ['Lanna', 'culture', 'tourism'],
    createdAt: Timestamp.now(),
    createdBy: 'admin1',
    lock: true,
    version: 1
  }
];

// Utility functions
export const getProvinceById = (provinces: Province[], id: string): Province | undefined => {
  return provinces.find((province) => province.id === id);
};