'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, MapPin, Grid, Save, Plus, Trash2, Upload, Edit, X, Undo2, Redo2, Lock, Unlock, Search } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { debounce } from 'lodash';

// Define types based on your Firestore schema
interface Province {
  id: string;
  name: string;
  thaiName: string;
  totalArea: number;
  historicalPeriods: HistoricalPeriod[];
  collabSymbol: string;
  tags: string[];
  createdAt: any;
  createdBy: { name: string; id: string }[];
  editor: { name: string; id: string }[];
  lock: boolean;
  version: number;
  backgroundImageUrl: string;
  backgroundDimensions: { width: number; height: number };
}

interface District {
  id: string;
  name: string;
  thaiName: string;
  mapImageUrl: string;
  googleMapsUrl: string;
  coordinates: { x: number; y: number; width: number; height: number };
  historicalColor: string;
  historicalPeriods: HistoricalPeriod[];
  collab?: CollabData;
  culturalSignificance?: string;
  visitorTips?: string;
  interactiveFeatures?: string[];
  areaSize?: number;
  climate?: string;
  population?: number;
  tags?: string[];
  createdAt: any;
  createdBy: { name: string; id: string }[];
  editor: { name: string; id: string }[];
  lock: boolean;
  version: number;
}

interface HistoricalPeriod {
  era: string;
  description?: string;
  media: Media[];
  color?: string;
}

interface Media {
  type: 'image' | 'video' | 'audio' | 'map';
  url: string;
  altText: string;
  description: string;
}

interface CollabData {
  isActive: boolean;
  novelTitle: string;
  storylineSnippet: string;
}

interface ProvinceData extends Province {
  districts: District[];
}

interface EditAction {
  type: 'updateDistrict' | 'updateProvince' | 'addProvince' | 'addDistrict' | 'uploadMedia' | 'uploadMap';
  data: any;
  previousData: any;
  timestamp: number;
  id: string;
}

