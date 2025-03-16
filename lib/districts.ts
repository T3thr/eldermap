// lib/districts.ts
import { Timestamp } from 'firebase/firestore';

export interface Media {
  type: 'image' | 'video' | 'audio' | 'text' | 'map';
  url: string;
  altText: string;
  description: string;
  thumbnailUrl?: string;
  duration?: number;
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
  characters: {
    name: string;
    historicalFigure?: boolean;
    bio?: string;
  }[];
  relatedLandmarks: string[];
  media: Media[];
  isActive: boolean;
  author?: string;
  collaborators?: string[];
  publicationDate?: string;
  externalLink?: string;
  version?: number;
  duplicatedDistricts?: string[];
  duplicatedProvinces?: string[];
}

export interface Admin {
  name: string;
  id: string;
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
  createdBy: Admin[]; // Updated to array of admin objects
  editor: Admin[]; // New field for editors
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
        description: 'Historically known as Song Khwae, a major city founded by King Thammaracha I in 1357.',
        events: ['Founded by King Thammaracha I in 1357'],
        landmarks: ['Wat Phra Si Rattana Mahathat', 'Wat Chula Manee', 'Wat Aranyik'],
        media: [
          {
            type: 'image',
            url: 'https://commons.wikimedia.org/wiki/File:Wat_Phra_Si_Rattana_Mahathat_Phitsanulok.jpg',
            altText: 'Wat Phra Si Rattana Mahathat',
            description: 'Wat Phra Si Rattana Mahathat, housing the revered Phra Buddha Chinnarat statue.',
            license: 'CC BY-SA 4.0',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Mueang_Phitsanulok_District'],
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Phitsanulok served as the capital of Ayutthaya Kingdom from 1463 to 1488 and was the birthplace of King Naresuan.',
        events: ['Capital of Ayutthaya Kingdom (1463-1488)', 'Birth of King Naresuan in 1555'],
        landmarks: ['Wat Phra Si Rattana Mahathat', 'King Naresuan Shrine'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/king-naresuan-shrine.jpg',
            altText: 'King Naresuan Shrine',
            description: 'Shrine dedicated to King Naresuan, born in Muang District.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Phitsanulok'],
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Muang District evolved into the administrative and cultural center of Phitsanulok with modern infrastructure.',
        events: ['Development of Phitsanulok Airport', 'Establishment of modern administrative offices'],
        landmarks: ['Phitsanulok Airport', 'Folklore Museum', 'Naresuan University'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/phitsanulok-airport.jpg',
            altText: 'Phitsanulok Airport',
            description: 'Modern Phitsanulok Airport, a key transportation hub.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Phitsanulok_Airport'],
      },
    ],
    collab: {
      novelTitle: 'Shadows of Ayutthaya',
      storylineSnippet: 'In the shadow of Wat Phra Si Rattana Mahathat, a young warrior uncovers a hidden lineage tied to King Naresuan, battling enemies and destiny to protect Phitsanulok’s legacy.',
      characters: [
        {
          name: 'King Naresuan',
          historicalFigure: true,
          bio: 'Born in 1555 in Phitsanulok, King Naresuan was a legendary warrior king who liberated Ayutthaya from Burmese rule.',
        },
        {
          name: 'Lita',
          historicalFigure: false,
          bio: 'A fictional sorceress who aids the protagonist with mystical knowledge of Phitsanulok’s history.',
        },
        {
          name: 'Prince Aran',
          historicalFigure: false,
          bio: 'A young warrior discovering his royal lineage, inspired by the historical significance of Phitsanulok.',
        },
      ],
      relatedLandmarks: ['Wat Phra Si Rattana Mahathat', 'King Naresuan Shrine'],
      media: [
        {
          type: 'image',
          url: 'https://example.com/shadows-of-ayutthaya-cover.jpg',
          altText: 'Shadows of Ayutthaya Cover',
          description: 'Cover art for the graphic novel featuring Wat Phra Si Rattana Mahathat.',
        },
        {
          type: 'image',
          url: 'https://example.com/king-naresuan-illustration.jpg',
          altText: 'King Naresuan Illustration',
          description: 'Illustration of King Naresuan in battle, a central figure in the story.',
        },
      ],
      isActive: true,
      author: 'Somsak Chaiyaporn',
      collaborators: ['Narin Art Studio'],
      publicationDate: '2025-06-01',
      externalLink: 'https://example.com/shadows-of-ayutthaya',
      version: 1,
      duplicatedDistricts: ['chatTrakan'],
      duplicatedProvinces: ['phitsanulok'],
    },
    culturalSignificance: 'Muang District is the historical and cultural heart of Phitsanulok, home to significant temples and historical figures like King Naresuan.',
    visitorTips: 'Visit Wat Phra Si Rattana Mahathat in the early morning for a serene experience and explore the Folklore Museum for local history.',
    interactiveFeatures: ['360-degree virtual tour of Wat Phra Si Rattana Mahathat', 'Interactive graphic novel preview'],
    areaSize: 150,
    climate: 'Tropical, rainy season June-October',
    population: 84000,
    tags: ['Sukhothai', 'temples', 'historical', 'King Naresuan', 'graphic novel'],
    createdAt: Timestamp.now(),
    createdBy: [{ name: 'admin1', id: '1' }], // Master admin created this
    editor: [{ name: 'admin1', id: '1' }], // Master admin is also an editor
    lock: false,
    version: 1,
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
        description: 'Before Sukhothai, Nakhon Thai was the capital of the Singhanavati Kingdom in 1188, later integrated into Sukhothai.',
        events: ['Capital of Singhanavati Kingdom established in 1188'],
        landmarks: ['Phu Hin Rong Kla National Park (historical significance)'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/phu-hin-rong-kla.jpg',
            altText: 'Phu Hin Rong Kla National Park',
            description: 'Phu Hin Rong Kla, a historical and natural landmark.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Nakhon_Thai_District'],
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Served as an administrative region under Ayutthaya, with minimal recorded events.',
        events: [],
        landmarks: [],
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Phitsanulok_Province'],
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Modern governance established, known for natural attractions like Phu Hin Rong Kla National Park.',
        events: ['Phu Hin Rong Kla National Park established in 1984'],
        landmarks: ['Phu Hin Rong Kla National Park'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/phu-hin-rong-kla-park.jpg',
            altText: 'Phu Hin Rong Kla National Park',
            description: 'A view of Phu Hin Rong Kla National Park, established in 1984.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Phu_Hin_Rong_Kla_National_Park'],
      },
    ],
    culturalSignificance: 'Known for its historical role as the Singhanavati Kingdom capital and its natural landscapes.',
    visitorTips: 'Explore Phu Hin Rong Kla National Park for hiking and historical insights.',
    interactiveFeatures: ['Interactive map of Phu Hin Rong Kla trails'],
    areaSize: 2220,
    climate: 'Tropical, cooler due to elevation',
    population: 35000,
    tags: ['historical', 'nature', 'national park'],
    createdAt: Timestamp.now(),
    createdBy: [{ name: 'admin2', id: '2' }], // Created by admin2
    editor: [{ name: 'admin2', id: '2' }], // admin2 is also an editor
    lock: false,
    version: 1,
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
        description: 'Part of the Sukhothai Kingdom, supporting regional administration with minimal recorded events.',
        events: [],
        landmarks: [],
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Chat_Trakan_District'],
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Continued as an administrative region under Ayutthaya, with minimal historical records.',
        events: [],
        landmarks: [],
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Phitsanulok_Province'],
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1974, known for natural attractions like Namtok Chat Trakan National Park.',
        events: ['Established as a district in 1974', 'Namtok Chat Trakan National Park established in 1987'],
        landmarks: ['Namtok Chat Trakan National Park'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/namtok-chat-trakan.jpg',
            altText: 'Namtok Chat Trakan National Park',
            description: 'Waterfalls in Namtok Chat Trakan National Park.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Namtok_Chat_Trakan_National_Park'],
      },
    ],
    culturalSignificance: 'Known for its natural beauty and waterfalls, offering a serene retreat.',
    visitorTips: 'Visit Namtok Chat Trakan National Park for its stunning waterfalls and hiking opportunities.',
    interactiveFeatures: ['Virtual tour of Chat Trakan waterfalls'],
    areaSize: 1850,
    climate: 'Tropical, rainy season June-October',
    population: 15000,
    tags: ['nature', 'waterfalls', 'national park'],
    createdAt: Timestamp.now(),
    createdBy: [{ name: 'admin1', id: '1' }, { name: 'admin3', id: '3' }], // Multiple creators
    editor: [{ name: 'admin1', id: '1' }, { name: 'admin3', id: '3' }], // Both creators are editors
    lock: false,
    version: 1,
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
        description: 'Part of the Sukhothai Kingdom, contributing to agricultural activities with fertile lands.',
        events: [],
        landmarks: [],
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Bang_Rakam_District'],
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Supported Ayutthaya’s agricultural and trade networks, known for its fertile plains.',
        events: [],
        landmarks: [],
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Phitsanulok_Province'],
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1905, known for its rice farming and agricultural significance.',
        events: ['Established as a district in 1905'],
        landmarks: ['Local temples', 'Agricultural fields'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/bang-rakam-fields.jpg',
            altText: 'Bang Rakam Rice Fields',
            description: 'Fertile rice fields in Bang Rakam District.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Bang_Rakam_District'],
      },
    ],
    culturalSignificance: 'Known for its fertile lands and significant contribution to rice production in Thailand.',
    visitorTips: 'Experience rural life and visit local markets to see traditional agricultural practices.',
    interactiveFeatures: ['Interactive map of agricultural zones'],
    areaSize: 900,
    climate: 'Tropical, rainy season June-October',
    population: 50000,
    tags: ['agriculture', 'rural', 'rice farming'],
    createdAt: Timestamp.now(),
    createdBy: [{ name: 'admin2', id: '2' }],
    editor: [{ name: 'admin2', id: '2' }],
    lock: false,
    version: 1,
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
        description: 'Part of Sukhothai Kingdom, known for archaeological remains such as Sukhothai Celadon.',
        events: [],
        landmarks: ['Sukhothai Celadon remains'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/sukhothai-celadon.jpg',
            altText: 'Sukhothai Celadon Remains',
            description: 'Archaeological remains of Sukhothai Celadon in Phrom Phiram.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Phrom_Phiram_District'],
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Continued as an agricultural region under Ayutthaya, with troop movements by King Trailokanat.',
        events: ['King Trailokanat’s troop movements'],
        landmarks: [],
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Phitsanulok_Province'],
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1895, known for its cultural heritage and archaeological sites.',
        events: ['Established as a district in 1895'],
        landmarks: ['Local cultural sites', 'Wat Phrom Phiram'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/wat-phrom-phiram.jpg',
            altText: 'Wat Phrom Phiram',
            description: 'Wat Phrom Phiram, a local cultural landmark.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Phrom_Phiram_District'],
      },
    ],
    culturalSignificance: 'Known for archaeological finds from the Sukhothai period and its rich cultural heritage.',
    visitorTips: 'Visit local museums for Sukhothai artifacts and Wat Phrom Phiram for cultural insights.',
    interactiveFeatures: ['Virtual exhibit of Sukhothai Celadon'],
    areaSize: 870,
    climate: 'Tropical, rainy season June-October',
    population: 40000,
    tags: ['archaeology', 'Sukhothai', 'cultural heritage'],
    createdAt: Timestamp.now(),
    createdBy: [{ name: 'admin1', id: '1' }],
    editor: [{ name: 'admin1', id: '1' }],
    lock: false,
    version: 1,
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
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Wat_Bot_District'],
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Served as a rural area under Ayutthaya, with minimal historical significance.',
        events: [],
        landmarks: [],
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Phitsanulok_Province'],
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1956, known for natural attractions like Kaeng Chet Khwae National Park.',
        events: ['Established as a district in 1956', 'Kaeng Chet Khwae National Park established in 1998'],
        landmarks: ['Kaeng Chet Khwae National Park'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/kaeng-chet-khwae.jpg',
            altText: 'Kaeng Chet Khwae National Park',
            description: 'Scenic view of Kaeng Chet Khwae National Park.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Kaeng_Chet_Khwae_National_Park'],
      },
    ],
    culturalSignificance: 'Known for its natural attractions and parks, offering a peaceful rural experience.',
    visitorTips: 'Explore Kaeng Chet Khwae National Park for nature trails and scenic views.',
    interactiveFeatures: ['Interactive nature trail map'],
    areaSize: 320,
    climate: 'Tropical, rainy season June-October',
    population: 20000,
    tags: ['nature', 'national park', 'rural'],
    createdAt: Timestamp.now(),
    createdBy: [{ name: 'admin2', id: '2' }],
    editor: [{ name: 'admin2', id: '2' }],
    lock: false,
    version: 1,
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
        description: 'Part of the Sukhothai Kingdom, supporting trade routes with minimal recorded events.',
        events: [],
        landmarks: [],
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Wang_Thong_District'],
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
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Phitsanulok_Province'],
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1939, known for its vibrant markets and trade history.',
        events: ['Established as a district in 1939'],
        landmarks: ['Wang Thong Municipal Market'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/wang-thong-market.jpg',
            altText: 'Wang Thong Municipal Market',
            description: 'Vibrant market scene in Wang Thong District.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Wang_Thong_District'],
      },
    ],
    culturalSignificance: 'Known for its vibrant local markets and historical role in regional trade.',
    visitorTips: 'Visit Wang Thong Municipal Market for local goods and traditional Thai market experiences.',
    interactiveFeatures: ['Interactive market guide'],
    areaSize: 1700,
    climate: 'Tropical, rainy season June-October',
    population: 45000,
    tags: ['markets', 'trade', 'rural'],
    createdAt: Timestamp.now(),
    createdBy: [{ name: 'admin1', id: '1' }],
    editor: [{ name: 'admin1', id: '1' }],
    lock: false,
    version: 1,
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
        description: 'Part of the Sukhothai Kingdom, with historical chedi remains at Wat Grung See Jayrin.',
        events: [],
        landmarks: ['Historic chedi at Wat Grung See Jayrin'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/wat-grung-see-jayrin.jpg',
            altText: 'Wat Grung See Jayrin Chedi',
            description: 'Historical chedi at Wat Grung See Jayrin.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Bang_Krathum_District'],
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Supported Ayutthaya’s agricultural economy with fertile lands.',
        events: [],
        landmarks: [],
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Phitsanulok_Province'],
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1927, known for sugar cane production and local temples.',
        events: ['Established as a district in 1927'],
        landmarks: ['Local temples', 'Sugar cane fields'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/bang-krathum-sugar-cane.jpg',
            altText: 'Bang Krathum Sugar Cane Fields',
            description: 'Sugar cane fields in Bang Krathum District.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Bang_Krathum_District'],
      },
    ],
    culturalSignificance: 'Known for its agricultural contributions, particularly sugar cane, and historical sites.',
    visitorTips: 'Visit Wat Grung See Jayrin for historical insights and explore local sugar cane fields.',
    interactiveFeatures: ['Interactive agricultural history timeline'],
    areaSize: 420,
    climate: 'Tropical, rainy season June-October',
    population: 30000,
    tags: ['agriculture', 'historical', 'sugar cane'],
    createdAt: Timestamp.now(),
    createdBy: [{ name: 'admin2', id: '2' }],
    editor: [{ name: 'admin2', id: '2' }],
    lock: false,
    version: 1,
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
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Noen_Maprang_District'],
      },
      {
        era: 'Ayutthaya Period',
        startYear: 1438,
        endYear: 1767,
        yearRange: '15th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Served as a rural area under Ayutthaya with minimal historical significance.',
        events: [],
        landmarks: [],
        media: [],
        sources: ['https://en.wikipedia.org/wiki/Phitsanulok_Province'],
      },
      {
        era: 'Modern Era',
        startYear: 1767,
        endYear: 2025,
        yearRange: '18th Century-Present',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Established as a district in 1983, known for scenic landscapes like Ban Mung.',
        events: ['Established as a district in 1983'],
        landmarks: ['Ban Mung scenic area'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/ban-mung.jpg',
            altText: 'Ban Mung Scenic Area',
            description: 'Stunning limestone landscapes in Ban Mung.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Noen_Maprang_District'],
      },
    ],
    culturalSignificance: 'Known for its scenic landscapes and rural charm, featuring unique limestone formations.',
    visitorTips: 'Visit Ban Mung for stunning limestone landscapes and peaceful rural scenery.',
    interactiveFeatures: ['Virtual tour of Ban Mung landscapes'],
    areaSize: 780,
    climate: 'Tropical, rainy season June-October',
    population: 15000,
    tags: ['nature', 'scenic', 'rural'],
    createdAt: Timestamp.now(),
    createdBy: [{ name: 'admin1', id: '1' }],
    editor: [{ name: 'admin1', id: '1' }],
    lock: false,
    version: 1,
  },
];

