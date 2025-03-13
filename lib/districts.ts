// lib/districts.ts
import { Timestamp } from 'firebase/firestore';

export interface Media {
  type: 'image' | 'audio' | 'video' | 'text' | 'map' |'activeTab';
  url: string;
  altText: string;
  description: string;
  license?: string;
  createdAt?: string;
}

export interface HistoricalPeriod {
  era: string;
  startYear: number;
  endYear: number;
  yearRange: string;
  color: string;
  description: string;
  events: string[];
  landmarks: string[];
  media: Media[];
  sources?: string[];
}

export interface CollabData {
  novelTitle: string;
  storylineSnippet: string;
  characters: string[];
  relatedLandmarks: string[];
  media: Media[];
  isActive: boolean;
  author?: string;
  publicationDate?: string;
  externalLink?: string;
  duplicatedDistricts?: string[];
  duplicatedProvinces?: string[];
}

export interface District {
  id: string;
  name: string;
  thaiName: string;
  mapImageUrl?: string;
  googleMapsUrl?: string;
  coordinates: { x: number; y: number; width: number; height: number };
  historicalColor: string;
  historicalPeriods: HistoricalPeriod[];
  collab?: CollabData;
  culturalSignificance?: string;
  visitorTips?: string;
  interactiveFeatures?: string[];
  areaSize?: number;
  climate?: string;
  population?: number;
  tags?: string[];
  createdAt: Timestamp;
  createdBy: string;
  lock: boolean;
  version: number;
}