interface FileUpload {
  file: File | null;
  previewUrl: string | null;
  type: 'image' | 'video' | 'map';
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

// Firebase configuration (assumed to be in .env.local)
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
const storage = getStorage(app);

export default function MapEditorPage() {
  const { data: session, status } = useSession();
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [filteredProvinces, setFilteredProvinces] = useState<ProvinceData[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProvince, setNewProvince] = useState({ name: '', thaiName: '', totalArea: 0 });
  const [newDistrict, setNewDistrict] = useState<Partial<District>>({
    name: '',
    thaiName: '',
    historicalColor: 'rgba(255, 255, 255, 0.5)',
    coordinates: { x: 300, y: 200, width: 100, height: 100 },
    historicalPeriods: [],
  });
  const [showMapGrid, setShowMapGrid] = useState(true);
  const [showMapCenter, setShowMapCenter] = useState(true);
  const [mapScale, setMapScale] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDraggingDistrict, setIsDraggingDistrict] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [history, setHistory] = useState<EditAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'text'>('image');
  const [mapFile, setMapFile] = useState<FileUpload>({ file: null, previewUrl: null, type: 'map' });
  const [mediaFile, setMediaFile] = useState<FileUpload>({ file: null, previewUrl: null, type: 'image' });
  const [isAddProvinceModalOpen, setIsAddProvinceModalOpen] = useState(false);
  const [isAddDistrictModalOpen, setIsAddDistrictModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<'province' | 'district'>('district');
  const actionIdRef = useRef(0);

  const adminId = session?.user?.id || '2'; // Default to non-owner admin

  // Check if user is admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  // Fetch provinces and districts
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      try {
        const provincesSnapshot = await getDocs(collection(db, 'provinces'));
        const provincesData: ProvinceData[] = await Promise.all(
          provincesSnapshot.docs.map(async (provinceDoc) => {
            const provinceData = provinceDoc.data() as Province;
            const districtsSnapshot = await getDocs(collection(db, `provinces/${provinceDoc.id}/districts`));
            const districtsData = districtsSnapshot.docs.map((districtDoc) => ({
              ...districtDoc.data(),
              id: districtDoc.id,
            })) as District[];
            return { ...provinceData, districts: districtsData };
          })
        );
        setProvinces(provincesData);
        setFilteredProvinces(provincesData);
        if (provincesData.length > 0 && !selectedProvince) {
          setSelectedProvince(provincesData[0]);
          if (provincesData[0].districts.length > 0) {
            setSelectedDistrict(provincesData[0].districts[0]);
            setSelectedEra(provincesData[0].districts[0].historicalPeriods[0]?.era || null);
          }
        }
      } catch (err) {
        addToast('error', 'Failed to fetch provinces.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  // Filter provinces based on search query
  useEffect(() => {
    setFilteredProvinces(
      provinces.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.thaiName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, provinces]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  // Debounced map position updates
  const debouncedSetMapPosition = useCallback(
    debounce((x: number, y: number) => setMapPosition({ x, y }), 50),
    []
  );

  const handleMapMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !isDraggingDistrict) {
      setIsDraggingMap(true);
      setDragStart({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y });
    }
  }, [mapPosition, isDraggingDistrict]);

  const handleMapMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingMap) {
      debouncedSetMapPosition(e.clientX - dragStart.x, e.clientY - dragStart.y);
    }
    if (isDraggingDistrict && selectedProvince && canEdit(selectedDistrict)) {
      const district = selectedProvince.districts.find((d) => d.id === isDraggingDistrict);
      if (district) {
        const newX = (e.clientX - dragStart.x) / mapScale + district.coordinates.x;
        const newY = (e.clientY - dragStart.y) / mapScale + district.coordinates.y;
        const updatedDistrict = {
          ...district,
          coordinates: { ...district.coordinates, x: newX, y: newY },
        };
        const updatedDistricts = selectedProvince.districts.map((d) =>
          d.id === district.id ? updatedDistrict : d
        );
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
        setSelectedDistrict(updatedDistrict);
      }
    }
  }, [isDraggingMap, isDraggingDistrict, dragStart, mapScale, selectedProvince, selectedDistrict]);

  const handleDistrictMouseDown = useCallback((e: React.MouseEvent, districtId: string) => {
    e.stopPropagation();
    setIsDraggingDistrict(districtId);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isDraggingDistrict && selectedProvince && selectedDistrict) {
      const previousData = { ...selectedProvince.districts.find((d) => d.id === selectedDistrict.id) };
      const updatedDistrict = { ...selectedDistrict };
      recordHistory('updateDistrict', updatedDistrict, previousData);
    }
    setIsDraggingMap(false);
    setIsDraggingDistrict(null);
  }, [selectedProvince, selectedDistrict]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const scaleFactor = 0.15;
    setMapScale((prev) => Math.max(0.5, Math.min(3.5, prev + (e.deltaY < 0 ? scaleFactor : -scaleFactor))));
  }, []);

  const validateFile = (file: File, type: 'image' | 'video' | 'map'): boolean => {
    const maxSize = 10 * 1024 * 1024;
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];

    if (file.size > maxSize) {
      addToast('error', 'File size exceeds 10MB limit.');
      return false;
    }

    if (type === 'image' || type === 'map') {
      if (!allowedImageTypes.includes(file.type)) {
        addToast('error', 'Only JPEG, PNG, and GIF images are allowed.');
        return false;
      }
    } else if (type === 'video') {
      if (!allowedVideoTypes.includes(file.type)) {
        addToast('error', 'Only MP4 and WebM videos are allowed.');
        return false;
      }
    }
    return true;
  };

  const handleMapFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file, 'map')) {
      const previewUrl = URL.createObjectURL(file);
      setMapFile({ file, previewUrl, type: 'map' });
    }
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file, activeTab === 'image' ? 'image' : 'video')) {
      const previewUrl = URL.createObjectURL(file);
      setMediaFile({ file, previewUrl, type: activeTab === 'image' ? 'image' : 'video' });
    }
  };

  const recordHistory = (type: EditAction['type'], data: any, previousData: any) => {
    const id = (actionIdRef.current++).toString();
    const newHistory = [...history.slice(0, historyIndex + 1), { type, data, previousData, timestamp: Date.now(), id }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = async () => {
    if (historyIndex <= 0) return;
    const action = history[historyIndex];
    setHistoryIndex(historyIndex - 1);
    applyHistoryAction(action, true);
  };

  const redo = async () => {
    if (historyIndex >= history.length - 1) return;
    setHistoryIndex(historyIndex + 1);
    const action = history[historyIndex];
    applyHistoryAction(action, false);
  };

  const applyHistoryAction = (action: EditAction, isUndo: boolean) => {
    const data = isUndo ? action.previousData : action.data;
    if (!data || !selectedProvince) return;

    if (action.type === 'updateDistrict') {
      const updatedDistricts = selectedProvince.districts.map((d) => (d.id === data.id ? data : d));
      setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
      setSelectedDistrict(data);
    } else if (action.type === 'updateProvince') {
      setProvinces(provinces.map((p) => (p.id === data.id ? data : p)));
      setSelectedProvince(data);
    } else if (action.type === 'addProvince') {
      if (isUndo) {
        setProvinces(provinces.filter((p) => p.id !== data.id));
        if (selectedProvince?.id === data.id) setSelectedProvince(null);
      } else {
        setProvinces([...provinces, data]);
      }
    } else if (action.type === 'addDistrict') {
      if (isUndo && selectedProvince) {
        const updatedDistricts = selectedProvince.districts.filter((d) => d.id !== data.id);
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
        if (selectedDistrict?.id === data.id) setSelectedDistrict(null);
      } else if (selectedProvince) {
        const updatedDistricts = [...selectedProvince.districts, data];
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
      }
    } else if (action.type === 'uploadMedia' && selectedDistrict) {
      const updatedPeriods = [...selectedDistrict.historicalPeriods];
      const periodIndex = selectedDistrict.historicalPeriods.findIndex((p) => p.era === data.era);
      if (periodIndex >= 0) {
        updatedPeriods[periodIndex] = data;
        const updatedDistrict = { ...selectedDistrict, historicalPeriods: updatedPeriods };
        const updatedDistricts = selectedProvince.districts.map((d) =>
          d.id === selectedDistrict.id ? updatedDistrict : d
        );
        setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
        setSelectedDistrict(updatedDistrict);
      }
    } else if (action.type === 'uploadMap' && selectedDistrict) {
      const updatedDistrict = { ...selectedDistrict, mapImageUrl: data.mapImageUrl };
      const updatedDistricts = selectedProvince.districts.map((d) =>
        d.id === selectedDistrict.id ? updatedDistrict : d
      );
      setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
      setSelectedDistrict(updatedDistrict);
    }
  };

  const saveChanges = async () => {
    if (!selectedProvince) return;
    try {
      for (const action of history.slice(0, historyIndex + 1)) {
        if (action.type === 'updateDistrict' && selectedProvince && canEdit(action.data)) {
          const districtRef = doc(db, `provinces/${selectedProvince.id}/districts`, action.data.id);
          await updateDoc(districtRef, action.data);
        } else if (action.type === 'updateProvince' && canEdit(action.data)) {
          const provinceRef = doc(db, 'provinces', action.data.id);
          await updateDoc(provinceRef, action.data);
        } else if (action.type === 'addProvince') {
          const provinceRef = doc(db, 'provinces', action.data.id);
          await setDoc(provinceRef, action.data);
        } else if (action.type === 'addDistrict' && selectedProvince) {
          const districtRef = doc(db, `provinces/${selectedProvince.id}/districts`, action.data.id);
          await setDoc(districtRef, action.data);
        } else if (action.type === 'uploadMedia' && selectedDistrict && canEdit(selectedDistrict)) {
          const file = action.data.file;
          if (file) {
            const storageRef = ref(storage, `media/${selectedProvince.id}/${selectedDistrict.id}/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            const periodIndex = selectedDistrict.historicalPeriods.findIndex((p) => p.era === action.data.era);
            const updatedPeriods = [...selectedDistrict.historicalPeriods];
            updatedPeriods[periodIndex].media.push({
              type: action.data.type,
              url,
              altText: '',
              description: '',
            });
            const districtRef = doc(db, `provinces/${selectedProvince.id}/districts`, selectedDistrict.id);
            await updateDoc(districtRef, { historicalPeriods: updatedPeriods });
          }
        } else if (action.type === 'uploadMap' && selectedDistrict && canEdit(selectedDistrict)) {
          const file = action.data.file;
          if (file) {
            const storageRef = ref(storage, `maps/${selectedProvince.id}/${selectedDistrict.id}/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            const districtRef = doc(db, `provinces/${selectedProvince.id}/districts`, selectedDistrict.id);
            await updateDoc(districtRef, { mapImageUrl: url });
          }
        }
      }
      addToast('success', 'Changes saved successfully!');
      setHistory([]);
      setHistoryIndex(-1);
    } catch (err) {
      addToast('error', 'Failed to save changes.');
      console.error(err);
    }
  };

  const canEdit = (item: ProvinceData | District | null) => {
    if (!item || !session?.user?.name) return false;
    const isOwner = adminId === '1';
    const isCreator = item.createdBy.some((creator) => creator.name === session.user.name);
    return isOwner || (isCreator && !item.lock);
  };

  const toggleLock = async (item: ProvinceData | District, type: 'province' | 'district') => {
    if (adminId !== '1') return;
    const updatedItem = { ...item, lock: !item.lock };
    if (type === 'province') {
      recordHistory('updateProvince', updatedItem, item);
      setProvinces(provinces.map((p) => (p.id === item.id ? updatedItem as ProvinceData : p)));
      setSelectedProvince(updatedItem as ProvinceData);
    } else {
      recordHistory('updateDistrict', updatedItem, item);
      const updatedDistricts = selectedProvince!.districts.map((d) => (d.id === item.id ? updatedItem as District : d));
      setSelectedProvince({ ...selectedProvince!, districts: updatedDistricts });
      setSelectedDistrict(updatedItem as District);
    }
  };

  const updateDistrictCoordinates = (district: District, newCoords: District['coordinates']) => {
    if (!canEdit(district)) return;
    const updatedDistrict = { ...district, coordinates: newCoords };
    recordHistory('updateDistrict', updatedDistrict, district);
    const updatedDistricts = selectedProvince?.districts.map((d) =>
      d.id === district.id ? updatedDistrict : d
    ) || [];
    setSelectedProvince({ ...selectedProvince!, districts: updatedDistricts });
    setSelectedDistrict(updatedDistrict);
  };

  const updateDistrictColor = (district: District, newColor: string) => {
    if (!canEdit(district)) return;
    const updatedDistrict = { ...district, historicalColor: newColor };
    recordHistory('updateDistrict', updatedDistrict, district);
    const updatedDistricts = selectedProvince?.districts.map((d) =>
      d.id === district.id ? updatedDistrict : d
    ) || [];
    setSelectedProvince({ ...selectedProvince!, districts: updatedDistricts });
    setSelectedDistrict(updatedDistrict);
  };

  const uploadMapImage = async () => {
    if (!selectedProvince || !selectedDistrict || !mapFile.file || !canEdit(selectedDistrict)) return;
    const previousData = { ...selectedDistrict };
    try {
      const storageRef = ref(storage, `maps/${selectedProvince.id}/${selectedDistrict.id}/${mapFile.file.name}`);
      await uploadBytes(storageRef, mapFile.file);
      const url = await getDownloadURL(storageRef);
      recordHistory('uploadMap', { ...selectedDistrict, mapImageUrl: url }, previousData);
      setMapFile({ file: null, previewUrl: null, type: 'map' });
    } catch (err) {
      addToast('error', 'Failed to upload map image.');
      console.error(err);
    }
  };

  const uploadMedia = async (district: District, periodIndex: number) => {
    if (!selectedProvince || !mediaFile.file || !canEdit(district)) return;
    const previousData = { ...district };
    try {
      const storageRef = ref(storage, `media/${selectedProvince.id}/${district.id}/${mediaFile.file.name}`);
      await uploadBytes(storageRef, mediaFile.file);
      const url = await getDownloadURL(storageRef);
      const updatedPeriods = [...district.historicalPeriods];
      const newMedia: Media = { type: mediaFile.type, url, altText: '', description: '' };
      updatedPeriods[periodIndex] = {
        ...updatedPeriods[periodIndex],
        media: [...(updatedPeriods[periodIndex].media || []), newMedia],
      };
      const updatedDistrict = { ...district, historicalPeriods: updatedPeriods };
      recordHistory('uploadMedia', { ...updatedDistrict, era: updatedPeriods[periodIndex].era }, previousData);
      const updatedDistricts = selectedProvince.districts.map((d) =>
        d.id === district.id ? updatedDistrict : d
      );
      setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
      setSelectedDistrict(updatedDistrict);
      setMediaFile({ file: null, previewUrl: null, type: activeTab === 'image' ? 'image' : 'video' });
    } catch (err) {
      addToast('error', 'Failed to upload media.');
      console.error(err);
    }
  };

  const updateDistrictData = (district: District, updatedData: Partial<District>) => {
    if (!canEdit(district)) return;
    const updatedDistrict = { ...district, ...updatedData };
    recordHistory('updateDistrict', updatedDistrict, district);
    const updatedDistricts = selectedProvince?.districts.map((d) =>
      d.id === district.id ? updatedDistrict : d
    ) || [];
    setSelectedProvince({ ...selectedProvince!, districts: updatedDistricts });
    setSelectedDistrict(updatedDistrict);
  };

  const updateProvinceData = (province: ProvinceData, updatedData: Partial<ProvinceData>) => {
    if (!canEdit(province)) return;
    const updatedProvince = { ...province, ...updatedData };
    recordHistory('updateProvince', updatedProvince, province);
    setProvinces(provinces.map((p) => (p.id === province.id ? updatedProvince : p)));
    setSelectedProvince(updatedProvince);
  };

  const addNewProvince = () => {
    if (!newProvince.name || !newProvince.thaiName) {
      addToast('error', 'Please fill in all required fields for the new province.');
      return;
    }
    const provinceId = newProvince.name.toLowerCase().replace(/\s/g, '-');
    const newProvinceData: ProvinceData = {
      id: provinceId,
      name: newProvince.name,
      thaiName: newProvince.thaiName,
      totalArea: newProvince.totalArea,
      districts: [],
      historicalPeriods: [],
      tags: [],
      createdAt: Timestamp.now(),
      createdBy: [{ name: session?.user?.name || 'Admin', id: adminId }],
      editor: [{ name: session?.user?.name || 'Admin', id: adminId }],
      lock: false,
      version: 1,
      collabSymbol: '',
      backgroundImageUrl: '',
      backgroundDimensions: { width: 1920, height: 1080 },
    };
    recordHistory('addProvince', newProvinceData, null);
    setProvinces([...provinces, newProvinceData]);
    setNewProvince({ name: '', thaiName: '', totalArea: 0 });
    setIsAddProvinceModalOpen(false);
  };

  const addNewDistrict = () => {
    if (!selectedProvince || !newDistrict.name || !newDistrict.thaiName) {
      addToast('error', 'Please fill in all required fields for the new district.');
      return;
    }
    const newDistrictData: District = {
      id: newDistrict.name?.toLowerCase().replace(/\s/g, '-') || '',
      name: newDistrict.name || '',
      thaiName: newDistrict.thaiName || '',
      mapImageUrl: '',
      googleMapsUrl: '',
      coordinates: newDistrict.coordinates || { x: 300, y: 200, width: 100, height: 100 },
      historicalColor: newDistrict.historicalColor || 'rgba(255, 255, 255, 0.5)',
      historicalPeriods: newDistrict.historicalPeriods || [],
      createdAt: Timestamp.now(),
      createdBy: [{ name: session?.user?.name || 'Admin', id: adminId }],
      editor: [{ name: session?.user?.name || 'Admin', id: adminId }],
      lock: false,
      version: 1,
    };
    recordHistory('addDistrict', newDistrictData, null);
    const updatedDistricts = [...selectedProvince.districts, newDistrictData];
    setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
    setNewDistrict({
      name: '',
      thaiName: '',
      historicalColor: 'rgba(255, 255, 255, 0.5)',
      coordinates: { x: 300, y: 200, width: 100, height: 100 },
      historicalPeriods: [],
    });
    setIsAddDistrictModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-blue-600">Map Editor Dashboard</h1>
      </motion.div>

      {/* Floating Controls */}
      <motion.div
        className="fixed top-4 mt-12 right-4 z-50 flex gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={undo}
          className="p-2 bg-white text-gray-700 rounded-lg shadow-lg hover:bg-gray-100"
          disabled={historyIndex <= 0}
          aria-label="Undo last action"
        >
          <Undo2 className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={redo}
          className="p-2 bg-white text-gray-700 rounded-lg shadow-lg hover:bg-gray-100"
          disabled={historyIndex >= history.length - 1}
          aria-label="Redo last action"
        >
          <Redo2 className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveChanges}
          className="p-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 flex items-center gap-1"
          aria-label="Save changes"
        >
          <Save className="w-5 h-5" /> Save
        </motion.button>
      </motion.div>

      {/* Toasts */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.message}
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-2"
              aria-label="Close toast"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Province Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Select Province</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddProvinceModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg flex items-center gap-2 hover:bg-blue-600"
            aria-label="Add new province"
          >
            <Plus className="w-4 h-4" /> Add Province
          </motion.button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search provinces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Search provinces"
          />
        </div>
        <div className="mt-2 max-h-60 overflow-y-auto bg-white rounded-lg shadow-lg">
          {filteredProvinces.map((province) => (
            <div key={province.id} className="flex items-center justify-between p-2 hover:bg-gray-100">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedProvince(province);
                  setSelectedDistrict(province.districts[0] || null);
                  setSelectedEra(province.districts[0]?.historicalPeriods[0]?.era || null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-left ${
                  selectedProvince?.id === province.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                aria-label={`Select ${province.thaiName}`}
              >
                {province.thaiName} ({province.name})
              </motion.button>
              {adminId === '1' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleLock(province, 'province')}
                  className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  aria-label={province.lock ? 'Unlock province' : 'Lock province'}
                >
                  {province.lock ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </motion.button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add Province Modal */}
      <AnimatePresence>
        {isAddProvinceModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Add New Province</h3>
              <input
                type="text"
                placeholder="Province Name"
                value={newProvince.name}
                onChange={(e) => setNewProvince({ ...newProvince, name: e.target.value })}
                className="w-full p-2 mb-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Province name"
              />
              <input
                type="text"
                placeholder="Thai Name"
                value={newProvince.thaiName}
                onChange={(e) => setNewProvince({ ...newProvince, thaiName: e.target.value })}
                className="w-full p-2 mb-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Thai name"
              />
              <input
                type="number"
                placeholder="Total Area (sq km)"
                value={newProvince.totalArea}
                onChange={(e) => setNewProvince({ ...newProvince, totalArea: Number(e.target.value) })}
                className="w-full p-2 mb-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Total area"
              />
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addNewProvince}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg flex items-center justify-center gap-2 hover:bg-green-600"
                  aria-label="Add province"
                >
                  <Plus className="w-4 h-4" /> Add
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAddProvinceModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600"
                  aria-label="Cancel"
                >
                  Cancel
                </motion.button>
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Add New District</h3>
              <input
                type="text"
                placeholder="District Name"
                value={newDistrict.name || ''}
                onChange={(e) => setNewDistrict({ ...newDistrict, name: e.target.value })}
                className="w-full p-2 mb-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="District name"
              />
              <input
                type="text"
                placeholder="Thai Name"
                value={newDistrict.thaiName || ''}
                onChange={(e) => setNewDistrict({ ...newDistrict, thaiName: e.target.value })}
                className="w-full p-2 mb-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Thai name"
              />
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addNewDistrict}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg flex items-center justify-center gap-2 hover:bg-green-600"
                  aria-label="Add district"
                >
                  <Plus className="w-4 h-4" /> Add
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAddDistrictModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600"
                  aria-label="Cancel"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedProvince && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section 1 - District Dynamic Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-1 lg:col-span-1 bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Dynamic Map Editor</h2>
              {selectedDistrict && adminId === '1' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleLock(selectedDistrict, 'district')}
                  className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  aria-label={selectedDistrict.lock ? 'Unlock district' : 'Lock district'}
                >
                  {selectedDistrict.lock ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </motion.button>
              )}
            </div>
            <div className="relative h-[50vh] rounded-xl overflow-hidden bg-gray-200">
              <div className="absolute top-4 right-4 z-20 bg-white rounded-lg p-2 flex flex-col gap-2 shadow-lg">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMapScale((prev) => Math.min(prev + 0.25, 3.5))}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
                  aria-label="Zoom in"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setMapScale(1);
                    setMapPosition({ x: 0, y: 0 });
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-500 text-white hover:bg-gray-600"
                  aria-label="Reset map"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMapScale((prev) => Math.max(prev - 0.25, 0.5))}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
                  aria-label="Zoom out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMapGrid((prev) => !prev)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    showMapGrid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  } hover:bg-blue-600`}
                  aria-label="Toggle grid"
                >
                  <Grid className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMapCenter((prev) => !prev)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    showMapCenter ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700'
                  } hover:bg-gray-600`}
                  aria-label="Toggle center marker"
                >
                  <MapPin className="w-4 h-4" />
                </motion.button>
              </div>
              <div
                className="w-full h-full cursor-grab"
                onMouseDown={handleMapMouseDown}
                onMouseMove={handleMapMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{ cursor: isDraggingMap ? 'grabbing' : 'grab' }}
              >
                <motion.div
                  animate={{ x: mapPosition.x, y: mapPosition.y, scale: mapScale }}
                  transition={{ duration: 0.15 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <svg viewBox="0 0 600 400" className="w-full h-auto">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeOpacity="0.15" />
                      </pattern>
                    </defs>
                    {showMapGrid && <rect width="600" height="400" fill="url(#grid)" opacity="0.4" />}
                    {showMapCenter && (
                      <circle cx="300" cy="200" r="5" fill="gray" stroke="black" strokeWidth="2" />
                    )}
                    <g>
                      {selectedProvince.districts.map((district) => (
                        <motion.g
                          key={district.id}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedDistrict(district)}
                          onMouseDown={(e) => handleDistrictMouseDown(e, district.id)}
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
                                cursor: isDraggingDistrict === district.id ? 'grabbing' : 'pointer',
                              }}
                            />
                          ) : (
                            <rect
                              x={district.coordinates.x}
                              y={district.coordinates.y}
                              width={district.coordinates.width}
                              height={district.coordinates.height}
                              fill={district.historicalColor}
                              stroke="black"
                              strokeWidth={selectedDistrict?.id === district.id ? 3 : 1.5}
                              strokeOpacity={selectedDistrict?.id === district.id ? 0.9 : 0.4}
                              className="transition-all duration-300"
                              style={{
                                cursor: isDraggingDistrict === district.id ? 'grabbing' : 'pointer',
                              }}
                            />
                          )}
                          <text
                            x={district.coordinates.x + district.coordinates.width / 2}
                            y={district.coordinates.y + district.coordinates.height / 2}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fill={isColorDark(district.historicalColor) ? '#fff' : '#333'}
                            fontSize="14"
                            fontWeight={selectedDistrict?.id === district.id ? 'bold' : 'normal'}
                            className="select-none"
                            opacity={selectedDistrict?.id === district.id ? 1 : 0.8}
                          >
                            {district.thaiName}
                          </text>
                        </motion.g>
                      ))}
                    </g>
                  </svg>
                </motion.div>
              </div>
            </div>
            {selectedDistrict && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Edit {selectedDistrict.thaiName}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">X Position</label>
                    <input
                      type="number"
                      value={selectedDistrict.coordinates.x}
                      onChange={(e) =>
                        updateDistrictCoordinates(selectedDistrict, {
                          ...selectedDistrict.coordinates,
                          x: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!canEdit(selectedDistrict)}
                      aria-label="X position"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Y Position</label>
                    <input
                      type="number"
                      value={selectedDistrict.coordinates.y}
                      onChange={(e) =>
                        updateDistrictCoordinates(selectedDistrict, {
                          ...selectedDistrict.coordinates,
                          y: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!canEdit(selectedDistrict)}
                      aria-label="Y position"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Width</label>
                    <input
                      type="number"
                      value={selectedDistrict.coordinates.width}
                      onChange={(e) =>
                        updateDistrictCoordinates(selectedDistrict, {
                          ...selectedDistrict.coordinates,
                          width: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!canEdit(selectedDistrict)}
                      aria-label="Width"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Height</label>
                    <input
                      type="number"
                      value={selectedDistrict.coordinates.height}
                      onChange={(e) =>
                        updateDistrictCoordinates(selectedDistrict, {
                          ...selectedDistrict.coordinates,
                          height: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!canEdit(selectedDistrict)}
                      aria-label="Height"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Historical Color</label>
                    <input
                      type="color"
                      value={rgbaToHex(selectedDistrict.historicalColor)}
                      onChange={(e) => updateDistrictColor(selectedDistrict, hexToRgba(e.target.value, 0.5))}
                      className="w-full h-10 p-1 bg-white border border-gray-300 rounded-lg"
                      disabled={!canEdit(selectedDistrict)}
                      aria-label="Historical color"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Upload Map Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMapFileChange}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg mb-2"
                      disabled={!canEdit(selectedDistrict)}
                      aria-label="Upload map image"
                    />
                    {mapFile.previewUrl && (
                      <div className="mt-2">
                        <img
                          src={mapFile.previewUrl}
                          alt="Map Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={uploadMapImage}
                          className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg flex items-center justify-center gap-2 hover:bg-blue-600"
                          aria-label="Upload map image"
                        >
                          <Upload className="w-4 h-4" /> Upload
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Section 2 - District Editor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-1 lg:col-span-1 bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Data Editor</h2>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode('province')}
                  className={`px-4 py-2 rounded-lg shadow-lg ${
                    editMode === 'province' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                  aria-label="Edit province data"
                >
                  Province
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode('district')}
                  className={`px-4 py-2 rounded-lg shadow-lg ${
                    editMode === 'district' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                  aria-label="Edit district data"
                >
                  District
                </motion.button>
              </div>
            </div>
            {editMode === 'district' && (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedProvince.districts.map((district) => (
                    <motion.button
                      key={district.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedDistrict(district);
                        setSelectedEra(district.historicalPeriods[0]?.era || null);
                      }}
                      className={`px-4 py-2 rounded-lg shadow-lg ${
                        selectedDistrict?.id === district.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      aria-label={`Select ${district.thaiName}`}
                    >
                      {district.thaiName}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAddDistrictModalOpen(true)}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg flex items-center justify-center gap-2 hover:bg-green-600"
                  aria-label="Add new district"
                >
                  <Plus className="w-4 h-4" /> Add District
                </motion.button>
                {selectedDistrict && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={selectedDistrict.name}
                        onChange={(e) => updateDistrictData(selectedDistrict, { name: e.target.value })}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={!canEdit(selectedDistrict)}
                        aria-label="District name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Thai Name</label>
                      <input
                        type="text"
                        value={selectedDistrict.thaiName}
                        onChange={(e) => updateDistrictData(selectedDistrict, { thaiName: e.target.value })}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={!canEdit(selectedDistrict)}
                        aria-label="Thai name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cultural Significance</label>
                      <textarea
                        value={selectedDistrict.culturalSignificance || ''}
                        onChange={(e) =>
                          updateDistrictData(selectedDistrict, { culturalSignificance: e.target.value })
                        }
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={!canEdit(selectedDistrict)}
                        aria-label="Cultural significance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Visitor Tips</label>
                      <textarea
                        value={selectedDistrict.visitorTips || ''}
                        onChange={(e) => updateDistrictData(selectedDistrict, { visitorTips: e.target.value })}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={!canEdit(selectedDistrict)}
                        aria-label="Visitor tips"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created By</label>
                      <input
                        type="text"
                        value={selectedDistrict.createdBy.map((c) => c.name).join(', ')}
                        disabled
                        className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg"
                        aria-label="Created by"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            {editMode === 'province' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={selectedProvince.name}
                    onChange={(e) => updateProvinceData(selectedProvince, { name: e.target.value })}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!canEdit(selectedProvince)}
                    aria-label="Province name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thai Name</label>
                  <input
                    type="text"
                    value={selectedProvince.thaiName}
                    onChange={(e) => updateProvinceData(selectedProvince, { thaiName: e.target.value })}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!canEdit(selectedProvince)}
                    aria-label="Thai name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Area (sq km)</label>
                  <input
                    type="number"
                    value={selectedProvince.totalArea}
                    onChange={(e) => updateProvinceData(selectedProvince, { totalArea: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!canEdit(selectedProvince)}
                    aria-label="Total area"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created By</label>
                  <input
                    type="text"
                    value={selectedProvince.createdBy.map((c) => c.name).join(', ')}
                    disabled
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg"
                    aria-label="Created by"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Section 3 - Media Editor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-1 lg:col-span-1 bg-white p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Media Editor</h2>
            <div className="flex border-b border-gray-300 mb-4">
              {['image', 'video', 'text'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 font-medium ${
                    activeTab === tab
                      ? 'text-blue-500 border-b-2 border-blue-500'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  aria-label={`Switch to ${tab} tab`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {selectedDistrict && (
              <div className="space-y-4">
                {selectedDistrict.historicalPeriods.map((period, index) => (
                  <div key={period.era} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">{period.era}</h3>
                    <div className="space-y-2">
                      {period.media
                        .filter((media) => {
                          if (activeTab === 'image') return media.type === 'image';
                          if (activeTab === 'video') return media.type === 'video';
                          return true;
                        })
                        .map((media, mediaIndex) => (
                          <div key={mediaIndex} className="flex items-center gap-2">
                            {media.type === 'image' && (
                              <img
                                src={media.url}
                                alt={media.altText}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            {media.type === 'video' && (
                              <video
                                src={media.url}
                                controls
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <input
                                type="text"
                                value={media.description}
                                onChange={(e) => {
                                  const updatedPeriods = [...selectedDistrict.historicalPeriods];
                                  updatedPeriods[index].media[mediaIndex].description = e.target.value;
                                  updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
                                }}
                                className="w-full p-1 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Description"
                                disabled={!canEdit(selectedDistrict)}
                                aria-label="Media description"
                              />
                              <p className="text-xs text-gray-500 truncate">{media.url}</p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const updatedPeriods = [...selectedDistrict.historicalPeriods];
                                updatedPeriods[index].media.splice(mediaIndex, 1);
                                updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
                              }}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                              disabled={!canEdit(selectedDistrict)}
                              aria-label="Delete media"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        ))}
                      {activeTab === 'text' && (
                        <div className="p-2 bg-white rounded-lg">
                          <textarea
                            value={period.description || ''}
                            onChange={(e) => {
                              const updatedPeriods = [...selectedDistrict.historicalPeriods];
                              updatedPeriods[index] = { ...period, description: e.target.value };
                              updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
                            }}
                            className="w-full h-24 p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                            disabled={!canEdit(selectedDistrict)}
                            aria-label="Period description"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Upload New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} for {period.era}
                        </label>
                        <input
                          type="file"
                          accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                          onChange={handleMediaFileChange}
                          className="w-full p-2 bg-white border border-gray-300 rounded-lg mb-2"
                          disabled={!canEdit(selectedDistrict)}
                          aria-label={`Upload ${activeTab} for ${period.era}`}
                        />
                        {mediaFile.previewUrl && (
                          <div className="mt-2">
                            {mediaFile.type === 'image' && (
                              <img
                                src={mediaFile.previewUrl}
                                alt="Media Preview"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            )}
                            {mediaFile.type === 'video' && (
                              <video
                                src={mediaFile.previewUrl}
                                controls
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => uploadMedia(selectedDistrict, index)}
                              className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg flex items-center justify-center gap-2 hover:bg-blue-600"
                              aria-label="Upload media"
                            >
                              <Upload className="w-4 h-4" /> Upload
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function isColorDark(color: string): boolean {
  let r = 0, g = 0, b = 0;
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+?\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function rgbaToHex(rgba: string): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+?\)/);
  if (!match) return '#ffffff';
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}