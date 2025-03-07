// app/api/map-editor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFirestore, collection, getDocs, updateDoc, doc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp, getApps } from "firebase/app";

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
  
// Log config for debugging
console.log("Firebase Config:", firebaseConfig);

// Initialize Firebase only if not already initialized
if (!getApps().length) {
  if (!firebaseConfig || !firebaseConfig.projectId) {
    throw new Error("Firebase configuration is invalid or missing projectId");
  }
  initializeApp(firebaseConfig);
}

const db = getFirestore();
const storage = getStorage();

// GET: Fetch provinces and districts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provinceId = searchParams.get("provinceId");

  try {
    if (provinceId) {
      const provinceDoc = await getDocs(collection(db, `provinces/${provinceId}/districts`));
      const districts = provinceDoc.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return NextResponse.json({ districts });
    }

    const provincesSnapshot = await getDocs(collection(db, "provinces"));
    const provincesData = await Promise.all(
      provincesSnapshot.docs.map(async (doc) => {
        const districtsSnapshot = await getDocs(collection(db, `provinces/${doc.id}/districts`));
        const districts = districtsSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        return {
          id: doc.id,
          ...doc.data(),
          districts,
        };
      })
    );

    return NextResponse.json(provincesData);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create new province, district, or media
export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    if (!type || !data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "province") {
      const provinceRef = doc(db, "provinces", data.id || data.name.toLowerCase().replace(/\s/g, "-"));
      await setDoc(provinceRef, {
        name: data.name,
        thaiName: data.thaiName,
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ id: provinceRef.id, ...data, districts: [] }, { status: 201 });
    }

    if (type === "district") {
      const { provinceId, ...districtData } = data;
      if (!provinceId) {
        return NextResponse.json({ error: "Province ID is required" }, { status: 400 });
      }
      const districtRef = await addDoc(collection(db, `provinces/${provinceId}/districts`), {
        ...districtData,
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ id: districtRef.id, ...districtData }, { status: 201 });
    }

    if (type === "media") {
      const { provinceId, districtId, file, periodIndex } = data;
      if (!provinceId || !districtId || !file) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const fileRef = ref(storage, `media/${provinceId}/${districtId}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, Buffer.from(file.buffer));
      const url = await getDownloadURL(fileRef);

      const districtRef = doc(db, `provinces/${provinceId}/districts`, districtId);
      const districtSnap = await getDocs(collection(db, `provinces/${provinceId}/districts`));
      const districtData = districtSnap.docs.find((d) => d.id === districtId)?.data();

      if (!districtData) {
        return NextResponse.json({ error: "District not found" }, { status: 404 });
      }

      const historicalPeriods = districtData.historicalPeriods || [];
      historicalPeriods[periodIndex].media = historicalPeriods[periodIndex].media || [];
      historicalPeriods[periodIndex].media.push({
        type: file.type.includes("image") ? "image" : "video",
        url,
        description: "",
      });

      await updateDoc(districtRef, { historicalPeriods });
      return NextResponse.json({ url });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update province, district, or map image
export async function PUT(req: NextRequest) {
  try {
    const { type, id, data, provinceId } = await req.json();

    if (!type || !id || !data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "province") {
      const provinceRef = doc(db, "provinces", id);
      await updateDoc(provinceRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ id, ...data });
    }

    if (type === "district") {
      if (!provinceId) {
        return NextResponse.json({ error: "Province ID is required" }, { status: 400 });
      }
      const districtRef = doc(db, `provinces/${provinceId}/districts`, id);
      await updateDoc(districtRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ id, ...data });
    }

    if (type === "mapImage") {
      const { provinceId, districtId, file } = data;
      if (!provinceId || !districtId || !file) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      let url;
      if (file.buffer) {
        const fileRef = ref(storage, `maps/${provinceId}/${districtId}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, Buffer.from(file.buffer));
        url = await getDownloadURL(fileRef);
      } else if (file.url) {
        url = file.url; // Use provided URL directly
      } else {
        return NextResponse.json({ error: "File or URL required" }, { status: 400 });
      }

      const districtRef = doc(db, `provinces/${provinceId}/districts`, districtId);
      await updateDoc(districtRef, { mapImageUrl: url });
      return NextResponse.json({ url });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete province or district
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const provinceId = searchParams.get("provinceId");

  try {
    if (!type || !id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "province") {
      await deleteDoc(doc(db, "provinces", id));
      return new NextResponse(null, { status: 204 });
    }

    if (type === "district") {
      if (!provinceId) {
        return NextResponse.json({ error: "Province ID is required" }, { status: 400 });
      }
      await deleteDoc(doc(db, `provinces/${provinceId}/districts`, id));
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}