export const phitsanulokDistricts: District[] = [
  {
    id: 'mueang',
    name: 'Muang District',
    thaiName: 'อ.เมือง',
    mapImageUrl: 'https://example.com/muang-district-map.png',
    googleMapsUrl: 'https://maps.google.com/?q=Muang+Phitsanulok',
    coordinates: { x: 200, y: 200, width: 100, height: 100 },
    historicalColor: 'rgba(239, 68, 68, 0.5)',
    historicalPeriods: [
      {
        era: 'Sukhothai Kingdom',
        startYear: 1238,
        endYear: 1438,
        yearRange: '13th-14th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Historically known as Song Khwae, a major city founded by King Thammaracha I.',
        events: ['Founded by King Thammaracha I in 1357'],
        landmarks: ['Wat Phra Si Rattana Mahathat', 'Wat Chula Manee', 'Wat Aranyik'],
        media: [
          {
            type: 'image',
            url: 'https://commons.wikimedia.org/wiki/File:Wat_Phra_Si_Rattana_Mahathat_Phitsanulok.jpg',
            altText: 'Wat Phra Si Rattana Mahathat',
            description: 'Wat Phra Si Rattana Mahathat, housing the revered Phra Buddha Chinnarat statue.'
          }
        ]
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Phitsanulok served as the capital of Ayutthaya Kingdom from 1463 to 1488.',
        events: ['Capital of Ayutthaya Kingdom (1463-1488)', 'Birth of King Naresuan in 1555'],
        landmarks: ['Wat Phra Si Rattana Mahathat'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/wat-phra-si-rattana-ayutthaya.jpg',
            altText: 'Wat Phra Si Rattana Mahathat during Ayutthaya Period',
            description: 'Temple during the Ayutthaya Period.'
          }
        ]
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Muang District evolved into the administrative and cultural center of Phitsanulok.',
        events: ['Development of modern infrastructure like Phitsanulok Airport'],
        landmarks: ['Phitsanulok Airport', 'Folklore Museum'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/phitsanulok-airport.jpg',
            altText: 'Phitsanulok Airport',
            description: 'Modern Phitsanulok Airport, a key transportation hub.'
          }
        ]
      }
    ],
    collab: {
      novelTitle: 'The Lost Kingdom',
      storylineSnippet: 'A tale of a hidden royal lineage...',
      characters: ['Prince Aran', 'Sorceress Lita'],
      relatedLandmarks: ['Wat Phra Si Rattana Mahathat'],
      media: [],
      isActive: true,
      duplicatedDistricts: ['chatTrakan'],
      duplicatedProvinces: ['phitsanulok']
    },
    culturalSignificance: 'Muang District is the historical heart of Phitsanulok, home to significant temples.',
    visitorTips: 'Visit Wat Phra Si Rattana Mahathat in the early morning for a serene experience.',
    interactiveFeatures: ['360-degree virtual tour of Wat Phra Si Rattana Mahathat'],
    areaSize: 150,
    climate: 'Tropical, rainy season June-October',
    population: 84000,
    tags: ['Sukhothai', 'temples', 'historical'],
    createdAt: Timestamp.now(),
    createdBy: 'admin1',
    lock: false,
    version: 1
  },
  {
    id: 'nakhonThai',
    name: 'Nakhon Thai District',
    thaiName: 'อ.นครไทย',
    mapImageUrl: 'https://example.com/nakhon-thai-map.png',
    googleMapsUrl: 'https://maps.google.com/?q=Nakhon+Thai+Phitsanulok',
    coordinates: { x: 250, y: 50, width: 150, height: 100 },
    historicalColor: 'rgba(147, 51, 234, 0.5)',
    historicalPeriods: [
      {
        era: 'Sukhothai Kingdom',
        startYear: 1238,
        endYear: 1438,
        yearRange: '13th-14th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Nakhon Thai was part of the Sukhothai Kingdom, with historical significance as the Singhanavati Kingdom capital in 1188.',
        events: ['Singhanavati Kingdom capital established in 1188'],
        landmarks: ['Phu Hin Rong Kla National Park (historical significance)'],
        media: []
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Served as an administrative region under Ayutthaya.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Modern governance established, focusing on natural attractions.',
        events: ['Phu Hin Rong Kla National Park established in 1984'],
        landmarks: ['Phu Hin Rong Kla National Park'],
        media: []
      }
    ],
    culturalSignificance: 'Known for its historical role in the Singhanavati Kingdom and natural landscapes.',
    visitorTips: 'Explore Phu Hin Rong Kla National Park for hiking and historical insights.',
    areaSize: 2220,
    climate: 'Tropical, cooler due to elevation',
    population: 35000,
    tags: ['historical', 'nature', 'national park'],
    createdAt: Timestamp.now(),
    createdBy: 'admin1',
    lock: false,
    version: 1
  },
  {
    id: 'chatTrakan',
    name: 'Chat Trakan District',
    thaiName: 'อ.ชาติตระการ',
    mapImageUrl: 'https://example.com/chat-trakan-map.png',
    googleMapsUrl: 'https://maps.google.com/?q=Chat+Trakan+Phitsanulok',
    coordinates: { x: 150, y: 100, width: 100, height: 100 },
    historicalColor: 'rgba(34, 197, 94, 0.5)',
    historicalPeriods: [
      {
        era: 'Sukhothai Kingdom',
        startYear: 1238,
        endYear: 1438,
        yearRange: '13th-14th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Part of the Sukhothai Kingdom, supporting regional administration.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Continued as an administrative region under Ayutthaya.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1974, known for natural attractions.',
        events: ['Established as a district in 1974', 'Namtok Chat Trakan National Park established in 1987'],
        landmarks: ['Namtok Chat Trakan National Park'],
        media: []
      }
    ],
    culturalSignificance: 'Known for its natural beauty and waterfalls.',
    visitorTips: 'Visit Namtok Chat Trakan National Park for its stunning waterfalls.',
    areaSize: 1850,
    climate: 'Tropical, rainy season June-October',
    population: 15000,
    tags: ['nature', 'waterfalls'],
    createdAt: Timestamp.now(),
    createdBy: 'admin1',
    lock: false,
    version: 1
  },
  {
    id: 'bangRakam',
    name: 'Bang Rakam District',
    thaiName: 'อ.บางระกำ',
    mapImageUrl: 'https://example.com/bang-rakam-map.png',
    googleMapsUrl: 'https://maps.google.com/?q=Bang+Rakam+Phitsanulok',
    coordinates: { x: 100, y: 200, width: 100, height: 100 },
    historicalColor: 'rgba(147, 197, 253, 0.5)',
    historicalPeriods: [
      {
        era: 'Sukhothai Kingdom',
        startYear: 1238,
        endYear: 1438,
        yearRange: '13th-14th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Part of the Sukhothai Kingdom, contributing to agricultural activities.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Supported Ayutthaya’s agricultural and trade networks.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Modern district focusing on agriculture, especially rice farming.',
        events: ['Established as a district in 1907'],
        landmarks: ['Local temples', 'Agricultural fields'],
        media: []
      }
    ],
    culturalSignificance: 'Known for its fertile lands and rice production.',
    visitorTips: 'Experience rural life and local markets.',
    areaSize: 900,
    climate: 'Tropical, rainy season June-October',
    population: 50000,
    tags: ['agriculture', 'rural'],
    createdAt: Timestamp.now(),
    createdBy: 'admin1',
    lock: false,
    version: 1
  },
  {
    id: 'phromPhiram',
    name: 'Phrom Phiram District',
    thaiName: 'อ.พรหมพิราม',
    mapImageUrl: 'https://example.com/phrom-phiram-map.png',
    googleMapsUrl: 'https://maps.google.com/?q=Phrom+Phiram+Phitsanulok',
    coordinates: { x: 150, y: 300, width: 100, height: 100 },
    historicalColor: 'rgba(253, 164, 175, 0.5)',
    historicalPeriods: [
      {
        era: 'Sukhothai Kingdom',
        startYear: 1238,
        endYear: 1438,
        yearRange: '13th-14th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Part of Sukhothai Kingdom, with archaeological remains like Sukhothai Celadon.',
        events: [],
        landmarks: ['Sukhothai Celadon remains'],
        media: []
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Continued as an agricultural region under Ayutthaya.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1895, known for cultural heritage.',
        events: ['Established as a district in 1895'],
        landmarks: ['Local cultural sites'],
        media: []
      }
    ],
    culturalSignificance: 'Known for archaeological finds from the Sukhothai period.',
    visitorTips: 'Visit local museums for Sukhothai artifacts.',
    areaSize: 870,
    climate: 'Tropical, rainy season June-October',
    population: 40000,
    tags: ['archaeology', 'Sukhothai'],
    createdAt: Timestamp.now(),
    createdBy: 'admin1',
    lock: false,
    version: 1
  },
  {
    id: 'watBot',
    name: 'Wat Bot District',
    thaiName: 'อ.วัดโบสถ์',
    mapImageUrl: 'https://example.com/wat-bot-map.png',
    googleMapsUrl: 'https://maps.google.com/?q=Wat+Bot+Phitsanulok',
    coordinates: { x: 200, y: 350, width: 100, height: 100 },
    historicalColor: 'rgba(74, 222, 128, 0.5)',
    historicalPeriods: [
      {
        era: 'Sukhothai Kingdom',
        startYear: 1238,
        endYear: 1438,
        yearRange: '13th-14th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Part of the Sukhothai Kingdom, with minimal recorded events.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Served as a rural area under Ayutthaya.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1956, known for natural parks.',
        events: ['Established as a district in 1956', 'Kaeng Chet Khwae National Park established in 1998'],
        landmarks: ['Kaeng Chet Khwae National Park'],
        media: []
      }
    ],
    culturalSignificance: 'Known for its natural attractions and parks.',
    visitorTips: 'Explore Kaeng Chet Khwae National Park for nature trails.',
    areaSize: 320,
    climate: 'Tropical, rainy season June-October',
    population: 20000,
    tags: ['nature', 'national park'],
    createdAt: Timestamp.now(),
    createdBy: 'admin1',
    lock: false,
    version: 1
  },
  {
    id: 'wangThong',
    name: 'Wang Thong District',
    thaiName: 'อ.วังทอง',
    mapImageUrl: 'https://example.com/wang-thong-map.png',
    googleMapsUrl: 'https://maps.google.com/?q=Wang+Thong+Phitsanulok',
    coordinates: { x: 350, y: 200, width: 100, height: 100 },
    historicalColor: 'rgba(216, 180, 254, 0.5)',
    historicalPeriods: [
      {
        era: 'Sukhothai Kingdom',
        startYear: 1238,
        endYear: 1438,
        yearRange: '13th-14th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Part of the Sukhothai Kingdom, supporting trade routes.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Continued as a trade and agricultural area under Ayutthaya.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1939, known for markets.',
        events: ['Established as a district in 1939'],
        landmarks: ['Wang Thong Municipal Market'],
        media: []
      }
    ],
    culturalSignificance: 'Known for its vibrant local markets and trade history.',
    visitorTips: 'Visit Wang Thong Municipal Market for local goods.',
    areaSize: 1700,
    climate: 'Tropical, rainy season June-October',
    population: 45000,
    tags: ['markets', 'trade'],
    createdAt: Timestamp.now(),
    createdBy: 'admin1',
    lock: false,
    version: 1
  },
  {
    id: 'bangKrathum',
    name: 'Bang Krathum District',
    thaiName: 'อ.บางกระทุ่ม',
    mapImageUrl: 'https://example.com/bang-krathum-map.png',
    googleMapsUrl: 'https://maps.google.com/?q=Bang+Krathum+Phitsanulok',
    coordinates: { x: 300, y: 300, width: 100, height: 100 },
    historicalColor: 'rgba(249, 115, 22, 0.5)',
    historicalPeriods: [
      {
        era: 'Sukhothai Kingdom',
        startYear: 1238,
        endYear: 1438,
        yearRange: '13th-14th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Part of the Sukhothai Kingdom, with historical chedi remains.',
        events: [],
        landmarks: ['Historic chedi at Wat Grung See Jayrin'],
        media: []
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Supported Ayutthaya’s agricultural economy.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1927, known for sugar cane production.',
        events: ['Established as a district in 1927'],
        landmarks: ['Local temples', 'Sugar cane fields'],
        media: []
      }
    ],
    culturalSignificance: 'Known for its agricultural contributions and historical sites.',
    visitorTips: 'Visit Wat Grung See Jayrin for historical insights.',
    areaSize: 420,
    climate: 'Tropical, rainy season June-October',
    population: 30000,
    tags: ['agriculture', 'historical'],
    createdAt: Timestamp.now(),
    createdBy: 'admin1',
    lock: false,
    version: 1
  },
  {
    id: 'noenMaprang',
    name: 'Noen Maprang District',
    thaiName: 'อ.เนินมะปราง',
    mapImageUrl: 'https://example.com/noen-maprang-map.png',
    googleMapsUrl: 'https://maps.google.com/?q=Noen+Maprang+Phitsanulok',
    coordinates: { x: 350, y: 350, width: 100, height: 100 },
    historicalColor: 'rgba(250, 204, 21, 0.5)',
    historicalPeriods: [
      {
        era: 'Sukhothai Kingdom',
        startYear: 1238,
        endYear: 1438,
        yearRange: '13th-14th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Part of the Sukhothai Kingdom, with minimal recorded events.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Served as a rural area under Ayutthaya.',
        events: [],
        landmarks: [],
        media: []
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1983, known for scenic landscapes.',
        events: ['Established as a district in 1983'],
        landmarks: ['Ban Mung scenic area'],
        media: []
      }
    ],
    culturalSignificance: 'Known for its scenic landscapes and rural charm.',
    visitorTips: 'Visit Ban Mung for stunning limestone landscapes.',
    areaSize: 780,
    climate: 'Tropical, rainy season June-October',
    population: 15000,
    tags: ['nature', 'scenic'],
    createdAt: Timestamp.now(),
    createdBy: 'admin1',
    lock: false,
    version: 1
  }
];

