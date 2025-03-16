// app/admin/map-editor/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, MapPin, Grid, Save, Plus, Trash2, Upload, Edit, X, Undo2, Redo2, Lock, Unlock, Search, Loader2, Users, Palette, Clock, Book, Globe, Send } from "lucide-react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import debounce from "lodash/debounce";
import { District, HistoricalPeriod, Media, CollabData } from "@/lib/districts";
import { Province } from "@/lib/provinces";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Interfaces
interface ProvinceData {
  id: string;
  name: string;
  thaiName: string;
  totalArea: number;
  districts: DistrictData[];
  createdAt: Timestamp;
  createdBy: { id: string; name: string }[];
  lock: boolean;
  version: number;
  editor?: { id: string; name: string; role: "editor" | "viewer" }[];
  historicalPeriods?: HistoricalPeriod[];
  tags?: string[];
}

interface DistrictData {
  id: string;
  name: string;
  thaiName: string;
  historicalColor: string;
  coordinates: { x: number; y: number; width: number; height: number };
  historicalPeriods: HistoricalPeriod[];
  createdAt: Timestamp;
  createdBy: { id: string; name: string }[];
  lock: boolean;
  version: number;
  mapImageUrl?: string;
  culturalSignificance?: string;
  visitorTips?: string;
  editor?: { id: string; name: string; role: "editor" | "viewer" }[];
  collab?: CollabData;
}

interface EditAction {
  type: "updateDistrict" | "updateProvince" | "addProvince" | "addDistrict" | "uploadMedia" | "uploadMap" | "deleteDistrict" | "deleteProvince" | "updatePeriod" | "addPeriod" | "deletePeriod";
  data: any;
  previousData: any;
  timestamp: number;
  id: string;
}

interface FileUpload {
  file: File | null;
  previewUrl: string | null;
  type: "image" | "video" | "map";
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface CollaborationInvite {
  email: string;
  role: "editor" | "viewer";
}

interface CollaborationRequest {
  id: string;
  provinceId: string;
  districtId?: string;
  requesterId: string;
  requesterName: string;
  status: "pending" | "accepted" | "rejected";
  requestedAt: Timestamp;
}

// Constants
const MAX_HISTORY_SIZE = 50;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

// Custom Hook for Map State
const useMapState = () => {
  const [mapScale, setMapScale] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDraggingDistrict, setIsDraggingDistrict] = useState<string | null>(null);
  const debouncedSetMapPosition = useMemo(() => debounce((pos: { x: number; y: number }) => setMapPosition(pos), 16), []);

  return {
    mapScale,
    setMapScale,
    mapPosition,
    setMapPosition,
    isDraggingMap,
    setIsDraggingMap,
    dragStart,
    setDragStart,
    isDraggingDistrict,
    setIsDraggingDistrict,
    debouncedSetMapPosition,
  };
};

