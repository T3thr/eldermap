// lib/firebase-config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Add Firebase Storage
import { getAnalytics, isSupported } from "firebase/analytics";
import { useState, useEffect } from "react";
import { District, Province } from "./districts";
import { provinces as staticProvinces } from "./provinces"; // Fallback static data

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (avoid re-initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

// Initialize analytics only on client-side where supported
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { db, app, storage, analytics };  // Export storage as well

// Custom hook to fetch provinces and districts from Firebase
export function useFirebaseProvinces() {
  const [provinces, setProvinces] = useState<Province[]>(staticProvinces); // Fallback to static data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "provinces"),
      async (snapshot) => {
        const provinceData: Province[] = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            
            // Fetch subcollection 'districts'
            const districtsSnapshot = await getDocs(collection(doc.ref, "districts"));
            
            const districts: District[] = districtsSnapshot.docs.map((districtDoc) => {
              const districtData = districtDoc.data();
              return {
                id: districtData.id || "",
                name: districtData.name || "",
                thaiName: districtData.thaiName || "",
                mapPath: districtData.mapPath || undefined, // Updated to handle optional mapPath
                mapImageUrl: districtData.mapImageUrl || undefined, // Added mapImageUrl field
                coordinates: districtData.coordinates || { x: 0, y: 0, width: 0, height: 0 }, // Updated coordinates with required width and height
                historicalColor: districtData.historicalColor || "",
                historicalPeriods: (districtData.historicalPeriods || []).map((period: any) => ({
                  era: period.era || "",
                  yearRange: period.yearRange || "",
                  color: period.color || "",
                  description: period.description || "",
                  events: period.events || [],
                  landmarks: period.landmarks || [],
                  media: (period.media || []).map((mediaItem: any) => ({
                    type: mediaItem.type || "",
                    url: mediaItem.url || "",
                    description: mediaItem.description || undefined,
                  })),
                })),
                collab: districtData.collab
                  ? {
                      novelTitle: districtData.collab.novelTitle || "",
                      storylineSnippet: districtData.collab.storylineSnippet || "",
                      characters: districtData.collab.characters || [],
                      relatedLandmarks: districtData.collab.relatedLandmarks || [],
                      media: (districtData.collab.media || []).map((mediaItem: any) => ({
                        type: mediaItem.type || "",
                        url: mediaItem.url || "",
                        description: mediaItem.description || undefined,
                      })),
                      isActive: districtData.collab.isActive || false,
                    }
                  : undefined, // Added collab field as optional
                culturalSignificance: districtData.culturalSignificance || undefined,
                visitorTips: districtData.visitorTips || undefined,
                interactiveFeatures: districtData.interactiveFeatures || undefined,
              };
            });

            return {
              id: doc.id,
              name: data.name || "",
              thaiName: data.thaiName || "",
              districts,
            };
          })
        );
        setProvinces(provinceData.length > 0 ? provinceData : staticProvinces); // Use static data if Firebase is empty
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching provinces:", error);
        setProvinces(staticProvinces); // Fallback to static data on error
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { provinces, loading };
}