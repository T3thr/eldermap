// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-config";

interface AdminData {
  email: string;
  name: string;
  username: string;
}

interface Province {
  id: string;
  name: string;
  thaiName: string;
  districtCount: number;
}

interface DashboardData {
  totalProvinces: number;
  totalAdmins: number;
  totalDistricts: number;
  provinces: Province[];
  admins: AdminData[];
}

export async function GET() {
  try {
    // Get provinces data
    const provincesSnapshot = await getDocs(collection(db, "provinces"));
    const provinces: Province[] = [];
    let totalDistricts = 0;

    // Process each province
    for (const doc of provincesSnapshot.docs) {
      const provinceData = doc.data();

      // Count districts in subcollection
      const districtsSnapshot = await getDocs(
        collection(db, `provinces/${doc.id}/districts`)
      );
      const districtCount = districtsSnapshot.size;
      totalDistricts += districtCount;

      provinces.push({
        id: doc.id,
        name: provinceData.name || doc.id,
        thaiName: provinceData.thaiName || "",
        districtCount,
      });
    }

    // Get admins data
    const adminsSnapshot = await getDocs(collection(db, "admins"));
    const admins = adminsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        email: data.email || "",
        name: data.name || "",
        username: data.username || "",
      };
    });

    const dashboardData: DashboardData = {
      totalProvinces: provincesSnapshot.size,
      totalAdmins: adminsSnapshot.size,
      totalDistricts,
      provinces,
      admins,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}