// Map Component
const MapComponent: React.FC<{
  selectedProvince: ProvinceData | null;
  selectedDistrict: DistrictData | null;
  setSelectedDistrict: (district: DistrictData | null) => void;
  updateDistrictCoordinates: (district: DistrictData, coords: DistrictData["coordinates"]) => void;
  canEdit: (item: DistrictData | null) => boolean;
  mapState: ReturnType<typeof useMapState>;
}> = ({ selectedProvince, selectedDistrict, setSelectedDistrict, updateDistrictCoordinates, canEdit, mapState }) => {
  const { mapScale, mapPosition, isDraggingMap, setIsDraggingMap, dragStart, setDragStart, isDraggingDistrict, setIsDraggingDistrict, debouncedSetMapPosition } = mapState;
  const [showGrid, setShowGrid] = useState(true);
  const [showCenter, setShowCenter] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !isDraggingDistrict) {
      setIsDraggingMap(true);
      setDragStart({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y });
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingMap) {
        debouncedSetMapPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
      if (isDraggingDistrict && selectedProvince && canEdit(selectedDistrict)) {
        const district = selectedProvince.districts.find((d) => d.id === isDraggingDistrict);
        if (district) {
          const newX = (e.clientX - dragStart.x) / mapScale + district.coordinates.x;
          const newY = (e.clientY - dragStart.y) / mapScale + district.coordinates.y;
          updateDistrictCoordinates(district, { ...district.coordinates, x: newX, y: newY });
        }
      }
    },
    [isDraggingMap, isDraggingDistrict, dragStart, mapScale, selectedProvince, selectedDistrict, debouncedSetMapPosition, updateDistrictCoordinates, canEdit]
  );

  const handleMouseUp = () => {
    setIsDraggingMap(false);
    setIsDraggingDistrict(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scaleFactor = 0.15;
    mapState.setMapScale((prev) => Math.max(0.5, Math.min(3.5, prev + (e.deltaY < 0 ? scaleFactor : -scaleFactor))));
  };

  const handleDistrictMouseDown = (e: React.MouseEvent, districtId: string) => {
    e.stopPropagation();
    setIsDraggingDistrict(districtId);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  return (
    <motion.div className="w-full bg-card rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] w-full">
        <div className="absolute top-4 right-4 z-20 bg-glass-bg rounded-full p-2 flex flex-col gap-2 shadow-[0_0_10px_rgba(0,212,255,0.3)]">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => mapState.setMapScale((prev) => Math.min(prev + 0.25, 3.5))} className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50" aria-label="Zoom in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { mapState.setMapScale(1); mapState.setMapPosition({ x: 0, y: 0 }); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/50" aria-label="Reset map">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => mapState.setMapScale((prev) => Math.max(prev - 0.25, 0.5))} className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50" aria-label="Zoom out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowGrid((prev) => !prev)} className={`w-8 h-8 flex items-center justify-center rounded-full ${showGrid ? "bg-primary/30 text-primary" : "bg-card text-foreground/70"} hover:bg-primary/40 border border-primary/50`} aria-label={showGrid ? "Hide grid" : "Show grid"}>
            <Grid className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowCenter((prev) => !prev)} className={`w-8 h-8 flex items-center justify-center rounded-full ${showCenter ? "bg-secondary/30 text-secondary" : "bg-card text-foreground/70"} hover:bg-secondary/40 border border-secondary/50`} aria-label={showCenter ? "Hide center marker" : "Show center marker"}>
            <MapPin className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowLabels((prev) => !prev)} className={`w-8 h-8 flex items-center justify-center rounded-full ${showLabels ? "bg-accent/30 text-accent" : "bg-card text-foreground/70"} hover:bg-accent/40 border border-accent/50`} aria-label={showLabels ? "Hide labels" : "Show labels"}>
            <Book className="w-4 h-4" />
          </motion.button>
        </div>
        <div
          className="w-full h-full cursor-grab touch-pan-x touch-pan-y"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDraggingMap ? "grabbing" : "grab" }}
          role="region"
          aria-label="Interactive map"
        >
          <motion.div animate={{ x: mapPosition.x, y: mapPosition.y, scale: mapScale }} transition={{ duration: 0.15 }} className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 600 400" className="w-full h-auto">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--foreground)" strokeOpacity="0.15" />
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {showGrid && <rect width="600" height="400" fill="url(#grid)" opacity="0.4" />}
              {showCenter && <circle cx="300" cy="200" r="5" fill="var(--secondary)" stroke="var(--foreground)" strokeWidth="2" filter="url(#glow)" />}
              <g>
                {selectedProvince?.districts.map((district) => (
                  <motion.g
                    key={district.id}
                    whileHover={{ scale: canEdit(district) ? 1.08 : 1 }}
                    whileTap={{ scale: canEdit(district) ? 0.95 : 1 }}
                    onClick={() => setSelectedDistrict(district)}
                    onMouseDown={(e) => canEdit(district) && handleDistrictMouseDown(e, district.id)}
                    role="button"
                    aria-label={`Select ${district.name}`}
                  >
                    {district.mapImageUrl ? (
                      <image
                        x={district.coordinates.x}
                        y={district.coordinates.y}
                        width={district.coordinates.width}
                        height={district.coordinates.height}
                        href={district.mapImageUrl}
                        className="transition-all duration-300"
                        style={{
                          filter: selectedDistrict?.id === district.id ? "url(#glow)" : "",
                          cursor: isDraggingDistrict === district.id ? "grabbing" : "pointer",
                        }}
                      />
                    ) : (
                      <rect
                        x={district.coordinates.x}
                        y={district.coordinates.y}
                        width={district.coordinates.width}
                        height={district.coordinates.height}
                        fill={district.historicalColor}
                        stroke="var(--foreground)"
                        strokeWidth={selectedDistrict?.id === district.id ? 3 : 1.5}
                        strokeOpacity={selectedDistrict?.id === district.id ? 0.9 : 0.4}
                        className="transition-all duration-300"
                        style={{
                          filter: selectedDistrict?.id === district.id ? "url(#glow)" : "",
                          cursor: isDraggingDistrict === district.id ? "grabbing" : "pointer",
                        }}
                      />
                    )}
                    {showLabels && (
                      <text
                        x={district.coordinates.x + district.coordinates.width / 2}
                        y={district.coordinates.y + district.coordinates.height / 2}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fill={isColorDark(district.historicalColor) ? "#fff" : "#333"}
                        fontSize="14"
                        fontWeight={selectedDistrict?.id === district.id ? "bold" : "normal"}
                        className="font-thai select-none"
                        opacity={selectedDistrict?.id === district.id ? 1 : 0.8}
                      >
                        {district.thaiName}
                      </text>
                    )}
                  </motion.g>
                ))}
              </g>
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// ProvinceSelector Component
const ProvinceSelector: React.FC<{
  provinces: ProvinceData[];
  filteredProvinces: ProvinceData[];
  selectedProvince: ProvinceData | null;
  setSelectedProvince: (province: ProvinceData | null) => void;
  setSelectedDistrict: (district: DistrictData | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toggleLock: (item: ProvinceData, type: "province") => void;
  deleteProvince: (province: ProvinceData) => void;
  updateProvinceName: (province: ProvinceData, name: string, thaiName: string) => void;
  canEdit: (item: ProvinceData | null) => boolean;
  loading: boolean;
  setIsAddProvinceModalOpen: (open: boolean) => void;
  setIsCollaborationModalOpen: (open: boolean) => void;
  requestEditorAccess: (province: ProvinceData) => void;
}> = ({
  provinces,
  filteredProvinces,
  selectedProvince,
  setSelectedProvince,
  setSelectedDistrict,
  searchQuery,
  setSearchQuery,
  toggleLock,
  deleteProvince,
  updateProvinceName,
  canEdit,
  loading,
  setIsAddProvinceModalOpen,
  setIsCollaborationModalOpen,
  requestEditorAccess,
}) => {
  // All hooks must be called unconditionally at the top
  const [editingProvinceName, setEditingProvinceName] = useState<string | null>(null);
  const { data: session } = useSession(); // Explicitly use useSession here if needed

  // Ensure no hooks are called after this point conditionally
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Provinces</h2>
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCollaborationModalOpen(true)}
            className="px-3 py-1 sm:px-4 sm:py-2 bg-accent text-background rounded-lg shadow-lg flex items-center gap-2"
            aria-label="Manage collaboration"
          >
            <Users className="w-4 h-4" /> Collaborate
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddProvinceModalOpen(true)}
            className="px-3 py-1 sm:px-4 sm:py-2 bg-primary text-background rounded-lg shadow-lg flex items-center gap-2"
            aria-label="Add new province"
          >
            <Plus className="w-4 h-4" /> Add
          </motion.button>
        </div>
      </div>
      <div className="flex items-center bg-card border border-primary rounded-lg focus-within:ring-2 focus-within:ring-primary mb-4">
        <Search className="w-4 h-4 text-foreground/70 ml-3" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search provinces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 bg-card text-foreground border-0 rounded-lg focus:ring-0 focus:outline-none"
          aria-label="Search provinces"
        />
      </div>
      <div className="max-h-60 overflow-y-auto bg-card rounded-lg shadow-inner">
        {loading ? (
          <div className="p-4 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredProvinces.length === 0 ? (
          <p className="p-4 text-foreground/70">No provinces found.</p>
        ) : (
          filteredProvinces.map((province) => (
            <div key={province.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 hover:bg-background rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
                {editingProvinceName === province.id ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <input
                      type="text"
                      value={province.name}
                      onChange={(e) => {
                        const updatedProvince = { ...province, name: e.target.value };
                        setSelectedProvince(updatedProvince);
                      }}
                      className="p-2 bg-card text-foreground border border-primary rounded-lg flex-1"
                      disabled={!canEdit(province)}
                      aria-label={`Edit name of ${province.name}`}
                    />
                    <input
                      type="text"
                      value={province.thaiName}
                      onChange={(e) => {
                        const updatedProvince = { ...province, thaiName: e.target.value };
                        setSelectedProvince(updatedProvince);
                      }}
                      className="p-2 bg-card text-foreground border border-primary rounded-lg flex-1"
                      disabled={!canEdit(province)}
                      aria-label={`Edit Thai name of ${province.name}`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        updateProvinceName(province, province.name, province.thaiName);
                        setEditingProvinceName(null);
                      }}
                      className="px-2 py-1 bg-success text-background rounded-lg shadow-lg"
                      disabled={!canEdit(province)}
                      aria-label="Save province name changes"
                    >
                      Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingProvinceName(null)}
                      className="px-2 py-1 bg-destructive text-background rounded-lg shadow-lg"
                      aria-label="Cancel editing province name"
                    >
                      Cancel
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedProvince(province);
                      setSelectedDistrict(province.districts[0] || null);
                    }}
                    className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg ${
                      selectedProvince?.id === province.id ? "bg-primary text-background" : "bg-secondary text-foreground"
                    }`}
                    aria-label={`Select ${province.name}`}
                  >
                    {province.thaiName} ({province.name})
                  </motion.button>
                )}
                {canEdit(province) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingProvinceName(province.id)}
                    className="px-2 py-1 bg-accent text-background rounded-lg shadow-lg"
                    aria-label={`Edit ${province.name}`}
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                {canEdit(province) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleLock(province, "province")}
                    className="px-2 py-1 bg-accent text-foreground rounded-lg shadow-lg"
                    aria-label={province.lock ? `Unlock ${province.name}` : `Lock ${province.name}`}
                  >
                    {province.lock ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </motion.button>
                )}
                {(province.createdBy.some((c) => c.id === "1") || province.createdBy.some((c) => c.id === session?.user?.id)) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteProvince(province)}
                    className="px-2 py-1 bg-destructive text-background rounded-lg shadow-lg"
                    aria-label={`Delete ${province.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
                {!canEdit(province) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => requestEditorAccess(province)}
                    className="px-2 py-1 bg-secondary text-foreground rounded-lg shadow-lg flex items-center gap-2"
                    aria-label={`Request editor access for ${province.name}`}
                  >
                    <Send className="w-4 h-4" /> Request
                  </motion.button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

// District Editor Component
const DistrictEditor: React.FC<{
  selectedProvince: ProvinceData | null;
  selectedDistrict: DistrictData | null;
  updateDistrictCoordinates: (district: DistrictData, coords: DistrictData["coordinates"]) => void;
  updateDistrictColor: (district: DistrictData, color: string) => void;
  uploadMapImage: () => void;
  canEdit: (item: DistrictData | null) => boolean;
  toggleLock: (item: DistrictData, type: "district") => void;
  mapFile: FileUpload;
  setMapFile: (file: FileUpload) => void;
  mapImageUrlInput: string;
  setMapImageUrlInput: (url: string) => void;
  isUploading: boolean;
}> = ({
  selectedProvince,
  selectedDistrict,
  updateDistrictCoordinates,
  updateDistrictColor,
  uploadMapImage,
  canEdit,
  toggleLock,
  mapFile,
  setMapFile,
  mapImageUrlInput,
  setMapImageUrlInput,
  isUploading,
}) => {
  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) return false;
    return ALLOWED_IMAGE_TYPES.includes(file.type);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Map Editor</h2>
        {selectedDistrict && canEdit(selectedDistrict) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleLock(selectedDistrict, "district")}
            className="px-2 py-1 bg-accent text-foreground rounded-lg shadow-lg"
            aria-label={selectedDistrict.lock ? `Unlock ${selectedDistrict.name}` : `Lock ${selectedDistrict.name}`}
          >
            {selectedDistrict.lock ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </motion.button>
        )}
      </div>
      {selectedDistrict ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">X Position</label>
              <input
                type="number"
                value={selectedDistrict.coordinates.x}
                onChange={(e) => updateDistrictCoordinates(selectedDistrict, { ...selectedDistrict.coordinates, x: Number(e.target.value) })}
                className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                disabled={!canEdit(selectedDistrict)}
                aria-label="X position"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Y Position</label>
              <input
                type="number"
                value={selectedDistrict.coordinates.y}
                onChange={(e) => updateDistrictCoordinates(selectedDistrict, { ...selectedDistrict.coordinates, y: Number(e.target.value) })}
                className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                disabled={!canEdit(selectedDistrict)}
                aria-label="Y position"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Width</label>
              <input
                type="number"
                value={selectedDistrict.coordinates.width}
                onChange={(e) => updateDistrictCoordinates(selectedDistrict, { ...selectedDistrict.coordinates, width: Number(e.target.value) })}
                className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                disabled={!canEdit(selectedDistrict)}
                aria-label="Width"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Height</label>
              <input
                type="number"
                value={selectedDistrict.coordinates.height}
                onChange={(e) => updateDistrictCoordinates(selectedDistrict, { ...selectedDistrict.coordinates, height: Number(e.target.value) })}
                className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                disabled={!canEdit(selectedDistrict)}
                aria-label="Height"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-foreground">Historical Color</label>
              <input
                type="color"
                value={rgbaToHex(selectedDistrict.historicalColor)}
                onChange={(e) => updateDistrictColor(selectedDistrict, hexToRgba(e.target.value, 0.5))}
                className="w-full h-10 p-1 bg-card text-foreground border border-primary rounded-lg"
                disabled={!canEdit(selectedDistrict)}
                aria-label="Historical color"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium mb-2 text-foreground">Upload Map Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && validateFile(file)) setMapFile({ file, previewUrl: URL.createObjectURL(file), type: "map" });
                }}
                className="w-full p-2 bg-card text-foreground border border-primary rounded-lg mb-2"
                disabled={!canEdit(selectedDistrict)}
                aria-label="Upload map image"
              />
              {mapFile.previewUrl && (
                <div className="mt-2">
                  <img src={mapFile.previewUrl} alt="Map Preview" className="w-full h-32 object-cover rounded-lg" />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={uploadMapImage}
                    className="mt-2 w-full px-4 py-2 bg-primary text-background rounded-lg shadow-lg flex items-center justify-center gap-2"
                    disabled={isUploading}
                    aria-label="Upload map image"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isUploading ? "Uploading..." : "Upload"}
                  </motion.button>
                </div>
              )}
              {selectedDistrict.mapImageUrl && !mapFile.previewUrl && <img src={selectedDistrict.mapImageUrl} alt="District Map" className="mt-2 w-full h-32 object-cover rounded-lg" />}
              <label className="block text-sm font-medium mt-4 text-foreground">Or Enter Map Image URL</label>
              <input
                type="text"
                value={mapImageUrlInput}
                onChange={(e) => setMapImageUrlInput(e.target.value)}
                placeholder="https://example.com/map.png"
                className="w-full p-2 bg-card text-foreground border border-primary rounded-lg mt-2"
                disabled={!canEdit(selectedDistrict)}
                aria-label="Map image URL"
              />
              {mapImageUrlInput && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={uploadMapImage}
                  className="mt-2 w-full px-4 py-2 bg-success text-background rounded-lg shadow-lg flex items-center justify-center gap-2"
                  disabled={isUploading}
                  aria-label="Add map URL"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isUploading ? "Adding..." : "Add URL"}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-foreground/70">Select a district to edit its map properties.</p>
      )}
    </motion.div>
  );
};