export const chiangmaiDistricts: District[] = [
  {
    id: 'mueangChiangMai',
    name: 'Mueang Chiang Mai District',
    thaiName: 'อำเภอเมืองเชียงใหม่',
    mapImageUrl: 'https://example.com/mueang-chiangmai-map.png',
    googleMapsUrl: 'https://maps.google.com/?q=Mueang+Chiang+Mai',
    coordinates: { x: 250, y: 250, width: 150, height: 150 },
    historicalColor: 'rgba(239, 68, 68, 0.5)',
    historicalPeriods: [
      {
        era: 'Lanna Kingdom',
        startYear: 1296,
        endYear: 1558,
        yearRange: '13th-16th Century',
        color: 'rgba(239, 68, 68, 0.5)',
        description: 'Founded by King Mangrai in 1296 as the capital of the Lanna Kingdom.',
        events: ['Founded by King Mangrai in 1296'],
        landmarks: ['Wat Chedi Luang', 'Wat Phra Singh'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/wat-chedi-luang.jpg',
            altText: 'Wat Chedi Luang',
            description: 'Wat Chedi Luang, a significant Lanna temple.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Chiang_Mai'],
      },
      {
        era: 'Burmese Rule',
        startYear: 1558,
        endYear: 1774,
        yearRange: '16th-18th Century',
        color: 'rgba(59, 130, 246, 0.5)',
        description: 'Under Burmese control from 1558 until liberation in 1774.',
        events: ['Conquered by Burmese in 1558', 'Liberated from Burmese in 1774'],
        landmarks: ['Wat Phra That Doi Suthep'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/wat-phra-that-doi-suthep.jpg',
            altText: 'Wat Phra That Doi Suthep',
            description: 'Wat Phra That Doi Suthep, a key temple from the Burmese period.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Mueang_Chiang_Mai_District'],
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
        media: [
          {
            type: 'image',
            url: 'https://example.com/chiang-mai-old-city.jpg',
            altText: 'Chiang Mai Old City',
            description: 'The historic Old City of Chiang Mai.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Chiang_Mai'],
      },
      {
        era: 'Modern Era',
        startYear: 1900,
        endYear: 2025,
        yearRange: '20th-21st Century',
        color: 'rgba(34, 197, 94, 0.5)',
        description: 'Transitioned into a modern city, becoming a cultural and tourist hub.',
        events: ['Establishment of Chiang Mai University in 1964', 'Hosting of the 2006 ASEAN Summit'],
        landmarks: ['Chiang Mai Night Market', 'Doi Suthep Temple', 'Chiang Mai University'],
        media: [
          {
            type: 'image',
            url: 'https://example.com/chiang-mai-night-market.jpg',
            altText: 'Chiang Mai Night Market',
            description: 'The bustling Chiang Mai Night Market, a modern tourist attraction.',
          },
        ],
        sources: ['https://en.wikipedia.org/wiki/Chiang_Mai_University'],
      },
    ],
    culturalSignificance: 'The cultural and historical heart of Chiang Mai, known for its Lanna heritage and modern tourism.',
    visitorTips: 'Visit the Night Market and Doi Suthep Temple for a rich cultural experience; explore the Old City for historical insights.',
    interactiveFeatures: ['360-degree virtual tour of Chiang Mai Old City'],
    areaSize: 230,
    climate: 'Tropical, cooler due to elevation',
    population: 150000,
    tags: ['Lanna', 'culture', 'tourism', 'historical'],
    createdAt: Timestamp.now(),
    createdBy: [{ name: 'admin1', id: '1' }],
    editor: [{ name: 'admin1', id: '1' }],
    lock: false,
    version: 1,
  },
];

// Utility functions
export const getDistrictById = (districts: District[], districtId: string): District | undefined => {
  return districts.find((district) => district.id === districtId);
};