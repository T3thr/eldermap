"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-config";

interface AnalyticsData {
  totalDistricts: number;
  totalProvinces: number;
  pendingRequests: number;
  recentUpdates: { district: string; date: string }[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalDistricts: 0,
    totalProvinces: 0,
    pendingRequests: 0,
    recentUpdates: [],
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/admin/login");
    }
  }, [status]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Get districts count
        const districtsSnapshot = await getDocs(collection(db, "districts"));
        const totalDistricts = districtsSnapshot.size;

        // Get provinces count
        const provincesSnapshot = await getDocs(collection(db, "provinces"));
        const totalProvinces = provincesSnapshot.size;

        // Get pending admin requests
        const requestsSnapshot = await getDocs(collection(db, "adminRequests"));
        const pendingRequests = requestsSnapshot.docs.filter(
          (doc) => doc.data().status === "pending"
        ).length;

        // Mock recent updates data (in a real app, you'd fetch this from Firestore)
        const recentUpdates = [
          { district: "Muang Phitsanulok", date: "2024-03-05" },
          { district: "Chat Trakan", date: "2024-03-04" },
          { district: "Wang Thong", date: "2024-03-02" },
        ];

        setAnalyticsData({
          totalDistricts,
          totalProvinces,
          pendingRequests,
          recentUpdates,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [status]);

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-4 text-lg font-medium">Loading dashboard...</span>
      </div>
    );
  }

  // Authenticated content
  return (
    <div className="py-10">
      <header className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {session?.user?.name || "Administrator"}!
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card overflow-hidden rounded-lg shadow border border-accent/20">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">
                    Total Districts
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-foreground">
                    {analyticsData.totalDistricts}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card overflow-hidden rounded-lg shadow border border-accent/20">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">
                    Total Provinces
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-foreground">
                    {analyticsData.totalProvinces}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card overflow-hidden rounded-lg shadow border border-accent/20">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">
                    Pending Admin Requests
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-foreground">
                    {analyticsData.pendingRequests}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card overflow-hidden rounded-lg shadow border border-accent/20">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">
                    Total Visitors
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-foreground">
                    1,254
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card overflow-hidden rounded-lg shadow border border-accent/20 hover:shadow-md transition-shadow">
            <Link href="/admin/map-editor" className="block p-6">
              <h3 className="text-lg font-medium text-foreground">Map Editor</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Edit district maps, update colors, and manage visual elements
              </p>
            </Link>
          </div>

          <div className="bg-card overflow-hidden rounded-lg shadow border border-accent/20 hover:shadow-md transition-shadow">
            <Link href="/admin/content-editor" className="block p-6">
              <h3 className="text-lg font-medium text-foreground">Content Manager</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Update historical data, events, and landmarks for each district
              </p>
            </Link>
          </div>

          <div className="bg-card overflow-hidden rounded-lg shadow border border-accent/20 hover:shadow-md transition-shadow">
            <Link href="/admin/user-requests" className="block p-6">
              <h3 className="text-lg font-medium text-foreground">
                Manage Access Requests
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Review and approve contributor applications
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-foreground mb-4">Recent Updates</h2>
          <div className="bg-card overflow-hidden shadow rounded-lg border border-accent/20">
            <div className="px-4 py-5 sm:p-6">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {analyticsData.recentUpdates.map((update, index) => (
                    <li key={index} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {update.district}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            Updated on {update.date}
                          </p>
                        </div>
                        <div>
                          <Link
                            href={`/admin/districts/${update.district.toLowerCase().replace(/\s+/g, "-")}`}
                            className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-primary/20 text-sm leading-5 font-medium rounded-full text-primary/80 bg-primary/5 hover:bg-primary/10"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}