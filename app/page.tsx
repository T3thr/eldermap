"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import Map from "@/components/Map";
import PeriodSelector from "@/components/PeriodSelector";
import DistrictInfo from "@/components/DistrictInfo";
import { Province, District, HistoricalPeriod } from "@/lib/districts";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Maximize, Minimize, CheckCircle, Circle } from "lucide-react";

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

  // Load saved state from localStorage when component mounts
  useEffect(() => {
    const savedState = localStorage.getItem('thaiTemporalPortalState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // We'll apply these after data is fetched
        if (parsedState.provinceId) {
          setProvinceSearch(parsedState.provinceSearch || "");
          setIsGlobalView(parsedState.isGlobalView || false);
          setIsSidebarOpen(parsedState.isSidebarOpen || false);
        }
      } catch (error) {
        console.error("Error parsing saved state:", error);
      }
    }
  }, []);

  const fetchProvinces = useCallback(async () => {
    try {
      const provincesSnapshot = await getDocs(collection(db, "provinces"));
      const provincesData: Province[] = [];
      const periodsSet = new Set<string>();
      const periodsData: HistoricalPeriod[] = [];

      for (const provinceDoc of provincesSnapshot.docs) {
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
          name: provinceDoc.data().name,
          thaiName: provinceDoc.data().thaiName,
          districts: districtsData,
        });
      }

      setAllPeriods(periodsData);
      setProvinces(provincesData);
      
      // Apply saved state after data is fetched
      const savedState = localStorage.getItem('thaiTemporalPortalState');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          
          // Find the saved province
          if (parsedState.provinceId) {
            const savedProvince = provincesData.find(p => p.id === parsedState.provinceId);
            if (savedProvince) {
              setSelectedProvince(savedProvince);
              
              // Restore selected districts
              if (parsedState.selectedDistrictIds && Array.isArray(parsedState.selectedDistrictIds)) {
                const savedDistricts = savedProvince.districts.filter(
                  district => parsedState.selectedDistrictIds.includes(district.id)
                );
                setSelectedDistricts(savedDistricts);
              }
              
              // Restore selected period
              if (parsedState.selectedPeriodEra) {
                const savedPeriod = periodsData.find(p => p.era === parsedState.selectedPeriodEra);
                if (savedPeriod) {
                  setSelectedPeriod(savedPeriod);
                }
              }
            } else {
              setSelectedProvince(provincesData[0] || null);
            }
          } else {
            setSelectedProvince(provincesData[0] || null);
          }
        } catch (error) {
          console.error("Error applying saved state:", error);
          setSelectedProvince(provincesData[0] || null);
        }
      } else {
        setSelectedProvince(provincesData[0] || null);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
      setSelectedProvince(provinces[0] || null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    if (!isLoading && selectedProvince) {
      const stateToSave = {
        provinceId: selectedProvince?.id,
        provinceSearch: provinceSearch,
        selectedDistrictIds: selectedDistricts.map(d => d.id),
        selectedPeriodEra: selectedPeriod?.era,
        isGlobalView,
        isSidebarOpen,
      };
      localStorage.setItem('thaiTemporalPortalState', JSON.stringify(stateToSave));
    }
  }, [selectedProvince, selectedDistricts, selectedPeriod, isGlobalView, isSidebarOpen, provinceSearch, isLoading]);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMapFullScreen) setIsMapFullScreen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMapFullScreen]);

  useEffect(() => {
    if (isMapFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMapFullScreen]);

  const toggleDistrict = useCallback((district: District) => {
    setIsGlobalView(false);
    setSelectedDistricts((prev) =>
      prev.some((d) => d.id === district.id)
        ? prev.filter((d) => d.id !== district.id)
        : [...prev, district]
    );
    if (!selectedPeriod && district.historicalPeriods.length > 0) {
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

  const toggleFullScreen = useCallback(() => setIsMapFullScreen((prev) => !prev), []);

  const isDistrictSelected = useCallback((district: District) => {
    return selectedDistricts.some(d => d.id === district.id);
  }, [selectedDistricts]);

  const filteredProvinces = provinces.filter(
    (province) =>
      province.name.toLowerCase().includes(provinceSearch.toLowerCase()) ||
      province.thaiName.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-t-primary border-b-secondary rounded-full"
        />
        <span className="mt-6 text-xl font-thai text-primary animate-pulse">Initializing Temporal Matrix...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-thai font-extrabold bg-gradient-to-r from-primary via-accent to-indigo-400 text-transparent bg-clip-text">
            Thai Temporal Portal
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-foreground/70 mt-3 font-thai max-w-2xl mx-auto">
            Traverse Thailand's Chronological Nexus
          </p>
        </motion.header>

        <div className="lg:hidden flex justify-center mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50"
          >
            <span className="text-sm font-thai">{isSidebarOpen ? "Collapse" : "Expand"} Controls</span>
            {isSidebarOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <AnimatePresence>
            {(isSidebarOpen || typeof window !== "undefined" && window.innerWidth >= 1024) && (
              <motion.aside
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-4 xl:col-span-3 bg-card/80 backdrop-blur-2xl border border-glass-border rounded-2xl p-6 space-y-6 shadow-[0_0_20px_rgba(0,212,255,0.2)]"
              >
                <div className="space-y-4">
                  <h2 className="text-xl font-thai text-foreground/70">Province Selector</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Province..."
                      value={provinceSearch}
                      onChange={(e) => setProvinceSearch(e.target.value)}
                      className="w-full p-3 rounded-lg bg-card/50 text-foreground border border-glass-border focus:ring-2 focus:ring-primary focus:outline-none placeholder-foreground/50"
                    />
                    <div className="relative">
                      <select
                        className="w-full mt-2 p-3 rounded-lg bg-card/50 text-foreground border border-glass-border focus:ring-2 focus:ring-primary focus:outline-none appearance-none pr-10"
                        value={selectedProvince?.id || ""}
                        onChange={(e) => {
                          const province = provinces.find((p) => p.id === e.target.value);
                          setSelectedProvince(province || null);
                          setSelectedDistricts([]);
                          setSelectedPeriod(null);
                          setProvinceSearch("");
                        }}
                      >
                        {filteredProvinces.map((province) => (
                          <option key={province.id} value={province.id} className="bg-card text-foreground">
                            {province.name} ({province.thaiName})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-foreground" viewBox="0 0 16 16">
                          <path d="M8 12l-6-6h12z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-thai text-foreground/70">Temporal Slider</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleGlobalView}
                      className={`px-3 py-1 rounded-full text-sm border ${isGlobalView 
                        ? "bg-secondary text-foreground border-secondary" 
                        : "bg-card text-secondary hover:bg-secondary/20 border-secondary/50"}`}
                    >
                      {isGlobalView ? "District View" : "Global View"}
                    </motion.button>
                  </div>
                  <PeriodSelector
                    periods={isGlobalView ? allPeriods : (selectedDistricts[0]?.historicalPeriods || [])}
                    selectedPeriod={selectedPeriod}
                    onSelectPeriod={handlePeriodChange}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-thai text-foreground/70">District Selector</h2>
                    <div className="text-xs text-foreground/60">
                      {selectedDistricts.length} / {selectedProvince?.districts.length || 0} selected
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={selectAllDistricts}
                      className={`flex-1 p-2 rounded-lg border ${
                        selectedProvince && selectedDistricts.length === selectedProvince.districts.length
                          ? "bg-primary text-white border-primary"
                          : "bg-primary/20 text-primary hover:bg-primary/30 border-primary/50"
                      }`}
                    >
                      Select All
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearSelection}
                      className={`flex-1 p-2 rounded-lg border ${
                        selectedDistricts.length === 0
                          ? "bg-secondary text-white border-secondary"
                          : "bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/50"
                      }`}
                    >
                      Reset
                    </motion.button>
                  </div>
                  
                  {/* District list with improved UI */}
                  <div className="mt-3 max-h-48 overflow-y-auto pr-1 district-selector">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProvince?.districts.map((district) => (
                        <motion.button
                          key={district.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleDistrict(district)}
                          className={`p-2 rounded-lg text-left flex items-center gap-2 transition-colors ${
                            isDistrictSelected(district)
                              ? "bg-primary/20 border border-primary text-primary"
                              : "bg-card/50 border border-glass-border hover:bg-card/80 text-foreground/80"
                          }`}
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
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-8 xl:col-span-9 space-y-6"
          >
            <div className={`bg-card/80 backdrop-blur-2xl border border-glass-border rounded-2xl p-4 shadow-[0_0_20px_rgba(0,212,255,0.2)] ${isMapFullScreen ? "mt-16 fixed inset-0 z-50" : "relative"}`}>
              <div className="flex justify-between items-center mb-4">
                <motion.div animate={{ opacity: 1 }} className="px-4 py-1 bg-primary/30 text-foreground rounded-full border border-primary/50">
                  <span className="text-sm font-thai">{selectedProvince?.name} ({selectedProvince?.thaiName})</span>
                </motion.div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleFullScreen}
                    className="p-2 rounded-full bg-secondary/20 text-secondary hover:bg-secondary/30 border border-secondary/50"
                  >
                    {isMapFullScreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                  </motion.button>
                </div>
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
            </div>

            <AnimatePresence>
              {(selectedDistricts.length > 0 || isGlobalView) && selectedPeriod && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.5 }}
                  className="bg-card/80 backdrop-blur-2xl border border-glass-border rounded-2xl p-6 shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                >
                  <DistrictInfo
                    districts={selectedDistricts}
                    period={selectedPeriod}
                    isGlobalView={isGlobalView}
                    provinceName={selectedProvince?.name || ""}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  );
}