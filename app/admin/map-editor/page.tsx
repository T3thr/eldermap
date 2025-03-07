// app/admin/map-editor/page.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, MapPin, Grid, Save, Plus, Trash2, Upload, Edit, X, Undo2, Redo2 } from 'lucide-react';
import { District, Province, HistoricalPeriod, Media, CollabData } from '@/lib/districts';

interface ProvinceData extends Province {
  districts: DistrictData[];
}

interface DistrictData extends District {
  historicalPeriods: HistoricalPeriod[];
  collab?: CollabData;
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
  type: 'image' | 'video' | 'text' | 'map';
}

export default function MapEditorPage() {
  const { data: session, status } = useSession();
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [newProvince, setNewProvince] = useState({ name: '', thaiName: '', id: '' });
  const [newDistrict, setNewDistrict] = useState<Partial<DistrictData>>({
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize history and historyIndex with defaults; load from localStorage in useEffect
  const [history, setHistory] = useState<EditAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'text'>('image');
  const [mapFile, setMapFile] = useState<FileUpload>({ file: null, previewUrl: null, type: 'map' });
  const [mediaFile, setMediaFile] = useState<FileUpload>({ file: null, previewUrl: null, type: 'image' });
  const [editingProvinceName, setEditingProvinceName] = useState<string | null>(null);
  const [mapImageUrlInput, setMapImageUrlInput] = useState<string>('');
  const [mediaImageUrlInput, setMediaImageUrlInput] = useState<string>('');
  const actionIdRef = useRef(0);

  // Load history from localStorage only on the client side
  useEffect(() => {
    const loadHistoryFromLocalStorage = (): EditAction[] => {
      const history = localStorage.getItem('mapEditorHistory');
      return history ? JSON.parse(history) : [];
    };

    const loadHistoryIndexFromLocalStorage = (): number => {
      const index = localStorage.getItem('mapEditorHistoryIndex');
      return index ? parseInt(index, 10) : -1;
    };

    setHistory(loadHistoryFromLocalStorage());
    setHistoryIndex(loadHistoryIndexFromLocalStorage());
  }, []);

  // Fetch provinces data
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/map-editor');
        const provincesData = await response.json();
        setProvinces(provincesData);
        if (provincesData.length > 0 && !selectedProvince) {
          setSelectedProvince(provincesData[0]);
          if (provincesData[0].districts.length > 0) {
            setSelectedDistrict(provincesData[0].districts[0]);
            setSelectedEra(provincesData[0].districts[0].historicalPeriods[0]?.era || null);
          }
        }
      } catch (err) {
        setError('Failed to fetch provinces.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  const handleMapMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !isDraggingDistrict) {
      setIsDraggingMap(true);
      setDragStart({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y });
    }
  }, [mapPosition, isDraggingDistrict]);

  const handleMapMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingMap) {
      setMapPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
    if (isDraggingDistrict && selectedProvince) {
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
  }, [isDraggingMap, isDraggingDistrict, dragStart, mapScale, selectedProvince]);

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
      setError('File size exceeds 10MB limit.');
      return false;
    }

    if (type === 'image' || type === 'map') {
      if (!allowedImageTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and GIF images are allowed.');
        return false;
      }
    } else if (type === 'video') {
      if (!allowedVideoTypes.includes(file.type)) {
        setError('Only MP4 and WebM videos are allowed.');
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
      setMediaFile({ file, previewUrl, type: activeTab });
    }
  };

  const recordHistory = (type: EditAction['type'], data: any, previousData: any) => {
    const id = (actionIdRef.current++).toString();
    const newHistory = [...history.slice(0, historyIndex + 1), { type, data, previousData, timestamp: Date.now(), id }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    saveHistoryToLocalStorage(newHistory, historyIndex + 1);
  };

  const saveHistoryToLocalStorage = (history: EditAction[], index: number) => {
    localStorage.setItem('mapEditorHistory', JSON.stringify(history));
    localStorage.setItem('mapEditorHistoryIndex', index.toString());
  };

  const undo = async () => {
    if (historyIndex <= 0) return;
    const action = history[historyIndex];
    setHistoryIndex(historyIndex - 1);
    saveHistoryToLocalStorage(history, historyIndex - 1);
    applyHistoryAction(action, true);
  };

  const redo = async () => {
    if (historyIndex >= history.length - 1) return;
    setHistoryIndex(historyIndex + 1);
    saveHistoryToLocalStorage(history, historyIndex + 1);
    const action = history[historyIndex];
    applyHistoryAction(action, false);
  };

  const applyHistoryAction = (action: EditAction, isUndo: boolean) => {
    const data = isUndo ? action.previousData : action.data;
    if (!data || !selectedProvince) return;

    if (action.type === 'updateDistrict') {
      const updatedDistricts = selectedProvince.districts.map((d) =>
        d.id === data.id ? data : d
      );
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
      const updatedPeriods = [...(selectedDistrict.historicalPeriods || [])];
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
        if (action.type === 'updateDistrict') {
          await fetch('/api/map-editor', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'district',
              id: action.data.id,
              provinceId: selectedProvince.id,
              data: action.data
            })
          });
        } else if (action.type === 'updateProvince') {
          await fetch('/api/map-editor', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'province',
              id: action.data.id,
              data: action.data
            })
          });
        } else if (action.type === 'addProvince') {
          await fetch('/api/map-editor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'province',
              data: action.data
            })
          });
        } else if (action.type === 'addDistrict') {
          await fetch('/api/map-editor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'district',
              data: { ...action.data, provinceId: selectedProvince.id }
            })
          });
        } else if (action.type === 'uploadMedia' && selectedDistrict) {
          const response = await fetch('/api/map-editor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'media',
              data: {
                provinceId: selectedProvince.id,
                districtId: selectedDistrict.id,
                file: action.data.file,
                periodIndex: selectedDistrict.historicalPeriods.findIndex(p => p.era === action.data.era)
              }
            })
          });
          const { url } = await response.json();
          action.data.url = url;
        } else if (action.type === 'uploadMap' && selectedDistrict) {
          const response = await fetch('/api/map-editor', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'mapImage',
              data: {
                provinceId: selectedProvince.id,
                districtId: selectedDistrict.id,
                file: action.data.file || { url: mapImageUrlInput }
              }
            })
          });
          const { url } = await response.json();
          action.data.mapImageUrl = url;
        }
      }
      setSuccess('Changes saved successfully!');
      setHistory([]);
      setHistoryIndex(-1);
      saveHistoryToLocalStorage([], -1);
      setMapImageUrlInput('');
      setMediaImageUrlInput('');
    } catch (err) {
      setError('Failed to save changes.');
      console.error(err);
    }
  };

  const updateProvinceName = (province: ProvinceData, newName: string, newThaiName: string) => {
    const updatedProvince = { ...province, name: newName, thaiName: newThaiName };
    recordHistory('updateProvince', updatedProvince, province);
    setProvinces(provinces.map((p) => (p.id === province.id ? updatedProvince : p)));
    setSelectedProvince(updatedProvince);
    setEditingProvinceName(null);
  };

  const updateDistrictCoordinates = (district: DistrictData, newCoords: DistrictData['coordinates']) => {
    const updatedDistrict = { ...district, coordinates: newCoords };
    recordHistory('updateDistrict', updatedDistrict, district);
    const updatedDistricts = selectedProvince?.districts.map((d) =>
      d.id === district.id ? updatedDistrict : d
    ) || [];
    setSelectedProvince({ ...selectedProvince!, districts: updatedDistricts });
    setSelectedDistrict(updatedDistrict);
  };

  const updateDistrictColor = (district: DistrictData, newColor: string) => {
    const updatedDistrict = { ...district, historicalColor: newColor };
    recordHistory('updateDistrict', updatedDistrict, district);
    const updatedDistricts = selectedProvince?.districts.map((d) =>
      d.id === district.id ? updatedDistrict : d
    ) || [];
    setSelectedProvince({ ...selectedProvince!, districts: updatedDistricts });
    setSelectedDistrict(updatedDistrict);
  };

  const uploadMapImage = async () => {
    if (!selectedProvince || !selectedDistrict || !mapFile.file) return;
    const previousData = { ...selectedDistrict };
    try {
      const response = await fetch('/api/map-editor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mapImage',
          data: {
            provinceId: selectedProvince.id,
            districtId: selectedDistrict.id,
            file: {
              name: mapFile.file.name,
              type: mapFile.file.type,
              buffer: await mapFile.file.arrayBuffer()
            }
          }
        })
      });
      const { url } = await response.json();
      recordHistory('uploadMap', { ...selectedDistrict, mapImageUrl: url }, previousData);
      setMapFile({ file: null, previewUrl: null, type: 'map' });
    } catch (err) {
      setError('Failed to upload map image.');
      console.error(err);
    }
  };

  const uploadMedia = async (district: DistrictData, periodIndex: number) => {
    if (!selectedProvince || !mediaFile.file) return;
    const previousData = { ...district };
    try {
      const response = await fetch('/api/map-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'media',
          data: {
            provinceId: selectedProvince.id,
            districtId: district.id,
            file: {
              name: mediaFile.file.name,
              type: mediaFile.file.type,
              buffer: await mediaFile.file.arrayBuffer()
            },
            periodIndex
          }
        })
      });
      const { url } = await response.json();
      
      const updatedPeriods = [...(district.historicalPeriods || [])];
      const newMedia: Media = {
        type: mediaFile.type,
        url,
        description: '',
      };
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
      setMediaFile({ file: null, previewUrl: null, type: activeTab });
    } catch (err) {
      setError('Failed to upload media.');
      console.error(err);
    }
  };

  const updateDistrictData = (district: DistrictData, updatedData: Partial<DistrictData>) => {
    const updatedDistrict = { ...district, ...updatedData };
    recordHistory('updateDistrict', updatedDistrict, district);
    const updatedDistricts = selectedProvince?.districts.map((d) =>
      d.id === district.id ? updatedDistrict : d
    ) || [];
    setSelectedProvince({ ...selectedProvince!, districts: updatedDistricts });
    setSelectedDistrict(updatedDistrict);
  };

  const addNewProvince = () => {
    if (!newProvince.name || !newProvince.thaiName) {
      setError('Please fill in all required fields for the new province.');
      return;
    }
    const provinceId = newProvince.id || newProvince.name.toLowerCase().replace(/\s/g, '-');
    const newProvinceData = {
      id: provinceId,
      name: newProvince.name,
      thaiName: newProvince.thaiName,
      districts: [],
    };
    recordHistory('addProvince', newProvinceData, null);
    setProvinces([...provinces, newProvinceData]);
    setNewProvince({ name: '', thaiName: '', id: '' });
  };

  const addNewDistrict = () => {
    if (!selectedProvince || !newDistrict.name || !newDistrict.thaiName) {
      setError('Please fill in all required fields for the new district.');
      return;
    }
    const newDistrictData = {
      ...newDistrict,
      id: newDistrict.name?.toLowerCase().replace(/\s/g, '-'),
      historicalPeriods: newDistrict.historicalPeriods || [],
    };
    recordHistory('addDistrict', newDistrictData, null);
    const updatedDistricts = [...selectedProvince.districts, newDistrictData as DistrictData];
    setSelectedProvince({ ...selectedProvince, districts: updatedDistricts });
    setNewDistrict({
      name: '',
      thaiName: '',
      historicalColor: 'rgba(255, 255, 255, 0.5)',
      coordinates: { x: 300, y: 200, width: 100, height: 100 },
      historicalPeriods: [],
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Map Editor Dashboard</h1>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={undo}
              className="px-4 py-2 bg-secondary text-background rounded-lg shadow-lg"
              disabled={historyIndex <= 0}
            >
              <Undo2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={redo}
              className="px-4 py-2 bg-secondary text-background rounded-lg shadow-lg"
              disabled={historyIndex >= history.length - 1}
            >
              <Redo2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveChanges}
              className="px-4 py-2 bg-success text-background rounded-lg shadow-lg"
            >
              <Save className="w-4 h-4" /> Save
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-4 right-4 bg-accent text-background p-4 rounded-lg shadow-lg"
            >
              Loading...
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-4 right-4 bg-destructive text-background p-4 rounded-lg shadow-lg"
            >
              {error}
              <button onClick={() => setError(null)} className="ml-2">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-4 right-4 bg-success text-background p-4 rounded-lg shadow-lg"
            >
              {success}
              <button onClick={() => setSuccess(null)} className="ml-2">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Select Province</h2>
          <div className="flex flex-wrap gap-4">
            {provinces.map((province) => (
              <div key={province.id} className="flex items-center gap-2">
                {editingProvinceName === province.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={province.name}
                      onChange={(e) => {
                        const updatedProvince = { ...province, name: e.target.value };
                        setProvinces(provinces.map((p) => (p.id === province.id ? updatedProvince : p)));
                        setSelectedProvince(updatedProvince);
                      }}
                      className="p-2 bg-card text-foreground border border-primary rounded-lg"
                    />
                    <input
                      type="text"
                      value={province.thaiName}
                      onChange={(e) => {
                        const updatedProvince = { ...province, thaiName: e.target.value };
                        setProvinces(provinces.map((p) => (p.id === province.id ? updatedProvince : p)));
                        setSelectedProvince(updatedProvince);
                      }}
                      className="p-2 bg-card text-foreground border border-primary rounded-lg"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateProvinceName(province, province.name, province.thaiName)}
                      className="px-4 py-2 bg-success text-background rounded-lg shadow-lg"
                    >
                      Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingProvinceName(null)}
                      className="px-4 py-2 bg-destructive text-background rounded-lg shadow-lg"
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
                      setSelectedEra(province.districts[0]?.historicalPeriods[0]?.era || null);
                    }}
                    className={`px-4 py-2 rounded-lg shadow-lg ${
                      selectedProvince?.id === province.id
                        ? 'bg-primary text-background'
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    {province.thaiName} ({province.name})
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingProvinceName(province.id)}
                  className="px-2 py-2 bg-accent text-background rounded-lg shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
            <div className="p-4 bg-card rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Add New Province</h3>
              <input
                type="text"
                placeholder="Province Name"
                value={newProvince.name}
                onChange={(e) => setNewProvince({ ...newProvince, name: e.target.value })}
                className="w-full p-2 mb-2 bg-card text-foreground border border-primary rounded-lg"
              />
              <input
                type="text"
                placeholder="Thai Name"
                value={newProvince.thaiName}
                onChange={(e) => setNewProvince({ ...newProvince, thaiName: e.target.value })}
                className="w-full p-2 mb-2 bg-card text-foreground border border-primary rounded-lg"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addNewProvince}
                className="w-full px-4 py-2 bg-success text-background rounded-lg shadow-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Province
              </motion.button>
            </div>
          </div>
        </motion.div>

        {selectedProvince && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-1 lg:col-span-1 bg-card p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Virtual Map Editor</h2>
              <div className="relative h-[50vh] rounded-xl overflow-hidden bg-glass-bg border border-glass-border shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                <div className="absolute top-4 right-4 z-20 bg-glass-bg rounded-full p-2 flex flex-col gap-2 shadow-[0_0_10px_rgba(0,212,255,0.3)]">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMapScale((prev) => Math.min(prev + 0.25, 3.5))}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50"
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
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMapScale((prev) => Math.max(prev - 0.25, 0.5))}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50"
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
                      showMapGrid ? 'bg-primary/30 text-primary' : 'bg-card text-foreground/70'
                    } hover:bg-primary/40 border border-primary/50`}
                  >
                    <Grid className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMapCenter((prev) => !prev)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                      showMapCenter ? 'bg-secondary/30 text-secondary' : 'bg-card text-foreground/70'
                    } hover:bg-secondary/40 border border-secondary/50`}
                  >
                    <MapPin className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="absolute top-4 left-4 z-20 bg-glass-bg rounded-lg p-4 shadow-[0_0_10px_rgba(0,212,255,0.3)]">
                  <label className="block text-sm font-medium mb-2 text-foreground">Select Era</label>
                  <select
                    value={selectedEra || ''}
                    onChange={(e) => setSelectedEra(e.target.value || null)}
                    className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                  >
                    <option value="">All Eras</option>
                    {selectedDistrict?.historicalPeriods.map((period) => (
                      <option key={period.era} value={period.era}>
                        {period.era}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className="w-full h-full cursor-grab touch-pan-x touch-pan-y"
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
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--foreground)" strokeOpacity="0.15" />
                        </pattern>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      {showMapGrid && <rect width="600" height="400" fill="url(#grid)" opacity="0.4" />}
                      {showMapCenter && (
                        <circle
                          cx="300"
                          cy="200"
                          r="5"
                          fill="var(--secondary)"
                          stroke="var(--foreground)"
                          strokeWidth="2"
                          filter="url(#glow)"
                        />
                      )}
                      <g>
                        {selectedProvince.districts.map((district) => {
                          const period = selectedEra
                            ? district.historicalPeriods.find((p) => p.era === selectedEra)
                            : district.historicalPeriods[0];
                          const color = period?.color || district.historicalColor;
                          return (
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
                                    filter: selectedDistrict?.id === district.id ? 'url(#glow)' : '',
                                    cursor: isDraggingDistrict === district.id ? 'grabbing' : 'pointer',
                                  }}
                                />
                              ) : (
                                <rect
                                  x={district.coordinates.x}
                                  y={district.coordinates.y}
                                  width={district.coordinates.width}
                                  height={district.coordinates.height}
                                  fill={color}
                                  stroke="var(--foreground)"
                                  strokeWidth={selectedDistrict?.id === district.id ? 3 : 1.5}
                                  strokeOpacity={selectedDistrict?.id === district.id ? 0.9 : 0.4}
                                  className="transition-all duration-300"
                                  style={{
                                    filter: selectedDistrict?.id === district.id ? 'url(#glow)' : '',
                                    cursor: isDraggingDistrict === district.id ? 'grabbing' : 'pointer',
                                  }}
                                />
                              )}
                              <text
                                x={district.coordinates.x + district.coordinates.width / 2}
                                y={district.coordinates.y + district.coordinates.height / 2}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fill={isColorDark(color) ? '#fff' : '#333'}
                                fontSize="14"
                                fontWeight={selectedDistrict?.id === district.id ? 'bold' : 'normal'}
                                className="font-thai select-none"
                                opacity={selectedDistrict?.id === district.id ? 1 : 0.8}
                              >
                                {district.thaiName}
                              </text>
                            </motion.g>
                          );
                        })}
                      </g>
                    </svg>
                  </motion.div>
                </div>
              </div>

              {selectedDistrict && (
                <div className="mt-4 p-4 bg-card rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Edit {selectedDistrict.thaiName}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground">X Position</label>
                      <input
                        type="number"
                        value={selectedDistrict.coordinates.x}
                        onChange={(e) =>
                          updateDistrictCoordinates(selectedDistrict, {
                            ...selectedDistrict.coordinates,
                            x: Number(e.target.value),
                          })
                        }
                        className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground">Y Position</label>
                      <input
                        type="number"
                        value={selectedDistrict.coordinates.y}
                        onChange={(e) =>
                          updateDistrictCoordinates(selectedDistrict, {
                            ...selectedDistrict.coordinates,
                            y: Number(e.target.value),
                          })
                        }
                        className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground">Width</label>
                      <input
                        type="number"
                        value={selectedDistrict.coordinates.width}
                        onChange={(e) =>
                          updateDistrictCoordinates(selectedDistrict, {
                            ...selectedDistrict.coordinates,
                            width: Number(e.target.value),
                          })
                        }
                        className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground">Height</label>
                      <input
                        type="number"
                        value={selectedDistrict.coordinates.height}
                        onChange={(e) =>
                          updateDistrictCoordinates(selectedDistrict, {
                            ...selectedDistrict.coordinates,
                            height: Number(e.target.value),
                          })
                        }
                        className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-foreground">Historical Color</label>
                      <input
                        type="color"
                        value={rgbaToHex(selectedDistrict.historicalColor)}
                        onChange={(e) =>
                          updateDistrictColor(selectedDistrict, hexToRgba(e.target.value, 0.5))
                        }
                        className="w-full h-10 p-1 bg-card text-foreground border border-primary rounded-lg"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2 text-foreground">Upload Map Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMapFileChange}
                        className="w-full p-2 bg-card text-foreground border border-primary rounded-lg mb-2"
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
                            className="mt-2 w-full px-4 py-2 bg-primary text-background rounded-lg shadow-lg flex items-center justify-center gap-2"
                          >
                            <Upload className="w-4 h-4" /> Upload Map Image
                          </motion.button>
                        </div>
                      )}
                      {selectedDistrict.mapImageUrl && !mapFile.previewUrl && (
                        <img
                          src={selectedDistrict.mapImageUrl}
                          alt="District Map"
                          className="mt-2 w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      <label className="block text-sm font-medium mt-4 text-foreground">Or Enter Map Image URL</label>
                      <input
                        type="text"
                        value={mapImageUrlInput}
                        onChange={(e) => setMapImageUrlInput(e.target.value)}
                        placeholder="https://example.com/muang-chiangmai-district-map.png"
                        className="w-full p-2 bg-card text-foreground border border-primary rounded-lg mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-1 lg:col-span-1 bg-card p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Editor</h2>
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
                        ? 'bg-primary text-background'
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    {district.thaiName}
                  </motion.button>
                ))}
              </div>

              <div className="p-4 bg-card rounded-lg shadow-lg mb-4">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Add New District</h3>
                <input
                  type="text"
                  placeholder="District Name"
                  value={newDistrict.name || ''}
                  onChange={(e) => setNewDistrict({ ...newDistrict, name: e.target.value })}
                  className="w-full p-2 mb-2 bg-card text-foreground border border-primary rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Thai Name"
                  value={newDistrict.thaiName || ''}
                  onChange={(e) => setNewDistrict({ ...newDistrict, thaiName: e.target.value })}
                  className="w-full p-2 mb-2 bg-card text-foreground border border-primary rounded-lg"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addNewDistrict}
                  className="w-full px-4 py-2 bg-success text-background rounded-lg shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add District
                </motion.button>
              </div>

              {selectedDistrict && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">Name</label>
                    <input
                      type="text"
                      value={selectedDistrict.name}
                      onChange={(e) => updateDistrictData(selectedDistrict, { name: e.target.value })}
                      className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Thai Name</label>
                    <input
                      type="text"
                      value={selectedDistrict.thaiName}
                      onChange={(e) => updateDistrictData(selectedDistrict, { thaiName: e.target.value })}
                      className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Cultural Significance</label>
                    <textarea
                      value={selectedDistrict.culturalSignificance || ''}
                      onChange={(e) =>
                        updateDistrictData(selectedDistrict, { culturalSignificance: e.target.value })
                      }
                      className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Visitor Tips</label>
                    <textarea
                      value={selectedDistrict.visitorTips || ''}
                      onChange={(e) =>
                        updateDistrictData(selectedDistrict, { visitorTips: e.target.value })
                      }
                      className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                    />
                  </div>
                  {selectedDistrict.collab && (
                    <div className="p-4 bg-accent rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-foreground">Collab Data</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-sm font-medium text-foreground">Enabled</label>
                        <input
                          type="checkbox"
                          checked={selectedDistrict.collab.isActive}
                          onChange={(e) =>
                            updateDistrictData(selectedDistrict, {
                              collab: { ...selectedDistrict.collab!, isActive: e.target.checked },
                            })
                          }
                          className="h-4 w-4"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground">Novel Title</label>
                        <input
                          type="text"
                          value={selectedDistrict.collab.novelTitle}
                          onChange={(e) =>
                            updateDistrictData(selectedDistrict, {
                              collab: { ...selectedDistrict.collab!, novelTitle: e.target.value },
                            })
                          }
                          className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground">Story Snippet</label>
                        <textarea
                          value={selectedDistrict.collab.storylineSnippet}
                          onChange={(e) =>
                            updateDistrictData(selectedDistrict, {
                              collab: {
                                ...selectedDistrict.collab!,
                                storylineSnippet: e.target.value,
                              },
                            })
                          }
                          className="w-full p-2 bg-card text-foreground border border-primary rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-1 lg:col-span-1 bg-card p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Media Editor</h2>
              <div className="flex border-b border-primary mb-4">
                {['image', 'video', 'text'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 font-medium ${
                      activeTab === tab
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              {selectedDistrict && (
                <div className="space-y-4">
                  {selectedDistrict.historicalPeriods.map((period, index) => (
                    <div key={period.era + index} className="p-4 bg-accent rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-foreground">{period.era}</h3>
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
                                  alt={media.description}
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
                                <p className="text-sm truncate overflow-hidden text-ellipsis">
                                  {media.description}
                                </p>
                                <p className="text-xs text-foreground/70 truncate overflow-hidden text-ellipsis">
                                  {media.url}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 bg-destructive text-background rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          ))}
                        {activeTab === 'text' && (
                          <div key="text-edit" className="p-2 bg-card rounded-lg">
                            <textarea
                              value={period.description || ''}
                              onChange={(e) => {
                                const updatedPeriods = [...selectedDistrict.historicalPeriods];
                                updatedPeriods[index] = { ...period, description: e.target.value };
                                updateDistrictData(selectedDistrict, { historicalPeriods: updatedPeriods });
                              }}
                              className="w-full h-24 p-2 bg-card text-foreground border border-primary rounded-lg resize-none whitespace-pre-wrap overflow-auto"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-foreground">
                            Upload New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} for {period.era}
                          </label>
                          <input
                            type="file"
                            accept={
                              activeTab === 'image'
                                ? 'image/*'
                                : activeTab === 'video'
                                ? 'video/*'
                                : '*'
                            }
                            onChange={handleMediaFileChange}
                            className="w-full p-2 bg-card text-foreground border border-primary rounded-lg mb-2"
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
                                className="mt-2 w-full px-4 py-2 bg-primary text-background rounded-lg shadow-lg flex items-center justify-center gap-2"
                              >
                                <Upload className="w-4 h-4" /> Upload Media
                              </motion.button>
                            </div>
                          )}
                          {activeTab === 'image' && (
                            <>
                              <label className="block text-sm font-medium mt-4 text-foreground">
                                Or Enter Image URL
                              </label>
                              <input
                                type="text"
                                value={mediaImageUrlInput}
                                onChange={(e) => setMediaImageUrlInput(e.target.value)}
                                placeholder="https://example.com/muang-chiangmai-district-map.png"
                                className="w-full p-2 bg-card text-foreground border border-primary rounded-lg mt-2"
                              />
                            </>
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