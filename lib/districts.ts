// lib/districts.ts
export interface Media {
  type: 'image' | 'audio' | 'video' | 'text' | 'map';
  url: string;
  description?: string;
}

export interface HistoricalPeriod {
  yearRange: string;
  era: string;
  color: string;
  description: string;
  events: string[];
  landmarks: string[];
  media: Media[];
}

export interface CollabData {
  novelTitle: string;
  storylineSnippet: string;
  characters: string[];
  relatedLandmarks: string[];
  media: Media[];
  isActive: boolean;
}

export interface District {
  id: string;
  name: string;
  thaiName: string;
  mapPath?: string; // SVG path for district shape (optional)
  mapImageUrl?: string; // URL to uploaded image (optional, alternative to mapPath)
  coordinates: { x: number; y: number; width: number; height: number }; // Updated for precise positioning and sizing
  historicalColor: string;
  historicalPeriods: HistoricalPeriod[];
  collab?: CollabData; // Conditional collab data for specific districts
  culturalSignificance?: string;
  visitorTips?: string;
  interactiveFeatures?: string[];
}

export interface Province {
  id: string;
  name: string;
  thaiName: string;
  districts: District[];
}

// Phitsanulok Districts with updated schema
export const phitsanulokDistricts: District[] = [
  {
    id: "muang",
    name: "Muang District",
    thaiName: "อ.เมือง",
    mapImageUrl: "https://example.com/muang-district-map.png", // Example image URL
    coordinates: { x: 250, y: 150, width: 150, height: 150 },
    historicalColor: "rgba(239, 68, 68, 0.5)",
    historicalPeriods: [
      {
        era: "Sukhothai Kingdom",
        yearRange: "13th-14th Century",
        color: "rgba(239, 68, 68, 0.5)",
        description: "Historically known as Song Khwae, Muang District was a crucial administrative and cultural center during the Sukhothai Kingdom, founded by King Thammaracha I in 1357.",
        events: [
          "Founded by King Thammaracha I in 1357",
          "Construction of Wat Phra Si Rattana Mahathat in the 14th century",
          "Became the royal seat in 1378"
        ],
        landmarks: [
          "Wat Phra Si Rattana Mahathat (Phra Buddha Chinnarat statue)",
          "Wat Aranyik (moated ruins)",
          "Ancient City Walls"
        ],
        media: [
          {
            type: "image",
            url: "https://commons.wikimedia.org/wiki/File:Wat_Phra_Si_Rattana_Mahathat_Phitsanulok.jpg",
            description: "Wat Phra Si Rattana Mahathat, housing the revered Phra Buddha Chinnarat statue."
          },
          {
            type: "image",
            url: "https://commons.wikimedia.org/wiki/File:Wat_Aranyik_Phitsanulok.jpg",
            description: "Historical ruins of Wat Aranyik from the Sukhothai period."
          },
          {
            type: "video",
            url: "https://www.youtube.com/watch?v=example-muang-history",
            description: "A virtual tour of Muang District’s historical sites."
          }
        ]
      },
      {
        era: "Ayutthaya Period",
        yearRange: "13th-14th Century",
        color: "rgba(245, 158, 11, 0.5)",
        description: "Muang District continued to thrive as a regional center during the Ayutthaya Kingdom, serving as a key trade hub along the Nan River.",
        events: [
          "Expansion of trade routes along the Nan River",
          "Royal visits from Ayutthaya kings",
          "Strengthening of Wat Phra Si Rattana Mahathat as a religious center"
        ],
        landmarks: [
          "Wat Phra Si Rattana Mahathat (expanded)",
          "Traditional Market Areas along the river"
        ],
        media: [
          {
            type: "image",
            url: "https://example.com/ayutthaya-trade-routes.jpg",
            description: "An illustration of trade routes during the Ayutthaya period."
          }
        ]
      },
      {
        era: "Modern Era",
        yearRange: "19th Century-Present",
        color: "rgba(34, 197, 94, 0.5)",
        description: "The central district of Phitsanulok, known for modern urban development and administrative significance, Muang District has evolved into a bustling hub with cultural and economic importance.",
        events: [
          "Annual City Festival",
          "Development as a Modern Economic Hub",
          "Establishment as a Tech Innovation Center"
        ],
        landmarks: [
          "City Hall",
          "Modern Shopping Centers",
          "Provincial Government Complex"
        ],
        media: []
      }
    ],
    collab: {
      novelTitle: "The Lost Kingdom",
      storylineSnippet: "A tale of a hidden royal lineage rediscovered in Muang District, intertwining history with fantasy.",
      characters: ["Prince Aran", "Sorceress Lita"],
      relatedLandmarks: ["Wat Phra Si Rattana Mahathat", "Ancient City Walls"],
      media: [
        {
          type: "image",
          url: "https://example.com/lost-kingdom-muang.jpg",
          description: "Artwork depicting the fictional royal lineage in Muang."
        }
      ],
      isActive: true
    },
    culturalSignificance: "Muang District is the historical heart of Phitsanulok, home to the iconic Phra Buddha Chinnarat, considered one of Thailand’s most beautiful Buddha images.",
    visitorTips: "Visit Wat Phra Si Rattana Mahathat in the early morning to avoid crowds and experience the serene atmosphere. Don’t miss the annual Phra Buddha Chinnarat Fair in February.",
    interactiveFeatures: ["360-degree virtual tour of Wat Phra Si Rattana Mahathat", "Historical timeline slider", "Interactive quiz on Sukhothai history"]
  },
  {
    id: "chatTrakan",
    name: "Chat Trakan District",
    thaiName: "อ.ชาติตระการ",
    mapImageUrl: "https://example.com/chat-trakan-district-map.png",
    coordinates: { x: 200, y: 100, width: 150, height: 150 },
    historicalColor: "rgba(245, 158, 11, 0.5)",
    historicalPeriods: [
      {
        era: "Sukhothai Kingdom",
        yearRange: "13th-14th Century",
        color: "rgba(239, 68, 68, 0.5)",
        description: "Chat Trakan was a strategic outpost during the Sukhothai era, surrounded by dense forests, likely used for resource gathering.",
        events: [
          "Served as a military outpost for Sukhothai forces",
          "Forest resource trade hub"
        ],
        landmarks: [
          "Ancient Fortresses",
          "Historical Trails"
        ],
        media: [
          {
            type: "image",
            url: "https://example.com/chat-trakan-forest.jpg",
            description: "A depiction of the dense forests surrounding Chat Trakan during the Sukhothai period."
          }
        ]
      },
      {
        era: "Ayutthaya Period",
        yearRange: "13th-14th Century",
        color: "rgba(245, 158, 11, 0.5)",
        description: "During the Ayutthaya Kingdom, Chat Trakan continued to be a strategic outpost, leveraging its natural resources and location for trade and defense.",
        events: [
          "Continued as a military outpost",
          "Trade in forest resources"
        ],
        landmarks: [],
        media: []
      },
      {
        era: "Modern Era",
        yearRange: "19th Century-Present",
        color: "rgba(96, 165, 250, 0.5)",
        description: "Chat Trakan has evolved into an eco-tourism destination, preserving its natural heritage while maintaining its rural charm.",
        events: [
          "Establishment of Namtok Chat Trakan National Park in 1987",
          "Local Farming Festivals",
          "Growth of Eco-Tourism"
        ],
        landmarks: [
          "Namtok Chat Trakan National Park",
          "Chat Trakan Waterfall",
          "Local Temples"
        ],
        media: [
          {
            type: "image",
            url: "https://commons.wikimedia.org/wiki/File:Namtok_Chat_Trakan_National_Park.jpg",
            description: "The stunning Chat Trakan Waterfall in Namtok Chat Trakan National Park."
          }
        ]
      }
    ],
    culturalSignificance: "Chat Trakan offers a glimpse into rural Thai life, with its lush landscapes and traditional farming practices.",
    visitorTips: "Explore Namtok Chat Trakan National Park for hiking and waterfall views. Bring insect repellent for forest trails.",
    interactiveFeatures: ["Virtual hike through Namtok Chat Trakan National Park", "Eco-tourism quiz"]
  },
  {
    id: "nakhonThai",
    name: "Nakhon Thai District",
    thaiName: "อ.นครไทย",
    mapImageUrl: "https://example.com/nakhon-thai-district-map.png",
    coordinates: { x: 350, y: 50, width: 150, height: 150 },
    historicalColor: "rgba(168, 85, 247, 0.5)",
    historicalPeriods: [
      {
        era: "Sukhothai Kingdom",
        yearRange: "13th-14th Century",
        color: "rgba(239, 68, 68, 0.5)",
        description: "Nakhon Thai was part of the Sukhothai Kingdom, with some historical remains suggesting its role in regional trade.",
        events: [
          "Part of Lanna-Sukhothai trade routes",
          "Royal visits from Sukhothai kings"
        ],
        landmarks: [
          "Old Temples",
          "Historical Ruins"
        ],
        media: [
          {
            type: "image",
            url: "https://example.com/nakhon-thai-ruins.jpg",
            description: "Historical ruins in Nakhon Thai from the Sukhothai period."
          }
        ]
      },
      {
        era: "Ayutthaya Period",
        yearRange: "13th-14th Century",
        color: "rgba(245, 158, 11, 0.5)",
        description: "During the Ayutthaya Kingdom, Nakhon Thai maintained its cultural and historical significance, likely contributing to regional trade and defense.",
        events: [
          "Continued trade along established routes",
          "Strengthening of local temples"
        ],
        landmarks: [],
        media: []
      },
      {
        era: "Modern Era",
        yearRange: "19th Century-Present",
        color: "rgba(251, 146, 60, 0.5)",
        description: "Nakhon Thai has become a cultural tourism destination, known for its natural beauty and historical attractions.",
        events: [
          "Establishment of Phu Hin Rong Kla National Park in 1984",
          "Cultural Festivals",
          "Tourism Boom"
        ],
        landmarks: [
          "Phu Hin Rong Kla National Park",
          "Nakhon Thai Museum",
          "Tourist Resorts"
        ],
        media: [
          {
            type: "image",
            url: "https://commons.wikimedia.org/wiki/File:Phu_Hin_Rong_Kla_National_Park.jpg",
            description: "Scenic views of Phu Hin Rong Kla National Park."
          }
        ]
      }
    ],
    collab: {
      novelTitle: "Echoes of the Highlands",
      storylineSnippet: "A mystical adventure set in Nakhon Thai, where ancient spirits guide a modern explorer through Phu Hin Rong Kla.",
      characters: ["Explorer Kai", "Spirit Guardian Nia"],
      relatedLandmarks: ["Phu Hin Rong Kla National Park", "Nakhon Thai Museum"],
      media: [
        {
          type: "image",
          url: "https://example.com/echoes-highlands-nakhon.jpg",
          description: "Artwork of the mystical journey in Nakhon Thai."
        }
      ],
      isActive: true
    },
    culturalSignificance: "Nakhon Thai blends historical significance with natural beauty, offering insights into both Sukhothai history and modern Thai culture.",
    visitorTips: "Visit Phu Hin Rong Kla National Park for historical insights into Thailand’s communist insurgency era and stunning views.",
    interactiveFeatures: ["Virtual tour of Phu Hin Rong Kla", "Historical trade route map"]
  },
  {
    id: "bangRakam",
    name: "Bang Rakam District",
    thaiName: "อ.บางระกำ",
    mapImageUrl: "https://example.com/bang-rakam-district-map.png",
    coordinates: { x: 150, y: 200, width: 150, height: 150 },
    historicalColor: "rgba(139, 92, 246, 0.5)",
    historicalPeriods: [
      {
        era: "Sukhothai Kingdom",
        yearRange: "13th-14th Century",
        color: "rgba(239, 68, 68, 0.5)",
        description: "Bang Rakam played a role in river trade and agriculture during the Sukhothai Kingdom, leveraging its position along the Nan River.",
        events: [
          "Development of river trade hubs",
          "Use of ancient irrigation systems"
        ],
        landmarks: [
          "Ancient Docks",
          "Historical Temples"
        ],
        media: [
          {
            type: "image",
            url: "https://example.com/bang-rakam-river-trade.jpg",
            description: "An illustration of river trade along the Nan River during Sukhothai times."
          }
        ]
      },
      {
        era: "Ayutthaya Period",
        yearRange: "13th-14th Century",
        color: "rgba(245, 158, 11, 0.5)",
        description: "During the Ayutthaya Kingdom, Bang Rakam was part of Phitsanulok province, contributing to the kingdom's agricultural and economic growth along the Nan River.",
        events: [
          "Expansion of river-based agriculture",
          "Trade with Ayutthaya centers"
        ],
        landmarks: [],
        media: []
      },
      {
        era: "Modern Era",
        yearRange: "19th Century-Present",
        color: "rgba(253, 224, 71, 0.5)",
        description: "Bang Rakam remains an agricultural hub, focusing on rice farming and river-based tourism, preserving its serene landscapes.",
        events: [
          "Establishment as a district in 1905",
          "Rice Harvest Festival",
          "Development of River Tourism"
        ],
        landmarks: [
          "Nan River Park",
          "Rice Fields",
          "Local Temples"
        ],
        media: [
          {
            type: "image",
            url: "https://example.com/nan-river-park.jpg",
            description: "A serene view of Nan River Park in Bang Rakam."
          }
        ]
      }
    ],
    culturalSignificance: "Bang Rakam showcases Thailand’s agricultural heritage, with its rice fields and river-based traditions.",
    visitorTips: "Join the Rice Harvest Festival in November to experience local traditions and taste authentic Thai rice dishes.",
    interactiveFeatures: ["Virtual boat tour along the Nan River", "Rice farming interactive game"]
  },
  {
    id: "wangThong",
    name: "Wang Thong District",
    thaiName: "อ.วังทอง",
    mapImageUrl: "https://example.com/wang-thong-district-map.png",
    coordinates: { x: 400, y: 200, width: 150, height: 150 },
    historicalColor: "rgba(234, 179, 8, 0.5)",
    historicalPeriods: [
      {
        era: "Sukhothai Kingdom",
        yearRange: "13th-14th Century",
        color: "rgba(239, 68, 68, 0.5)",
        description: "Wang Thong was a strategic area during the Sukhothai Kingdom, known for its natural resources and military significance.",
        events: [
          "Resource mining activities",
          "Served as a military stronghold"
        ],
        landmarks: [
          "Ancient Mining Sites",
          "Historical Forts"
        ],
        media: [
          {
            type: "image",
            url: "https://example.com/wang-thong-forts.jpg",
            description: "Remains of historical forts in Wang Thong from the Sukhothai period."
          }
        ]
      },
      {
        era: "Ayutthaya Period",
        yearRange: "13th-14th Century",
        color: "rgba(245, 158, 11, 0.5)",
        description: "During the Ayutthaya Kingdom, Wang Thong continued to be an integral part of Phitsanulok province, supporting resource extraction and defense.",
        events: [
          "Continued resource mining",
          "Strengthened as a defensive outpost"
        ],
        landmarks: [],
        media: []
      },
      {
        era: "Modern Era",
        yearRange: "19th Century-Present",
        color: "rgba(14, 165, 233, 0.5)",
        description: "Wang Thong has become a popular eco-tourism destination, famous for its natural attractions like waterfalls and caves.",
        events: [
          "Establishment as a district in 1895",
          "Eco-Tourism Festivals",
          "Cave Exploration Growth"
        ],
        landmarks: [
          "Wang Thong Waterfall",
          "Caves",
          "Tourist Centers"
        ],
        media: [
          {
            type: "image",
            url: "https://example.com/wang-thong-waterfall.jpg",
            description: "The picturesque Wang Thong Waterfall, a highlight of the district."
          }
        ]
      }
    ],
    culturalSignificance: "Wang Thong offers a mix of historical significance and natural beauty, ideal for eco-tourism enthusiasts.",
    visitorTips: "Visit Wang Thong Waterfall during the rainy season (June-October) for the best views, and wear sturdy shoes for cave exploration.",
    interactiveFeatures: ["Virtual cave exploration", "Eco-tourism scavenger hunt"]
  },
  {
    id: "phromPhiram",
    name: "Phrom Phiram District",
    thaiName: "อ.พรหมพิราม",
    mapImageUrl: "https://example.com/phrom-phiram-district-map.png",
    coordinates: { x: 250, y: 250, width: 150, height: 150 },
    historicalColor: "rgba(252, 165, 165, 0.5)",
    historicalPeriods: [
      {
        era: "Sukhothai Kingdom",
        yearRange: "13th-14th Century",
        color: "rgba(239, 68, 68, 0.5)",
        description: "Phrom Phiram was significant during the Sukhothai Kingdom, with archaeological findings of city walls and Sukhothai Celadon in 1972.",
        events: [
          "Discovery of city walls and Chedi basements in 1972",
          "Trade center along Phra Ruang Road"
        ],
        landmarks: [
          "Remains of Mueang Phrom Phiram",
          "Sukhothai Celadon sites"
        ],
        media: [
          {
            type: "image",
            url: "https://example.com/phrom-phiram-ruins.jpg",
            description: "Archaeological remains of Mueang Phrom Phiram from the Sukhothai period."
          }
        ]
      },
      {
        era: "Ayutthaya Period",
        yearRange: "13th-14th Century",
        color: "rgba(245, 158, 11, 0.5)",
        description: "During the Ayutthaya Kingdom, Phrom Phiram remained part of Phitsanulok province, supporting trade and agriculture with its strategic location.",
        events: [
          "Continued trade along Phra Ruang Road",
          "Development of local agriculture"
        ],
        landmarks: [],
        media: []
      },
      {
        era: "Modern Era",
        yearRange: "19th Century-Present",
        color: "rgba(134, 239, 172, 0.5)",
        description: "Phrom Phiram continues to thrive as an agricultural and cultural hub, known for its productivity and heritage.",
        events: [
          "Growth of agricultural fairs and festivals",
          "Cultural Festivals",
          "Expansion of Local Markets"
        ],
        landmarks: [
          "Phrom Phiram Temple",
          "Rice Fields",
          "Local Museums"
        ],
        media: [
          {
            type: "image",
            url: "https://example.com/phrom-phiram-temple.jpg",
            description: "The beautiful Phrom Phiram Temple, a cultural landmark."
          }
        ]
      }
    ],
    culturalSignificance: "Phrom Phiram offers a deep dive into Sukhothai archaeology and modern Thai agricultural traditions.",
    visitorTips: "Visit during the agricultural fairs to experience local culture and taste fresh produce from the region.",
    interactiveFeatures: ["Archaeological dig simulation", "Cultural festival virtual experience"]
  },
  {
    id: "noenMaprang",
    name: "Noen Maprang District",
    thaiName: "อ.เนินมะปราง",
    mapImageUrl: "https://example.com/noen-maprang-district-map.png",
    coordinates: { x: 400, y: 100, width: 150, height: 150 },
    historicalColor: "rgba(192, 132, 252, 0.5)",
    historicalPeriods: [
      {
        era: "Sukhothai Kingdom",
        yearRange: "13th-14th Century",
        color: "rgba(239, 68, 68, 0.5)",
        description: "Noen Maprang was a remote area during the Sukhothai Kingdom, with strategic mountain passes used for trade and defense.",
        events: [
          "Utilized mountain trade routes",
          "Served as a strategic outpost"
        ],
        landmarks: [
          "Ancient Passes",
          "Historical Forts"
        ],
        media: [
          {
            type: "image",
            url: "https://example.com/noen-maprang-passes.jpg",
            description: "Ancient mountain passes in Noen Maprang from the Sukhothai period."
          }
        ]
      },
      {
        era: "Ayutthaya Period",
        yearRange: "13th-14th Century",
        color: "rgba(245, 158, 11, 0.5)",
        description: "During the Ayutthaya Kingdom, Noen Maprang remained a remote but strategic area, supporting trade and defense with its mountain passes.",
        events: [
          "Continued use of mountain trade routes",
          "Maintained as a defensive outpost"
        ],
        landmarks: [],
        media: []
      },
      {
        era: "Modern Era",
        yearRange: "19th Century-Present",
        color: "rgba(252, 211, 77, 0.5)",
        description: "Noen Maprang has developed into an eco-tourism destination with its mountainous landscapes and natural beauty.",
        events: [
          "Establishment as a district in 1976",
          "Eco-Tourism Growth",
          "Mountain Festivals"
        ],
        landmarks: [
          "Noen Maprang Mountains",
          "National Parks",
          "Local Temples"
        ],
        media: [
          {
            type: "image",
            url: "https://example.com/noen-maprang-mountains.jpg",
            description: "The scenic Noen Maprang Mountains, a modern eco-tourism attraction."
          }
        ]
      }
    ],
    culturalSignificance: "Noen Maprang combines historical trade routes with breathtaking natural scenery, perfect for history and nature lovers.",
    visitorTips: "Hike the Noen Maprang Mountains for panoramic views, and visit during the Mountain Festivals for cultural experiences.",
    interactiveFeatures: ["Virtual mountain hike", "Trade route history quiz"]
  }
];