// DataEditor Component
const DataEditor: React.FC<{
  selectedProvince: ProvinceData | null;
  selectedDistrict: DistrictData | null;
  setSelectedDistrict: (district: DistrictData | null) => void;
  setSelectedProvince: (province: ProvinceData | null) => void;
  updateDistrictData: (district: DistrictData, data: Partial<DistrictData>) => void;
  deleteDistrict: (district: DistrictData) => void;
  canEdit: (item: ProvinceData | DistrictData | null) => boolean;
  setIsAddDistrictModalOpen: (open: boolean) => void;
  editMode: "province" | "district";
  setEditMode: (mode: "province" | "district") => void;
  setIsDeleteConfirmOpen: (open: boolean) => void;
  setDeleteItem: (item: DistrictData | ProvinceData | null) => void;
  requestEditorAccess: (district: DistrictData) => void;
}> = ({
  selectedProvince,
  selectedDistrict,
  setSelectedDistrict,
  setSelectedProvince,
  updateDistrictData,
  deleteDistrict,
  canEdit,
  setIsAddDistrictModalOpen,
  editMode,
  setEditMode,
  setIsDeleteConfirmOpen,
  setDeleteItem,
  requestEditorAccess,
}) => {
  // All hooks must be called unconditionally at the top
  const { data: session } = useSession(); // Explicitly call useSession here

  // No additional hooks should be added conditionally below this point
  const handleDeleteClick = (district: DistrictData) => {
    setDeleteItem(district);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Data Editor</h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditMode("province")}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg ${editMode === "province" ? "bg-primary text-background" : "bg-secondary text-foreground"}`}
            aria-label="Edit province data"
          >
            Province
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditMode("district")}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg ${editMode === "district" ? "bg-primary text-background" : "bg-secondary text-foreground"}`}
            aria-label="Edit district data"
          >
            District
          </motion.button>
        </div>
      </div>
      {editMode === "district" && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedProvince?.districts.map((district) => (
              <div key={district.id} className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDistrict(district)}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg ${selectedDistrict?.id === district.id ? "bg-primary text-background" : "bg-secondary text-foreground"}`}
                  aria-label={`Select ${district.name}`}
                >
                  {district.thaiName}
                </motion.button>
                {(district.createdBy.some((c) => c.id === "1") || district.createdBy.some((c) => c.id === session?.user?.id)) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteClick(district)}
                    className="px-2 py-1 bg-destructive text-background rounded-lg shadow-lg"
                    aria-label={`Delete ${district.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
                {!canEdit(district) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => requestEditorAccess(district)}
                    className="px-2 py-1 bg-secondary text-foreground rounded-lg shadow-lg flex items-center gap-2"
                    aria-label={`Request editor access for ${district.name}`}
                  >
                    <Send className="w-4 h-4" /> Request
                  </motion.button>
                )}
              </div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddDistrictModalOpen(true)}
            className="w-full px-4 py-2 bg-success text-background rounded-lg shadow-lg flex items-center justify-center gap-2 mb-4"
            disabled={!canEdit(selectedProvince)}
            aria-label="Add new district"
          >
            <Plus className="w-4 h-4" /> Add District
          </motion.button>
          {selectedDistrict && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  value={selectedDistrict.name}
                  onChange={(e) => updateDistrictData(selectedDistrict, { name: e.target.value })}
                  className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                  disabled={!canEdit(selectedDistrict)}
                  aria-label="District name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Thai Name</label>
                <input
                  type="text"
                  value={selectedDistrict.thaiName}
                  onChange={(e) => updateDistrictData(selectedDistrict, { thaiName: e.target.value })}
                  className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                  disabled={!canEdit(selectedDistrict)}
                  aria-label="Thai name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Cultural Significance</label>
                <textarea
                  value={selectedDistrict.culturalSignificance || ""}
                  onChange={(e) => updateDistrictData(selectedDistrict, { culturalSignificance: e.target.value })}
                  className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                  disabled={!canEdit(selectedDistrict)}
                  aria-label="Cultural significance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Visitor Tips</label>
                <textarea
                  value={selectedDistrict.visitorTips || ""}
                  onChange={(e) => updateDistrictData(selectedDistrict, { visitorTips: e.target.value })}
                  className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                  disabled={!canEdit(selectedDistrict)}
                  aria-label="Visitor tips"
                />
              </div>
              <div className="flex flex-col justify-center items-center mt-4">
                <label className="block text-sm font-medium text-foreground">Created By</label>
                <input
                  type="text"
                  value={selectedDistrict.createdBy.map((creator) => creator.name).join(", ")}
                  disabled
                  className="w-fit p-2 mt-2 text-center text-foreground border border-primary rounded-full"
                  aria-label="Created by"
                />
              </div>
            </div>
          )}
        </>
      )}
      {editMode === "province" && selectedProvince && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              value={selectedProvince.name}
              onChange={(e) => setSelectedProvince({ ...selectedProvince, name: e.target.value })}
              className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
              disabled={!canEdit(selectedProvince)}
              aria-label="Province name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Thai Name</label>
            <input
              type="text"
              value={selectedProvince.thaiName}
              onChange={(e) => setSelectedProvince({ ...selectedProvince, thaiName: e.target.value })}
              className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
              disabled={!canEdit(selectedProvince)}
              aria-label="Thai name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Total Area (sq km)</label>
            <input
              type="number"
              value={selectedProvince.totalArea}
              onChange={(e) => setSelectedProvince({ ...selectedProvince, totalArea: Number(e.target.value) })}
              className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
              disabled={!canEdit(selectedProvince)}
              aria-label="Total area"
            />
          </div>
          <div className="flex flex-col justify-center items-center mt-4">
            <label className="block text-sm font-medium text-foreground">Created By</label>
            <input
              type="text"
              value={selectedProvince.createdBy.map((creator) => creator.name).join(", ")}
              disabled
              className="w-fit p-2 mt-2 text-center text-foreground border border-primary rounded-full"
              aria-label="Created by"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Media Editor Component
const MediaEditor: React.FC<{
  selectedDistrict: DistrictData | null;
  updateDistrictData: (district: DistrictData, data: Partial<DistrictData>) => void;
  uploadMedia: (district: DistrictData, periodIndex: number) => void;
  canEdit: (item: DistrictData | null) => boolean;
  mediaFile: FileUpload;
  setMediaFile: (file: FileUpload) => void;
  mediaImageUrlInput: string;
  setMediaImageUrlInput: (url: string) => void;
  isUploading: boolean;
}> = ({
  selectedDistrict,
  updateDistrictData,
  uploadMedia,
  canEdit,
  mediaFile,
  setMediaFile,
  mediaImageUrlInput,
  setMediaImageUrlInput,
  isUploading,
}) => {
  const [activeTab, setActiveTab] = useState<"image" | "video" | "text">("image");
  const validateFile = (file: File, type: "image" | "video"): boolean => {
    if (file.size > MAX_FILE_SIZE) return false;
    return type === "image" ? ALLOWED_IMAGE_TYPES.includes(file.type) : ALLOWED_VIDEO_TYPES.includes(file.type);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-4 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-foreground">Media Editor</h2>
      <div className="flex border-b border-primary mb-4">
        {["image", "video", "text"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 py-2 font-medium ${activeTab === tab ? "text-primary border-b-2 border-primary" : "text-foreground/70 hover:text-foreground"}`}
            aria-label={`Switch to ${tab} tab`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {selectedDistrict && (
        <div className="space-y-4">
          {selectedDistrict.historicalPeriods.map((period, index) => (
            <div key={period.era + index} className="p-4 bg-accent rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <input
                  type="text"
                  value={period.era}
                  onChange={(e) => {
                    const updatedPeriods = [...selectedDistrict.historicalPeriods];
                    updatedPeriods[index].era = e.target.value;
                    updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
                  }}
                  className="text-lg font-semibold bg-transparent border-b border-primary text-foreground focus:outline-none"
                  disabled={!canEdit(selectedDistrict)}
                  aria-label={`Edit era ${period.era}`}
                />
                {canEdit(selectedDistrict) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const updatedPeriods = selectedDistrict.historicalPeriods.filter((_, i) => i !== index);
                      updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
                    }}
                    className="px-2 py-1 bg-destructive text-background rounded-lg shadow-lg"
                    aria-label={`Delete era ${period.era}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">Start Year</label>
                  <input
                    type="number"
                    value={period.startYear}
                    onChange={(e) => {
                      const updatedPeriods = [...selectedDistrict.historicalPeriods];
                      updatedPeriods[index].startYear = Number(e.target.value);
                      updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
                    }}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                    disabled={!canEdit(selectedDistrict)}
                    aria-label={`Start year for ${period.era}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">End Year</label>
                  <input
                    type="number"
                    value={period.endYear}
                    onChange={(e) => {
                      const updatedPeriods = [...selectedDistrict.historicalPeriods];
                      updatedPeriods[index].endYear = Number(e.target.value);
                      updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
                    }}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                    disabled={!canEdit(selectedDistrict)}
                    aria-label={`End year for ${period.era}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Description</label>
                  <textarea
                    value={period.description || ""}
                    onChange={(e) => {
                      const updatedPeriods = [...selectedDistrict.historicalPeriods];
                      updatedPeriods[index].description = e.target.value;
                      updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
                    }}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                    disabled={!canEdit(selectedDistrict)}
                    aria-label={`Description for ${period.era}`}
                  />
                </div>
                {period.media
                  .filter((media) => (activeTab === "image" ? media.type === "image" : activeTab === "video" ? media.type === "video" : true))
                  .map((media, mediaIndex) => (
                    <div key={mediaIndex} className="flex items-center gap-2">
                      {media.type === "image" && <img src={media.url} alt={media.description || "Media preview"} className="w-16 h-16 object-cover rounded-lg" />}
                      {media.type === "video" && <video src={media.url} controls className="w-16 h-16 object-cover rounded-lg" />}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={media.altText}
                          onChange={(e) => {
                            const updatedPeriods = [...selectedDistrict.historicalPeriods];
                            updatedPeriods[index].media[mediaIndex].altText = e.target.value;
                            updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
                          }}
                          placeholder="Alt Text"
                          className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                          disabled={!canEdit(selectedDistrict)}
                          aria-label={`Alt text for media ${mediaIndex + 1}`}
                        />
                        <input
                          type="text"
                          value={media.description}
                          onChange={(e) => {
                            const updatedPeriods = [...selectedDistrict.historicalPeriods];
                            updatedPeriods[index].media[mediaIndex].description = e.target.value;
                            updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
                          }}
                          placeholder="Description"
                          className="w-full p-2 bg-card text-foreground border border-primary rounded-lg mt-2"
                          disabled={!canEdit(selectedDistrict)}
                          aria-label={`Description for media ${mediaIndex + 1}`}
                        />
                      </div>
                      {canEdit(selectedDistrict) && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const updatedPeriods = [...selectedDistrict.historicalPeriods];
                            updatedPeriods[index].media = updatedPeriods[index].media.filter((_, i) => i !== mediaIndex);
                            updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
                          }}
                          className="px-2 py-1 bg-destructive text-background rounded-lg shadow-lg"
                          aria-label={`Delete media ${mediaIndex + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  ))}
              </div>
              {canEdit(selectedDistrict) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-foreground">Upload {activeTab === "image" ? "Image" : "Video"}</label>
                  <input
                    type="file"
                    accept={activeTab === "image" ? "image/*" : "video/*"}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && validateFile(file, activeTab === "image" ? "image" : "video"))
                        setMediaFile({ file, previewUrl: URL.createObjectURL(file), type: activeTab === "image" ? "image" : "video" });
                    }}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg mb-2"
                    disabled={isUploading}
                    aria-label={`Upload ${activeTab}`}
                  />
                  {mediaFile.previewUrl && (
                    <div className="mt-2">
                      {activeTab === "image" ? (
                        <img src={mediaFile.previewUrl} alt="Media Preview" className="w-full h-32 object-cover rounded-lg" />
                      ) : (
                        <video src={mediaFile.previewUrl} controls className="w-full h-32 object-cover rounded-lg" />
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => uploadMedia(selectedDistrict, index)}
                        className="mt-2 w-full px-4 py-2 bg-primary text-background rounded-lg shadow-lg flex items-center justify-center gap-2"
                        disabled={isUploading}
                        aria-label={`Upload ${activeTab}`}
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isUploading ? "Uploading..." : "Upload"}
                      </motion.button>
                    </div>
                  )}
                  <label className="block text-sm font-medium mt-4 text-foreground">Or Enter {activeTab === "image" ? "Image" : "Video"} URL</label>
                  <input
                    type="text"
                    value={mediaImageUrlInput}
                    onChange={(e) => setMediaImageUrlInput(e.target.value)}
                    placeholder={`https://example.com/${activeTab}.${activeTab === "image" ? "png" : "mp4"}`}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg mt-2"
                    disabled={!canEdit(selectedDistrict) || isUploading}
                    aria-label={`${activeTab} URL`}
                  />
                  {mediaImageUrlInput && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => uploadMedia(selectedDistrict, index)}
                      className="mt-2 w-full px-4 py-2 bg-success text-background rounded-lg shadow-lg flex items-center justify-center gap-2"
                      disabled={isUploading}
                      aria-label={`Add ${activeTab} URL`}
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {isUploading ? "Adding..." : "Add URL"}
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          ))}
          {canEdit(selectedDistrict) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const updatedPeriods = [
                  ...selectedDistrict.historicalPeriods,
                  { era: "New Era", media: [], color: "rgba(255, 255, 255, 0.5)", startYear: 0, endYear: 0, yearRange: "Unknown", description: "", events: [], landmarks: [], sources: [] },
                ];
                updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
              }}
              className="mt-4 w-full px-4 py-2 bg-success text-background rounded-lg shadow-lg flex items-center justify-center gap-2"
              aria-label="Add new historical period"
            >
              <Plus className="w-4 h-4" /> Add Period
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Collaboration Modal Component
const CollaborationModal: React.FC<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedProvince: ProvinceData | null;
  canEdit: (item: ProvinceData | null) => boolean;
  inviteCollaborator: (province: ProvinceData, invite: CollaborationInvite) => void;
}> = ({ isOpen, setIsOpen, selectedProvince, canEdit, inviteCollaborator }) => {
  const [invite, setInvite] = useState<CollaborationInvite>({ email: "", role: "editor" });

  const handleInvite = () => {
    if (!selectedProvince || !invite.email) return;
    inviteCollaborator(selectedProvince, invite);
    setInvite({ email: "", role: "editor" });
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-label="Collaboration modal"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md relative"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-xl text-foreground hover:text-primary focus:outline-none"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Invite Collaborators</h3>
            {selectedProvince && canEdit(selectedProvince) ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    value={invite.email}
                    onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="collaborator@example.com"
                    aria-label="Collaborator email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Role</label>
                  <select
                    value={invite.role}
                    onChange={(e) => setInvite({ ...invite, role: e.target.value as "editor" | "viewer" })}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg focus:ring-2 focus:ring-primary"
                    aria-label="Collaborator role"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-destructive text-background rounded-lg shadow-lg"
                    aria-label="Cancel invitation"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleInvite}
                    className="px-4 py-2 bg-success text-background rounded-lg shadow-lg"
                    aria-label="Send invitation"
                  >
                    Invite
                  </motion.button>
                </div>
              </div>
            ) : (
              <p className="text-foreground/70">You do not have permission to invite collaborators.</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: DistrictData | ProvinceData | null;
  onConfirm: () => void;
}> = ({ isOpen, setIsOpen, item, onConfirm }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        role="dialog"
        aria-label="Delete confirmation modal"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md"
        >
          <h3 className="text-xl font-semibold mb-4 text-foreground">Confirm Deletion</h3>
          <p className="text-foreground/70 mb-6">Are you sure you want to delete {item?.name || "this item"}? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-secondary text-foreground rounded-lg shadow-lg"
              aria-label="Cancel deletion"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onConfirm();
                setIsOpen(false);
              }}
              className="px-4 py-2 bg-destructive text-background rounded-lg shadow-lg"
              aria-label="Confirm deletion"
            >
              Delete
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Main Component
export default function MapEditorPage() {
  const { data: session, status } = useSession();
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [filteredProvinces, setFilteredProvinces] = useState<ProvinceData[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProvince, setNewProvince] = useState({ name: "", thaiName: "", totalArea: 0 });
  const [newDistrict, setNewDistrict] = useState<Partial<DistrictData>>({
    name: "",
    thaiName: "",
    historicalColor: "rgba(255, 255, 255, 0.5)",
    coordinates: { x: 300, y: 200, width: 100, height: 100 },
    historicalPeriods: [],
    createdAt: Timestamp.now(),
    createdBy: [],
    lock: false,
    version: 1,
  });
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [history, setHistory] = useState<EditAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [mapFile, setMapFile] = useState<FileUpload>({ file: null, previewUrl: null, type: "map" });
  const [mediaFile, setMediaFile] = useState<FileUpload>({ file: null, previewUrl: null, type: "image" });
  const [mapImageUrlInput, setMapImageUrlInput] = useState("");
  const [mediaImageUrlInput, setMediaImageUrlInput] = useState("");
  const [isAddProvinceModalOpen, setIsAddProvinceModalOpen] = useState(false);
  const [isAddDistrictModalOpen, setIsAddDistrictModalOpen] = useState(false);
  const [isCollaborationModalOpen, setIsCollaborationModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<DistrictData | ProvinceData | null>(null);
  const [editMode, setEditMode] = useState<"province" | "district">("district");
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const actionIdRef = useRef(0);
  const mapState = useMapState();

  const adminId = session?.user?.id;
  const adminRole = session?.user?.role;

  useEffect(() => {
    const fetchProvinces = async () => {
      if (status === "loading" || !session?.user) return;
      setLoading(true);
      try {
        const provincesSnapshot = await getDocs(collection(db, "provinces"));
        const provincesData: ProvinceData[] = await Promise.all(
          provincesSnapshot.docs.map(async (provinceDoc) => {
            const provinceData = provinceDoc.data() as Province;
            const districtsSnapshot = await getDocs(collection(db, `provinces/${provinceDoc.id}/districts`));
            const districtsData = districtsSnapshot.docs.map((districtDoc) => ({
              ...districtDoc.data() as District,
              id: districtDoc.id,
              createdBy: Array.isArray(districtDoc.data().createdBy) ? districtDoc.data().createdBy : [],
              editor: Array.isArray(districtDoc.data().editor) ? districtDoc.data().editor : [],
            } as DistrictData));
            return {
              ...provinceData,
              districts: districtsData,
              createdBy: Array.isArray(provinceData.createdBy) ? provinceData.createdBy : [],
              editor: Array.isArray(provinceData.editor) ? provinceData.editor : [],
            } as ProvinceData;
          })
        );
        setProvinces(provincesData);
        setFilteredProvinces(provincesData);
        if (provincesData.length > 0 && !selectedProvince) {
          setSelectedProvince(provincesData[0]);
          if (provincesData[0].districts.length > 0) setSelectedDistrict(provincesData[0].districts[0]);
        }
      } catch (err) {
        addToast("error", "Failed to fetch provinces.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, [session, status]);

  useEffect(() => {
    setFilteredProvinces(
      provinces.filter(
        (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.thaiName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, provinces]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  const recordHistory = (type: EditAction["type"], data: any, previousData: any) => {
    const id = (actionIdRef.current++).toString();
    const newAction: EditAction = { type, data, previousData, timestamp: Date.now(), id };
    const newHistory = [...history.slice(0, historyIndex + 1), newAction].slice(-MAX_HISTORY_SIZE);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    saveHistoryToLocalStorage(newHistory, newHistory.length - 1);
  };

  const saveHistoryToLocalStorage = (history: EditAction[], index: number) => {
    localStorage.setItem("mapEditorHistory", JSON.stringify(history));
    localStorage.setItem("mapEditorHistoryIndex", index.toString());
  };

  const undo = async () => {
    if (historyIndex < 0 || history.length === 0) return; // No history to undo
    const action = history[historyIndex];
    setHistoryIndex(historyIndex - 1);
    saveHistoryToLocalStorage(history, historyIndex - 1);
    applyHistoryAction(action, true);
  };

  const redo = async () => {
    if (historyIndex >= history.length - 1 || history.length === 0) return; // No future actions to redo
    setHistoryIndex(historyIndex + 1);
    saveHistoryToLocalStorage(history, historyIndex + 1);
    const action = history[historyIndex + 1];
    applyHistoryAction(action, false);
  };

  const applyHistoryAction = (action: EditAction, isUndo: boolean) => {
    const data = isUndo ? action.previousData : action.data;

    if (action.type === "updateDistrict" && selectedProvince && data) {
      const updatedDistricts = selectedProvince.districts.map((d) => (d.id === data.id ? data : d));
      setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
      setSelectedDistrict(data);
    } else if (action.type === "updateProvince" && data) {
      setProvinces(provinces.map((p) => (p.id === data.id ? data : p)));
      setSelectedProvince(data);
    } else if (action.type === "addProvince") {
      if (isUndo) {
        setProvinces(provinces.filter((p) => p.id !== data.id));
        if (selectedProvince?.id === data.id) setSelectedProvince(null);
        setSelectedDistrict(null);
      } else {
        setProvinces([...provinces, data]);
        setSelectedProvince(data);
      }
    } else if (action.type === "addDistrict" && selectedProvince) {
      if (isUndo) {
        const updatedDistricts = selectedProvince.districts.filter((d) => d.id !== data.id);
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
        if (selectedDistrict?.id === data.id) setSelectedDistrict(null);
      } else {
        const updatedDistricts = [...selectedProvince.districts, data];
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
        setSelectedDistrict(data);
      }
    } else if (action.type === "uploadMedia" && selectedDistrict && selectedProvince) {
      const updatedDistrict = { ...selectedDistrict, historicalPeriods: data.historicalPeriods };
      const updatedDistricts = selectedProvince.districts.map((d) => (d.id === selectedDistrict.id ? updatedDistrict : d));
      setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
      setSelectedDistrict(updatedDistrict);
    } else if (action.type === "uploadMap" && selectedDistrict && selectedProvince) {
      const updatedDistrict = { ...selectedDistrict, mapImageUrl: data.mapImageUrl };
      const updatedDistricts = selectedProvince.districts.map((d) => (d.id === selectedDistrict.id ? updatedDistrict : d));
      setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
      setSelectedDistrict(updatedDistrict);
    } else if (action.type === "deleteDistrict" && selectedProvince) {
      if (isUndo) {
        const updatedDistricts = [...selectedProvince.districts, data];
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
        setSelectedDistrict(data);
      } else {
        const updatedDistricts = selectedProvince.districts.filter((d) => d.id !== data.id);
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
        if (selectedDistrict?.id === data.id) setSelectedDistrict(null);
      }
    } else if (action.type === "deleteProvince") {
      if (isUndo) {
        setProvinces([...provinces, data]);
        setSelectedProvince(data);
      } else {
        setProvinces(provinces.filter((p) => p.id !== data.id));
        if (selectedProvince?.id === data.id) setSelectedProvince(null);
        setSelectedDistrict(null);
      }
    } else if (action.type === "updatePeriod" && selectedDistrict && selectedProvince) {
      const updatedDistrict = { ...selectedDistrict, historicalPeriods: data.historicalPeriods };
      const updatedDistricts = selectedProvince.districts.map((d) => (d.id === selectedDistrict.id ? updatedDistrict : d));
      setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
      setSelectedDistrict(updatedDistrict);
    } else if (action.type === "addPeriod" && selectedDistrict && selectedProvince) {
      if (isUndo) {
        const updatedPeriods = selectedDistrict.historicalPeriods.filter((p) => p.era !== data.era);
        const updatedDistrict = { ...selectedDistrict, historicalPeriods: updatedPeriods };
        const updatedDistricts = selectedProvince.districts.map((d) => (d.id === selectedDistrict.id ? updatedDistrict : d));
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
        setSelectedDistrict(updatedDistrict);
      } else {
        const updatedPeriods = [...selectedDistrict.historicalPeriods, data];
        const updatedDistrict = { ...selectedDistrict, historicalPeriods: updatedPeriods };
        const updatedDistricts = selectedProvince.districts.map((d) => (d.id === selectedDistrict.id ? updatedDistrict : d));
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
        setSelectedDistrict(updatedDistrict);
      }
    } else if (action.type === "deletePeriod" && selectedDistrict && selectedProvince) {
      if (isUndo) {
        const updatedPeriods = [...selectedDistrict.historicalPeriods, data];
        const updatedDistrict = { ...selectedDistrict, historicalPeriods: updatedPeriods };
        const updatedDistricts = selectedProvince.districts.map((d) => (d.id === selectedDistrict.id ? updatedDistrict : d));
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
        setSelectedDistrict(updatedDistrict);
      } else {
        const updatedPeriods = selectedDistrict.historicalPeriods.filter((p) => p.era !== data.era);
        const updatedDistrict = { ...selectedDistrict, historicalPeriods: updatedPeriods };
        const updatedDistricts = selectedProvince.districts.map((d) => (d.id === selectedDistrict.id ? updatedDistrict : d));
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
        setSelectedDistrict(updatedDistrict);
      }
    }
    // Mark unsaved changes when undoing/redoing
    setHasUnsavedChanges(true);
  };

  const canEdit = (item: ProvinceData | DistrictData | null): boolean => {
    if (!session?.user || !item) return false;
    const userId = session.user.id;
    const userRole = session.user.role;
    if (userRole === "admin" && userId === "1") return true; // Master admin
    if (item.lock && !item.createdBy.some((c) => c.id === userId)) return false;
    return item.createdBy.some((c) => c.id === userId) || (item.editor ?? []).some((e) => e.id === userId && e.role === "editor");
  };

  const saveChanges = async () => {
    if (!selectedProvince || isSaving) return;
    setIsSaving(true);
    try {
      const provinceRef = doc(db, "provinces", selectedProvince.id);
      await updateDoc(provinceRef, {
        name: selectedProvince.name,
        thaiName: selectedProvince.thaiName,
        totalArea: selectedProvince.totalArea,
        districts: selectedProvince.districts,
        version: selectedProvince.version + 1,
        updatedAt: Timestamp.now(),
        updatedBy: { id: session?.user?.id || "unknown", name: session?.user?.name || "Unknown" },
      });
      for (const district of selectedProvince.districts) {
        const districtRef = doc(db, `provinces/${selectedProvince.id}/districts`, district.id); // Fixed template literal syntax
        await setDoc(districtRef, district, { merge: true });
      }
      setProvinces((prev) => prev.map((p) => (p.id === selectedProvince.id ? { ...selectedProvince, version: selectedProvince.version + 1 } : p)));
      setHasUnsavedChanges(false);
      addToast("success", "Changes saved successfully!");
    } catch (err) {
      addToast("error", "Failed to save changes.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleLock = async (item: ProvinceData | DistrictData, type: "province" | "district") => {
    if (!canEdit(item)) return;
    try {
      if (type === "province" && selectedProvince) {
        const provinceRef = doc(db, "provinces", item.id);
        await updateDoc(provinceRef, { lock: !item.lock });
        setProvinces((prev) => prev.map((p) => (p.id === item.id ? { ...p, lock: !p.lock } : p)));
        setSelectedProvince({ ...selectedProvince, lock: !item.lock });
        addToast("success", `${item.name} ${item.lock ? "unlocked" : "locked"} successfully!`);
      } else if (type === "district" && selectedDistrict && selectedProvince) {
        const districtRef = doc(db, `provinces/${selectedProvince.id}/districts`, item.id);
        await updateDoc(districtRef, { lock: !item.lock });
        const updatedDistricts = selectedProvince.districts.map((d) => (d.id === item.id ? { ...d, lock: !d.lock } : d));
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
        setSelectedDistrict({ ...selectedDistrict, lock: !item.lock });
        addToast("success", `${item.name} ${item.lock ? "unlocked" : "locked"} successfully!`);
      }
    } catch (err) {
      addToast("error", `Failed to ${item.lock ? "unlock" : "lock"} ${item.name}.`);
      console.error(err);
    }
  };

  const addProvince = async () => {
    if (!newProvince.name || !newProvince.thaiName || !session?.user) return;
    try {
      const provinceRef = doc(collection(db, "provinces"));
      const newProvinceData: ProvinceData = {
        id: provinceRef.id,
        name: newProvince.name,
        thaiName: newProvince.thaiName,
        totalArea: newProvince.totalArea,
        districts: [],
        createdAt: Timestamp.now(),
        createdBy: [{ id: session.user.id, name: session.user.name || "Unknown" }],
        lock: false,
        version: 1,
      };
      await setDoc(provinceRef, newProvinceData);
      setProvinces((prev) => [...prev, newProvinceData]);
      setSelectedProvince(newProvinceData);
      setSelectedDistrict(null);
      recordHistory("addProvince", newProvinceData, null);
      addToast("success", "Province added successfully!");
      setNewProvince({ name: "", thaiName: "", totalArea: 0 });
      setIsAddProvinceModalOpen(false);
    } catch (err) {
      addToast("error", "Failed to add province.");
      console.error(err);
    }
  };

  const addDistrict = async () => {
    if (!selectedProvince || !newDistrict.name || !newDistrict.thaiName || !session?.user) return;
    try {
      const districtRef = doc(collection(db, `provinces/${selectedProvince.id}/districts`));
      const newDistrictData: DistrictData = {
        id: districtRef.id,
        name: newDistrict.name,
        thaiName: newDistrict.thaiName,
        historicalColor: newDistrict.historicalColor || "rgba(255, 255, 255, 0.5)",
        coordinates: newDistrict.coordinates || { x: 300, y: 200, width: 100, height: 100 },
        historicalPeriods: newDistrict.historicalPeriods || [],
        createdAt: Timestamp.now(),
        createdBy: [{ id: session.user.id, name: session.user.name || "Unknown" }],
        lock: false,
        version: 1,
      };
      await setDoc(districtRef, newDistrictData);
      const updatedProvince = { ...selectedProvince, districts: [...selectedProvince.districts, newDistrictData] };
      setSelectedProvince(updatedProvince);
      setSelectedDistrict(newDistrictData);
      setProvinces((prev) => prev.map((p) => (p.id === selectedProvince.id ? updatedProvince : p)));
      recordHistory("addDistrict", newDistrictData, null);
      addToast("success", "District added successfully!");
      setNewDistrict({
        name: "",
        thaiName: "",
        historicalColor: "rgba(255, 255, 255, 0.5)",
        coordinates: { x: 300, y: 200, width: 100, height: 100 },
        historicalPeriods: [],
        createdAt: Timestamp.now(),
        createdBy: [],
        lock: false,
        version: 1,
      });
      setIsAddDistrictModalOpen(false);
    } catch (err) {
      addToast("error", "Failed to add district.");
      console.error(err);
    }
  };

  const deleteProvince = async (province: ProvinceData) => {
    if (!canEdit(province)) return;
    try {
      await deleteDoc(doc(db, "provinces", province.id));
      setProvinces((prev) => prev.filter((p) => p.id !== province.id));
      if (selectedProvince?.id === province.id) {
        setSelectedProvince(null);
        setSelectedDistrict(null);
      }
      recordHistory("deleteProvince", province, province);
      addToast("success", "Province deleted successfully!");
    } catch (err) {
      addToast("error", "Failed to delete province.");
      console.error(err);
    }
  };

  const deleteDistrict = async (district: DistrictData) => {
    if (!selectedProvince || !canEdit(district)) return;
    try {
      await deleteDoc(doc(db, `provinces/${selectedProvince.id}/districts`, district.id));
      const updatedDistricts = selectedProvince.districts.filter((d) => d.id !== district.id);
      const updatedProvince = { ...selectedProvince, districts: updatedDistricts };
      setSelectedProvince(updatedProvince);
      setProvinces((prev) => prev.map((p) => (p.id === selectedProvince.id ? updatedProvince : p)));
      if (selectedDistrict?.id === district.id) setSelectedDistrict(null);
      recordHistory("deleteDistrict", district, district);
      addToast("success", "District deleted successfully!");
    } catch (err) {
      addToast("error", "Failed to delete district.");
      console.error(err);
    }
  };

  const updateProvinceName = async (province: ProvinceData, name: string, thaiName: string) => {
    if (!canEdit(province)) return;
    try {
      const provinceRef = doc(db, "provinces", province.id);
      const previousData = { ...province };
      const updatedProvince = { ...province, name, thaiName };
      await updateDoc(provinceRef, { name, thaiName });
      setProvinces((prev) => prev.map((p) => (p.id === province.id ? updatedProvince : p)));
      setSelectedProvince(updatedProvince);
      recordHistory("updateProvince", updatedProvince, previousData);
      addToast("success", "Province name updated successfully!");
    } catch (err) {
      addToast("error", "Failed to update province name.");
      console.error(err);
    }
  };

  const updateDistrictCoordinates = (district: DistrictData, coordinates: DistrictData["coordinates"]) => {
    if (!selectedProvince || !canEdit(district)) return;
    const previousData = { ...district };
    const updatedDistrict = { ...district, coordinates };
    const updatedDistricts = selectedProvince.districts.map((d) => (d.id === district.id ? updatedDistrict : d));
    setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
    setSelectedDistrict(updatedDistrict);
    recordHistory("updateDistrict", updatedDistrict, previousData);
    setHasUnsavedChanges(true);
  };

  const updateDistrictColor = (district: DistrictData, historicalColor: string) => {
    if (!selectedProvince || !canEdit(district)) return;
    const previousData = { ...district };
    const updatedDistrict = { ...district, historicalColor };
    const updatedDistricts = selectedProvince.districts.map((d) => (d.id === district.id ? updatedDistrict : d));
    setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
    setSelectedDistrict(updatedDistrict);
    recordHistory("updateDistrict", updatedDistrict, previousData);
    setHasUnsavedChanges(true);
  };

  const updateDistrictData = (district: DistrictData, data: Partial<DistrictData>) => {
    if (!selectedProvince || !canEdit(district)) return;
    const previousData = { ...district };
    const updatedDistrict = { ...district, ...data };
    const updatedDistricts = selectedProvince.districts.map((d) => (d.id === district.id ? updatedDistrict : d));
    setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
    setSelectedDistrict(updatedDistrict);
    recordHistory("updateDistrict", updatedDistrict, previousData);
    setHasUnsavedChanges(true);
  };

  const uploadMapImage = async () => {
    if (!selectedDistrict || !canEdit(selectedDistrict)) return;
    setIsUploading(true);
    try {
      let mapImageUrl = mapImageUrlInput;
      if (mapFile.file) {
        const formData = new FormData();
        formData.append("file", mapFile.file);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed");
        mapImageUrl = data.url;
      }
      if (!mapImageUrl) throw new Error("No map image provided");
      const previousData = { ...selectedDistrict };
      const updatedDistrict = { ...selectedDistrict, mapImageUrl };
      const updatedDistricts = selectedProvince!.districts.map((d) => (d.id === selectedDistrict.id ? updatedDistrict : d));
      setSelectedProvince({ ...selectedProvince!, districts: updatedDistricts });
      setSelectedDistrict(updatedDistrict);
      const districtRef = doc(db, `provinces/${selectedProvince!.id}/districts`, selectedDistrict.id);
      await updateDoc(districtRef, { mapImageUrl });
      recordHistory("uploadMap", updatedDistrict, previousData);
      addToast("success", "Map image uploaded successfully!");
      setMapFile({ file: null, previewUrl: null, type: "map" });
      setMapImageUrlInput("");
    } catch (err) {
      addToast("error", "Failed to upload map image.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMedia = async (district: DistrictData, periodIndex: number) => {
    if (!selectedProvince || !canEdit(district)) return;
    setIsUploading(true);
    try {
      let mediaUrl = mediaImageUrlInput;
      if (mediaFile.file) {
        const formData = new FormData();
        formData.append("file", mediaFile.file);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed");
        mediaUrl = data.url;
      }
      if (!mediaUrl) throw new Error("No media provided");
      const previousData = { ...district };
      const updatedPeriods = [...district.historicalPeriods];
      updatedPeriods[periodIndex].media.push({
        type: mediaFile.file ? (ALLOWED_IMAGE_TYPES.includes(mediaFile.file.type) ? "image" : "video") : mediaImageUrlInput.includes("video") ? "video" : "image",
        url: mediaUrl,
        altText: "",
        description: "",
      });
      const updatedDistrict = { ...district, historicalPeriods: updatedPeriods };
      const updatedDistricts = selectedProvince.districts.map((d) => (d.id === district.id ? updatedDistrict : d));
      setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
      setSelectedDistrict(updatedDistrict);
      const districtRef = doc(db, `provinces/${selectedProvince.id}/districts`, district.id);
      await updateDoc(districtRef, { historicalPeriods: updatedPeriods });
      recordHistory("uploadMedia", updatedDistrict, previousData);
      addToast("success", "Media uploaded successfully!");
      setMediaFile({ file: null, previewUrl: null, type: "image" });
      setMediaImageUrlInput("");
    } catch (err) {
      addToast("error", "Failed to upload media.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const inviteCollaborator = async (province: ProvinceData, invite: CollaborationInvite) => {
    if (!canEdit(province)) return;
    try {
      const provinceRef = doc(db, "provinces", province.id);
      const updatedEditors = [...(province.editor || []), { id: invite.email, name: invite.email, role: invite.role }];
      await updateDoc(provinceRef, { editor: updatedEditors });
      setProvinces((prev) => prev.map((p) => (p.id === province.id ? { ...p, editor: updatedEditors } : p)));
      setSelectedProvince({ ...province, editor: updatedEditors });
      addToast("success", `Invited ${invite.email} as ${invite.role}!`);
    } catch (err) {
      addToast("error", "Failed to invite collaborator.");
      console.error(err);
    }
  };

  const requestEditorAccess = async (item: ProvinceData | DistrictData) => {
    if (!session?.user) return;
    try {
      const requestRef = doc(collection(db, "collaborationRequests"));
      const requestData: CollaborationRequest = {
        id: requestRef.id,
        provinceId: "districts" in item ? item.id : item.id,
        districtId: "districts" in item ? undefined : item.id,
        requesterId: session.user.id,
        requesterName: session.user.name || "Unknown",
        status: "pending",
        requestedAt: Timestamp.now(),
      };
      await setDoc(requestRef, requestData);
      addToast("success", "Editor access request sent successfully!");
    } catch (err) {
      addToast("error", "Failed to request editor access.");
      console.error(err);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user || (session.user.role !== "admin" && session.user.role !== "master" )) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground/70">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Map Editor Dashboard</h1>
        <div className="flex gap-2">
        <motion.div className="fixed top-16 right-4 z-50 bg-glass-bg rounded-lg shadow-lg p-2 md:p-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => setIsControlsOpen((prev) => !prev)} className="w-full text-foreground mb-2 focus:outline-none" aria-label={isControlsOpen ? "Hide controls" : "Show controls"}>{isControlsOpen ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}</button>
            <AnimatePresence>
              {isControlsOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={undo}
                  disabled={historyIndex < 0}
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-secondary text-foreground rounded-lg shadow-lg disabled:opacity-50 flex items-center gap-2"
                  aria-label="Undo last action"
                >
                  <Undo2 className="w-4 h-4" /> Undo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-secondary text-foreground rounded-lg shadow-lg disabled:opacity-50 flex items-center gap-2"
                  aria-label="Redo last action"
                >
                  <Redo2 className="w-4 h-4" /> Redo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveChanges}
                  disabled={!hasUnsavedChanges || isSaving}
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-success text-background rounded-lg shadow-lg disabled:opacity-50 flex items-center gap-2"
                  aria-label="Save changes"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? "Saving..." : "Save"}
                </motion.button>
                </motion.div>
              )}
          </AnimatePresence>
        </motion.div>
      </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ProvinceSelector
            provinces={provinces}
            filteredProvinces={filteredProvinces}
            selectedProvince={selectedProvince}
            setSelectedProvince={setSelectedProvince}
            setSelectedDistrict={setSelectedDistrict}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            toggleLock={toggleLock}
            deleteProvince={deleteProvince}
            updateProvinceName={updateProvinceName}
            canEdit={canEdit}
            loading={loading}
            setIsAddProvinceModalOpen={setIsAddProvinceModalOpen}
            setIsCollaborationModalOpen={setIsCollaborationModalOpen}
            requestEditorAccess={requestEditorAccess}
          />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-6">
          <MapComponent
            selectedProvince={selectedProvince}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            updateDistrictCoordinates={updateDistrictCoordinates}
            canEdit={canEdit}
            mapState={mapState}
          />
          <motion.div
            initial={{ height: "auto" }}
            animate={{ height: isControlsOpen ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Controls</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsControlsOpen((prev) => !prev)}
                className="p-2 bg-accent text-foreground rounded-lg shadow-lg"
                aria-label={isControlsOpen ? "Hide controls" : "Show controls"}
              >
                {isControlsOpen ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </motion.button>
            </div>
            {isControlsOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DistrictEditor
                  selectedProvince={selectedProvince}
                  selectedDistrict={selectedDistrict}
                  updateDistrictCoordinates={updateDistrictCoordinates}
                  updateDistrictColor={updateDistrictColor}
                  uploadMapImage={uploadMapImage}
                  canEdit={canEdit}
                  toggleLock={toggleLock}
                  mapFile={mapFile}
                  setMapFile={setMapFile}
                  mapImageUrlInput={mapImageUrlInput}
                  setMapImageUrlInput={setMapImageUrlInput}
                  isUploading={isUploading}
                />
                <DataEditor
                  selectedProvince={selectedProvince}
                  selectedDistrict={selectedDistrict}
                  setSelectedDistrict={setSelectedDistrict}
                  setSelectedProvince={setSelectedProvince}
                  updateDistrictData={updateDistrictData}
                  deleteDistrict={deleteDistrict}
                  canEdit={canEdit}
                  setIsAddDistrictModalOpen={setIsAddDistrictModalOpen}
                  editMode={editMode}
                  setEditMode={setEditMode}
                  setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
                  setDeleteItem={setDeleteItem}
                  requestEditorAccess={requestEditorAccess}
                />
                <MediaEditor
                  selectedDistrict={selectedDistrict}
                  updateDistrictData={updateDistrictData}
                  uploadMedia={uploadMedia}
                  canEdit={canEdit}
                  mediaFile={mediaFile}
                  setMediaFile={setMediaFile}
                  mediaImageUrlInput={mediaImageUrlInput}
                  setMediaImageUrlInput={setMediaImageUrlInput}
                  isUploading={isUploading}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add Province Modal */}
      <AnimatePresence>
        {isAddProvinceModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-label="Add province modal"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md relative"
            >
              <button
                onClick={() => setIsAddProvinceModalOpen(false)}
                className="absolute top-2 right-2 text-xl text-foreground hover:text-primary focus:outline-none"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Add New Province</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Name</label>
                  <input
                    type="text"
                    value={newProvince.name}
                    onChange={(e) => setNewProvince({ ...newProvince, name: e.target.value })}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg focus:ring-2 focus:ring-primary"
                    aria-label="Province name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Thai Name</label>
                  <input
                    type="text"
                    value={newProvince.thaiName}
                    onChange={(e) => setNewProvince({ ...newProvince, thaiName: e.target.value })}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg focus:ring-2 focus:ring-primary"
                    aria-label="Thai name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Total Area (sq km)</label>
                  <input
                    type="number"
                    value={newProvince.totalArea}
                    onChange={(e) => setNewProvince({ ...newProvince, totalArea: Number(e.target.value) })}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg focus:ring-2 focus:ring-primary"
                    aria-label="Total area"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddProvinceModalOpen(false)}
                    className="px-4 py-2 bg-destructive text-background rounded-lg shadow-lg"
                    aria-label="Cancel adding province"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addProvince}
                    className="px-4 py-2 bg-success text-background rounded-lg shadow-lg"
                    aria-label="Add province"
                  >
                    Add
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add District Modal */}
      <AnimatePresence>
        {isAddDistrictModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-label="Add district modal"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md relative"
            >
              <button
                onClick={() => setIsAddDistrictModalOpen(false)}
                className="absolute top-2 right-2 text-xl text-foreground hover:text-primary focus:outline-none"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Add New District</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Name</label>
                  <input
                    type="text"
                    value={newDistrict.name}
                    onChange={(e) => setNewDistrict({ ...newDistrict, name: e.target.value })}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg focus:ring-2 focus:ring-primary"
                    aria-label="District name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Thai Name</label>
                  <input
                    type="text"
                    value={newDistrict.thaiName}
                    onChange={(e) => setNewDistrict({ ...newDistrict, thaiName: e.target.value })}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg focus:ring-2 focus:ring-primary"
                    aria-label="Thai name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Historical Color</label>
                  <input
                    type="color"
                    value={rgbaToHex(newDistrict.historicalColor || "#ffffff80")}
                    onChange={(e) => setNewDistrict({ ...newDistrict, historicalColor: hexToRgba(e.target.value, 0.5) })}
                    className="w-full h-10 p-1 bg-card text-foreground border border-primary rounded-lg"
                    aria-label="Historical color"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">X Position</label>
                    <input
                      type="number"
                      value={newDistrict.coordinates?.x || 300}
                      onChange={(e) => setNewDistrict({ ...newDistrict, coordinates: { ...newDistrict.coordinates!, x: Number(e.target.value) } })}
                      className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                      aria-label="X position"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Y Position</label>
                    <input
                      type="number"
                      value={newDistrict.coordinates?.y || 200}
                      onChange={(e) => setNewDistrict({ ...newDistrict, coordinates: { ...newDistrict.coordinates!, y: Number(e.target.value) } })}
                      className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                      aria-label="Y position"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Width</label>
                    <input
                      type="number"
                      value={newDistrict.coordinates?.width || 100}
                      onChange={(e) => setNewDistrict({ ...newDistrict, coordinates: { ...newDistrict.coordinates!, width: Number(e.target.value) } })}
                      className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                      aria-label="Width"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Height</label>
                    <input
                      type="number"
                      value={newDistrict.coordinates?.height || 100}
                      onChange={(e) => setNewDistrict({ ...newDistrict, coordinates: { ...newDistrict.coordinates!, height: Number(e.target.value) } })}
                      className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                      aria-label="Height"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddDistrictModalOpen(false)}
                    className="px-4 py-2 bg-destructive text-background rounded-lg shadow-lg"
                    aria-label="Cancel adding district"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addDistrict}
                    className="px-4 py-2 bg-success text-background rounded-lg shadow-lg"
                    aria-label="Add district"
                  >
                    Add
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collaboration Modal */}
      <CollaborationModal
        isOpen={isCollaborationModalOpen}
        setIsOpen={setIsCollaborationModalOpen}
        selectedProvince={selectedProvince}
        canEdit={canEdit}
        inviteCollaborator={inviteCollaborator}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        setIsOpen={setIsDeleteConfirmOpen}
        item={deleteItem}
        onConfirm={() => {
          if ("districts" in deleteItem!) deleteProvince(deleteItem as ProvinceData);
          else deleteDistrict(deleteItem as DistrictData);
        }}
      />

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`px-4 py-2 rounded-lg shadow-lg text-background ${
                toast.type === "success" ? "bg-success" : toast.type === "error" ? "bg-destructive" : "bg-accent"
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Utility Functions
function rgbaToHex(rgba: string): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return "#ffffff";
  const [_, r, g, b] = match;
  return `#${parseInt(r).toString(16).padStart(2, "0")}${parseInt(g).toString(16).padStart(2, "0")}${parseInt(b).toString(16).padStart(2, "0")}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isColorDark(color: string): boolean {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return false;
  const [_, r, g, b] = match;
  const luminance = 0.299 * parseInt(r) + 0.587 * parseInt(g) + 0.114 * parseInt(b);
  return luminance < 128;
}