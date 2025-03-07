// scripts/seedFirebase.ts
import { provinces } from '../lib/provinces';

// Initialize Firebase Admin SDK
const admin = require("firebase-admin");

const serviceAccount = require("./path/to/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Function to seed the provinces data into Firestore
const seedFirebase = async () => {
  console.log('Starting to seed Firebase with provinces data...');

  try {
    // Iterate over each province in the static data
    for (const province of provinces) {
      console.log(`Seeding province: ${province.name} (${province.thaiName})`);

      // Prepare the province data (without districts array)
      const provinceData = {
        id: province.id,
        name: province.name,
        thaiName: province.thaiName,
      };

      // Reference to the province document in the 'provinces' collection
      const provinceRef = db.collection('provinces').doc(province.id);

      // Upload the province data to Firestore
      await provinceRef.set(provinceData);
      console.log(`Successfully seeded province document: ${province.name}`);

      // Reference to the 'districts' subcollection under the province
      const districtsCollection = provinceRef.collection('districts');

      // Iterate over each district in the province
      for (const district of province.districts) {
        console.log(`Seeding district: ${district.name} (${district.thaiName}) under province: ${province.name}`);

        // Prepare the district data (updated to match new District interface)
        const districtData = {
          id: district.id,
          name: district.name,
          thaiName: district.thaiName,
          mapPath: district.mapPath || null, // Updated to handle optional mapPath
          mapImageUrl: district.mapImageUrl || null, // Added mapImageUrl field
          coordinates: district.coordinates || { x: 0, y: 0, width: 0, height: 0 }, // Updated coordinates with width and height
          historicalColor: district.historicalColor,
          historicalPeriods: district.historicalPeriods.map((period) => ({
            era: period.era,
            yearRange: period.yearRange,
            color: period.color,
            description: period.description,
            events: period.events,
            landmarks: period.landmarks,
            media: period.media.map((mediaItem) => ({
              type: mediaItem.type,
              url: mediaItem.url,
              description: mediaItem.description || null,
            })),
          })),
          collab: district.collab
            ? {
                novelTitle: district.collab.novelTitle,
                storylineSnippet: district.collab.storylineSnippet,
                characters: district.collab.characters,
                relatedLandmarks: district.collab.relatedLandmarks,
                media: district.collab.media.map((mediaItem) => ({
                  type: mediaItem.type,
                  url: mediaItem.url,
                  description: mediaItem.description || null,
                })),
                isActive: district.collab.isActive,
              }
            : null, // Added collab field as optional
          culturalSignificance: district.culturalSignificance || null,
          visitorTips: district.visitorTips || null,
          interactiveFeatures: district.interactiveFeatures || null,
        };

        // Upload the district data to the 'districts' subcollection
        await districtsCollection.doc(district.id).set(districtData);
        console.log(`Successfully seeded district: ${district.name}`);
      }
    }

    console.log('All provinces and their districts have been successfully seeded to Firestore!');
  } catch (error) {
    console.error('Error seeding data to Firestore:', error);
    process.exit(1);
  } finally {
    // Close the Firebase app
    await admin.app().delete();
    console.log('Firebase Admin SDK connection closed.');
  }
};

// Run the seeding function
seedFirebase().then(() => {
  console.log('Seeding process completed.');
  process.exit(0);
});