"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import Map from "@/components/Map";
import PeriodSelector from "@/components/PeriodSelector";
import DistrictInfo from "@/components/DistrictInfo";
import { District, HistoricalPeriod } from "@/lib/districts";
import { Province} from "@/lib/provinces";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Maximize, Minimize, CheckCircle, Circle, Search } from "lucide-react";
import Loading from "./loading";

export default function Home() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<District[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<HistoricalPeriod | null>(null);
  const [allPeriods, setAllPeriods] = useState<HistoricalPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGlobalView, setIsGlobalView] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedState = localStorage.getItem("thaiTemporalPortalState");
    if (savedState) {
      try {
        const { provinceId, provinceSearch, isGlobalView, isSidebarOpen } = JSON.parse(savedState);
        setProvinceSearch(provinceSearch || "");
        setIsGlobalView(isGlobalView || false);
        setIsSidebarOpen(isSidebarOpen || false);
      } catch (error) {
        console.error("Error parsing saved state:", error);
      }
    }
  }, []);

  const fetchProvinces = useCallback(async () => {
    setIsLoading(true);
    try {
      const provincesSnapshot = await getDocs(collection(db, "provinces"));
      const provincesData: Province[] = [];
      const periodsSet = new Set<string>();
      const periodsData: HistoricalPeriod[] = [];

      for (const provinceDoc of provincesSnapshot.docs) {
        const provinceData = provinceDoc.data();
        const districtsSnapshot = await getDocs(collection(db, `provinces/${provinceDoc.id}/districts`));
        const districtsData: District[] = districtsSnapshot.docs.map((doc) => {
          const district = doc.data() as District;
          district.id = doc.id;
          district.historicalPeriods.forEach((period) => {
            if (!periodsSet.has(period.era)) {
              periodsSet.add(period.era);
              periodsData.push(period);
            }
          });
          return district;
        });

        provincesData.push({
          id: provinceDoc.id,
          name: provinceData.name,
          thaiName: provinceData.thaiName,
          totalArea: provinceData.totalArea || 0,
          districts: districtsData,
          historicalPeriods: provinceData.historicalPeriods || [],
          collabSymbol: provinceData.collabSymbol || undefined,
          tags: provinceData.tags || [],
          createdAt: provinceData.createdAt,
          createdBy: provinceData.createdBy || "",
          lock: provinceData.lock || false,
          version: provinceData.version || 1,
          backgroundSvgPath: provinceData.backgroundSvgPath || undefined,
          backgroundImageUrl: provinceData.backgroundImageUrl || undefined,
          backgroundDimensions: provinceData.backgroundDimensions || undefined,
        });
      }

      setProvinces(provincesData);
      setAllPeriods(periodsData);

      const savedState = localStorage.getItem("thaiTemporalPortalState");
      if (savedState) {
        const { provinceId, selectedDistrictIds, selectedPeriodEra } = JSON.parse(savedState);
        const province = provincesData.find((p) => p.id === provinceId) || provincesData[0] || null;
        setSelectedProvince(province);

        if (province && selectedDistrictIds?.length) {
          setSelectedDistricts(province.districts.filter((d) => selectedDistrictIds.includes(d.id)));
        }
        if (selectedPeriodEra) {
          setSelectedPeriod(periodsData.find((p) => p.era === selectedPeriodEra) || null);
        }
      } else {
        setSelectedProvince(provincesData[0] || null);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && selectedProvince) {
      localStorage.setItem(
        "thaiTemporalPortalState",
        JSON.stringify({
          provinceId: selectedProvince.id,
          provinceSearch,
          selectedDistrictIds: selectedDistricts.map((d) => d.id),
          selectedPeriodEra: selectedPeriod?.era,
          isGlobalView,
          isSidebarOpen,
        })
      );
    }
  }, [selectedProvince, selectedDistricts, selectedPeriod, isGlobalView, isSidebarOpen, provinceSearch, isLoading]);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsMapFullScreen(document.fullscreenElement === mapContainerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        window.innerWidth < 1024 &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const toggleDistrict = useCallback((district: District) => {
    setIsGlobalView(false);
    setSelectedDistricts((prev) =>
      prev.some((d) => d.id === district.id)
        ? prev.filter((d) => d.id !== district.id)
        : [...prev, district]
    );
    if (!selectedPeriod && district.historicalPeriods.length) {
      setSelectedPeriod(district.historicalPeriods[0]);
    }
  }, [selectedPeriod]);

  const selectAllDistricts = useCallback(() => {
    if (selectedProvince) setSelectedDistricts(selectedProvince.districts);
  }, [selectedProvince]);

  const clearSelection = useCallback(() => setSelectedDistricts([]), []);

  const handlePeriodChange = useCallback((period: HistoricalPeriod) => setSelectedPeriod(period), []);

  const toggleGlobalView = useCallback(() => {
    setIsGlobalView((prev) => !prev);
    setSelectedDistricts([]);
  }, []);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  const toggleFullScreen = useCallback(() => {
    if (!mapContainerRef.current) return;

    if (!isMapFullScreen) {
      mapContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Error attempting to exit fullscreen:", err);
      });
    }
  }, [isMapFullScreen]);

  const isDistrictSelected = useCallback(
    (district: District) => selectedDistricts.some((d) => d.id === district.id),
    [selectedDistricts]
  );

  const filteredProvinces = provinces.filter(
    (p) =>
      p.name.toLowerCase().includes(provinceSearch.toLowerCase()) ||
      p.thaiName.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen text-foreground flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-6 px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-center font-thai font-extrabold bg-gradient-to-l from-primary via-accent to-indigo-400 text-transparent bg-clip-text">
          Thai Temporal Portal
        </h1>
        <p className="text-sm sm:text-base text-foreground/70 mt-2 text-center">
          Explore Thailand&apos;s Historical Journey
        </p>
      </motion.header>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden px-4 sm:px-6 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary/10 text-primary border border-primary/30"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <span className="text-sm font-thai">{isSidebarOpen ? "Close" : "Controls"}</span>
          {isSidebarOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row px-4 sm:px-6 lg:px-8 pb-6 gap-6">
        {/* Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              ref={sidebarRef}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="lg:w-80 xl:w-96 flex-shrink-0 bg-card border border-glass-border rounded-xl p-4 space-y-6 shadow-lg"
              aria-label="Control Panel"
            >
              {/* Province Selector */}
              <section className="space-y-3">
                <h2 className="text-lg font-thai text-foreground/80">Province</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search Province..."
                    value={provinceSearch}
                    onChange={(e) => setProvinceSearch(e.target.value)}
                    className="w-full p-2 pl-10 pr-10 rounded-lg bg-card text-foreground border border-glass-border focus:ring-2 focus:ring-primary focus:outline-none placeholder-foreground/50"
                    aria-label="Search provinces"
                  />
                  {provinceSearch && (
                    <button
                      type="button"
                      onClick={() => setProvinceSearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground focus:outline-none"
                      aria-label="Clear search"
                    >
                      <span className="text-xl">×</span>
                    </button>
                  )}
                </div>
                <select
                  className="w-full mt-2 p-2 rounded-lg bg-card border border-glass-border focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                  value={selectedProvince?.id || ""}
                  onChange={(e) => {
                    const province = provinces.find((p) => p.id === e.target.value);
                    setSelectedProvince(province || null);
                    setSelectedDistricts([]);
                    setSelectedPeriod(null);
                    setProvinceSearch("");
                  }}
                  aria-label="Select province"
                >
                  {filteredProvinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name} ({province.thaiName})
                    </option>
                  ))}
                </select>
              </section>
              {/* Period Selector */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-thai text-foreground/80">Time Period</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleGlobalView}
                    className={`px-3 py-1 rounded-lg text-sm border ${
                      isGlobalView
                        ? "bg-secondary text-white border-secondary"
                        : "bg-card text-secondary border-secondary/50 hover:bg-secondary/10"
                    }`}
                    aria-label={isGlobalView ? "Switch to District View" : "Switch to Global View"}
                  >
                    {isGlobalView ? "District" : "Global"}
                  </motion.button>
                </div>
                <PeriodSelector
                  periods={isGlobalView ? allPeriods : selectedDistricts[0]?.historicalPeriods || []}
                  selectedPeriod={selectedPeriod}
                  onSelectPeriod={handlePeriodChange}
                />
              </section>

              {/* District Selector */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-thai text-foreground/80">Districts</h2>
                  <span className="text-xs text-foreground/60">
                    {selectedDistricts.length} / {selectedProvince?.districts.length || 0}
                  </span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={selectAllDistricts}
                    className="flex-1 py-2 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                    aria-label="Select all districts"
                  >
                    Select All
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearSelection}
                    className="flex-1 py-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20"
                    aria-label="Clear district selection"
                  >
                    Clear
                  </motion.button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedProvince?.districts.map((district) => (
                    <motion.button
                      key={district.id}
                      whileHover={{ scale: 1.00 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleDistrict(district)}
                      className={`w-full p-2 rounded-lg flex items-center gap-2 text-left border ${
                        isDistrictSelected(district)
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-card border-glass-border text-foreground/80 hover:bg-card/70"
                      }`}
                      aria-label={`Toggle ${district.name} district`}
                    >
                      {isDistrictSelected(district) ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="truncate text-sm">{district.name}</span>
                    </motion.button>
                  ))}
                </div>
              </section>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col space-y-6">
          {/* Map Section */}
          <motion.section
            ref={mapContainerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-card bg-opacity-10 border border-glass-border rounded-xl p-4 relative"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="px-3 py-1 bg-primary/10 text-foreground rounded-lg border border-primary/30">
                {selectedProvince?.name} ({selectedProvince?.thaiName})
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullScreen}
                className="p-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20"
                aria-label={isMapFullScreen ? "Exit full screen" : "Enter full screen"}
              >
                {isMapFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </motion.button>
            </div>
            {selectedProvince && (
              <Map
                districts={selectedProvince.districts}
                selectedDistricts={selectedDistricts}
                onDistrictToggle={toggleDistrict}
                selectedPeriod={selectedPeriod}
                isGlobalView={isGlobalView}
              />
            )}
          </motion.section>

          {/* District Info */}
          <AnimatePresence>
            {(selectedDistricts.length > 0 || isGlobalView) && selectedPeriod && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-glass-border rounded-xl p-4"
              >
                <DistrictInfo
                  districts={selectedDistricts}
                  period={selectedPeriod}
                  isGlobalView={isGlobalView}
                  provinceName={selectedProvince?.name || ""}
                />
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}