// Chiang Mai Districts with updated schema
export const chiangMaiDistricts: District[] = [
  {
    id: "muang-chiangmai",
    name: "Muang Chiang Mai District",
    thaiName: "อ.เมืองเชียงใหม่",
    mapImageUrl: "https://example.com/muang-chiangmai-district-map.png",
    coordinates: { x: 50, y: 50, width: 150, height: 150 },
    historicalColor: "rgba(245, 158, 11, 0.5)",
    historicalPeriods: [
      {
        era: "Lanna Kingdom",
        yearRange: "13th-18th Century",
        color: "rgba(245, 158, 11, 0.5)",
        description: "Muang Chiang Mai was the capital of the Lanna Kingdom, founded in 1296 by King Mangrai, known for its ancient temples and royal heritage.",
        events: [
          "Founding of Chiang Mai by King Mangrai in 1296",
          "Construction of Wat Phra That Doi Suthep in 1383",
          "Trade with China and neighboring regions"
        ],
        landmarks: [
          "Wat Phra That Doi Suthep",
          "Old City Walls",
          "Lanna Royal Palace"
        ],
        media: [
          {
            type: "image",
            url: "https://commons.wikimedia.org/wiki/File:Wat_Phra_That_Doi_Suthep.jpg",
            description: "Wat Phra That Doi Suthep, a sacred temple overlooking Chiang Mai."
          },
          {
            type: "video",
            url: "https://www.youtube.com/watch?v=example-chiangmai-history",
            description: "A historical overview of Chiang Mai’s Lanna Kingdom era."
          }
        ]
      },
      {
        era: "Modern Era",
        yearRange: "19th Century-Present",
        color: "rgba(34, 211, 238, 0.5)",
        description: "Muang Chiang Mai has transformed into a global tourism destination, known for its festivals and markets, making it the heart of modern Chiang Mai.",
        events: [
          "Yi Peng Lantern Festival established as a major event",
          "Growth of the Night Bazaar",
          "Chiang Mai Flower Festival"
        ],
        landmarks: [
          "Night Bazaar",
          "Chiang Mai Zoo",
          "Central Festival Mall"
        ],
        media: [
          {
            type: "image",
            url: "https://commons.wikimedia.org/wiki/File:Chiang_Mai_Night_Bazaar.jpg",
            description: "The vibrant Night Bazaar in Muang Chiang Mai."
          }
        ]
      }
    ],
    culturalSignificance: "Muang Chiang Mai is the cultural capital of Northern Thailand, famous for its Lanna heritage and vibrant festivals.",
    visitorTips: "Visit during the Yi Peng Lantern Festival in November to witness thousands of lanterns lighting up the sky.",
    interactiveFeatures: ["360-degree view of Wat Phra That Doi Suthep", "Lanna culture quiz"]
  }
];

// Utility functions
export const getProvinceById = (provinces: Province[], id: string): Province | undefined => {
  return provinces.find((province) => province.id === id);
};

export const getDistrictById = (provinces: Province[], provinceId: string, districtId: string): District | undefined => {
  const province = getProvinceById(provinces, provinceId);
  return province?.districts.find((district) => district.id === districtId);
};