"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalProvinces: 0,
    totalAdmins: 0,
    totalDistricts: 0,
    provinces: [],
    admins: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data: DashboardData = await response.json();
        setDashboardData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchDashboardData();
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-card overflow-hidden rounded-lg shadow border border-accent/20">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">
                    Total Provinces
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-foreground">
                    {dashboardData.totalProvinces}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card overflow-hidden rounded-lg shadow border border-accent/20">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">
                    Total Districts
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-foreground">
                    {dashboardData.totalDistricts}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card overflow-hidden rounded-lg shadow border border-accent/20">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">
                    Administrator Accounts
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-foreground">
                    {dashboardData.totalAdmins}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Editor Link */}
        <div className="mt-8">
          <div className="bg-card overflow-hidden rounded-lg shadow border border-accent/20 hover:shadow-md transition-shadow">
            <Link href="/admin/map-editor" className="block p-6">
              <h3 className="text-lg font-medium text-foreground">Map Editor</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Edit district maps, update historical data, and manage visual
                elements for the interactive history platform
              </p>
            </Link>
          </div>
        </div>

        {/* Provinces List */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Province Data
          </h2>
          <div className="bg-card overflow-hidden shadow rounded-lg border border-accent/20">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-card">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                    >
                      Thai Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                    >
                      District Count
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-glass">
                  {dashboardData.provinces.map((province) => (
                    <tr key={province.id} className="hover:bg-card">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {province.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {province.thaiName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {province.districtCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/map-editor`}
                          className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-primary/20 text-sm leading-5 font-medium rounded-full text-primary/80 bg-primary/5 hover:bg-primary/10"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Admins List */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Administrator Accounts
          </h2>
          <div className="bg-card overflow-hidden shadow rounded-lg border border-accent/20">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-glass">
                <thead className="bg-card">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                    >
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-glass">
                  {dashboardData.admins.map((admin, index) => (
                    <tr key={index} className="hover:bg-card">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                        {admin.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {admin.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {admin.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}