export const chiangmaiDistricts: District[] = [
  {
    id: 'mueangChiangMai',
    name: 'Mueang ChiangMai',
    thaiName: 'อำเภอเมืองเชียงใหม่',
    mapImageUrl: 'https://example.com/mueang-chiangmai-map.png',
    googleMapsUrl: 'https://maps.google.com/?q=Mueang+Chiang+Mai',
    coordinates: { x: 250, y: 250, width: 150, height: 150 },
    historicalColor: 'rgba(239, 68, 68, 0.5)',
    historicalPeriods: [
      {
        era: 'Lanna Kingdom',
        startYear: 1296,
        endYear: 1296,
        yearRange: '13th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Founded by King Mangrai in 1296 as the capital of the Lanna Kingdom.',
        events: ['Founded by King Mangrai in 1296'],
        landmarks: ['Wat Chedi Luang', 'Wat Phra Singh'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/wat-chedi-luang.jpg',
            altText: 'Wat Chedi Luang',
            description: 'Wat Chedi Luang, a significant Lanna temple.'
          }
        ]
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
        era: 'Modern Development',
        startYear: 1900,
        endYear: 2025,
        yearRange: '20th-21st Century',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Transitioned into a modern city, becoming a cultural and tourist hub.',
        events: ['Opening of first district office in 1929', 'Inauguration of new district office in 1989'],
        landmarks: ['Chiang Mai Night Market', 'Doi Suthep Temple'],
        media: []
      }
    ],
    culturalSignificance: 'The cultural and historical heart of Chiang Mai, known for its Lanna heritage.',
    visitorTips: 'Visit the Night Market and Doi Suthep Temple for a rich cultural experience.',
    areaSize: 230,
    climate: 'Tropical, cooler due to elevation',
    population: 150000,
    tags: ['Lanna', 'culture', 'tourism'],
    createdAt: Timestamp.now(),
    createdBy: 'admin1',
    lock: false,
    version: 1
  }
];
// Utility functions
export const getDistrictById = (districts: District[], districtId: string): District | undefined => {
  return districts.find((district) => district.id === districtId);
};