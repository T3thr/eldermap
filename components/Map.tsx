import { District, HistoricalPeriod } from "@/lib/districts";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, EyeOff, Grid, MapPin,Home } from "lucide-react";
import { throttle } from "lodash";

interface MapProps {
  districts: District[];
  selectedDistricts: District[];
  onDistrictToggle: (district: District) => void;
  selectedPeriod: HistoricalPeriod | null;
  isGlobalView?: boolean;
  onReset?: () => void;
}

export default function Map({
  districts,
  selectedDistricts,
  onDistrictToggle,
  selectedPeriod,
  isGlobalView = false,
  onReset
}: MapProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [mapScale, setMapScale] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showCenterDot, setShowCenterDot] = useState(true);
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const mapRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMapScale(1);
    setMapPosition({ x: 0, y: 0 });
  }, [selectedDistricts]);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX - mapPosition.x, y: clientY - mapPosition.y });
  }, [mapPosition]);

  const handleMouseMove = useCallback(
    throttle((e: React.MouseEvent | React.TouchEvent) => {
      if (isDragging) {
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        setMapPosition({
          x: clientX - dragStart.x,
          y: clientY - dragStart.y,
        });
      }
    }, 16),
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setTouchDistance(null);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const scaleFactor = 0.15;
    setMapScale((prev) => Math.max(0.5, Math.min(3.5, prev + (e.deltaY < 0 ? scaleFactor : -scaleFactor))));
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        handleMouseMove(e);
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        if (touchDistance === null) {
          setTouchDistance(distance);
        } else {
          const scale = distance / touchDistance;
          setMapScale((prev) => Math.max(0.5, Math.min(3.5, prev * scale)));
          setTouchDistance(distance);
        }
      }
    },
    [touchDistance, isDragging, handleMouseMove]
  );

  const handleReset = useCallback(() => {
    setMapScale(1);
    setMapPosition({ x: 0, y: 0 });
    if (onReset) onReset(); // Call onReset when map is reset
  }, [onReset]);
  
  const getDistrictColor = (district: District) =>
    isGlobalView && selectedPeriod
      ? district.historicalPeriods.find((p) => p.era === selectedPeriod.era)?.color || district.historicalColor
      : selectedDistricts.some((d) => d.id === district.id) && selectedPeriod
      ? selectedPeriod.color
      : district.historicalColor;

  const getCollabColor = (district: District) =>
    district.collab?.isActive ? "rgba(255, 215, 0, 0.5)" : getDistrictColor(district);

  const viewBox = "0 0 600 400"; // Dynamic sizing could be added based on province data

  return (
    <div
      className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[75vh] rounded-xl overflow-hidden bg-card/50 border border-glass-border shadow-md glass-effect"
      style={{ touchAction: "none" }}
    >
      <div className="absolute top-4 right-4 z-20 bg-card/80 rounded-full p-2 flex flex-col gap-2 shadow-md">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setMapScale((prev) => Math.min(prev + 0.25, 3.5))}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50"
          aria-label="Zoom in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>

        <motion.button
          onClick={handleReset}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/50"
          aria-label="Reset map"
        >
          <Home className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setMapScale((prev) => Math.max(prev - 0.25, 0.5))}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50"
          aria-label="Zoom out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowGrid((prev) => !prev)}
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            showGrid ? "bg-primary/30 text-primary" : "bg-card text-foreground/70"
          } hover:bg-primary/40 border border-primary/50`}
          aria-label={showGrid ? "Hide grid" : "Show grid"}
        >
          <Grid className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCenterDot((prev) => !prev)}
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            showCenterDot ? "bg-secondary/30 text-secondary" : "bg-card text-foreground/70"
          } hover:bg-secondary/40 border border-secondary/50`}
          aria-label={showCenterDot ? "Hide center dot" : "Show center dot"}
        >
          <MapPin className="w-5 h-5" />
        </motion.button>
      </div>

      {showLegend && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 z-20 bg-card/80 rounded-xl p-4 shadow-md max-w-xs w-full sm:max-w-sm glass-effect"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-thai font-medium text-foreground/70">Temporal Legend</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLegend(false)}
              className="text-secondary"
              aria-label="Hide legend"
            >
              <EyeOff className="w-5 h-5" />
            </motion.button>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {isGlobalView && selectedPeriod ? (
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: selectedPeriod.color }} />
                <span className="text-xs font-thai text-foreground/80">{selectedPeriod.era}</span>
              </div>
            ) : (
              districts.slice(0, 6).map((district) => (
                <div key={district.id} className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: getCollabColor(district) }} />
                  <span className="text-xs font-thai text-foreground/80 truncate max-w-[100px] sm:max-w-[120px]">
                    {district.name}
                  </span>
                </div>
              ))
            )}
            {districts.length > 6 && <span className="text-xs text-foreground/70">+{districts.length - 6} more</span>}
          </div>
        </motion.div>
      )}
      {!showLegend && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLegend(true)}
          className="absolute bottom-4 left-4 z-20 bg-card/80 rounded-full p-2 text-primary border border-primary/50"
          aria-label="Show legend"
        >
          <Eye className="w-5 h-5" />
        </motion.button>
      )}

      {hoveredDistrict && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-4 z-20 bg-card/80 rounded-lg p-3 shadow-md max-w-xs w-full glass-effect"
        >
          <span className="text-sm font-thai font-medium text-foreground">{hoveredDistrict}</span>
          {districts.find((d) => d.name === hoveredDistrict)?.collab?.isActive && (
            <div className="mt-1 text-xs text-yellow-500">
              Collab: {districts.find((d) => d.name === hoveredDistrict)?.collab?.novelTitle}
            </div>
          )}
        </motion.div>
      )}

      <div
        className="w-full h-full cursor-grab touch-pan-x touch-pan-y select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <motion.div
          animate={{ x: mapPosition.x, y: mapPosition.y, scale: mapScale }}
          transition={{ duration: 0.15 }}
          className="w-full h-full flex items-center justify-center"
        >
          <svg
            ref={mapRef}
            viewBox={viewBox}
            className="w-full h-full max-w-full max-h-full"
            preserveAspectRatio="xMidYMid meet"
            role="region"
            aria-label={`Map of ${districts.length} districts`}
          >
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
            {showCenterDot && (
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
              {districts.map((district) => {
                const isSelected = selectedDistricts.some((d) => d.id === district.id);
                const { x, y, width, height } = district.coordinates;

                return (
                  <motion.g
                    key={district.id}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setHoveredDistrict(district.name)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    onClick={() => onDistrictToggle(district)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      onDistrictToggle(district);
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onDistrictToggle(district);
                      }
                    }}
                    role="button"
                    aria-label={`Toggle ${district.name}`}
                  >
                    {district.mapImageUrl ? (
                      <image
                        href={district.mapImageUrl}
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        preserveAspectRatio="xMidYMid slice"
                        opacity={0.8}
                        style={{
                          filter: isSelected ? "url(#glow)" : "",
                          fill: getCollabColor(district),
                        }}
                        className="transition-all duration-300"
                        aria-label={`Map of ${district.name}`}
                      />
                    ) : (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={getCollabColor(district)}
                        stroke="var(--foreground)"
                        strokeWidth={isSelected ? 3 : 1.5}
                        strokeOpacity={isSelected ? 0.9 : 0.4}
                        className="transition-all duration-300"
                        style={{ filter: isSelected ? "url(#glow)" : "" }}
                      />
                    )}
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fill={isColorDark(getCollabColor(district)) ? "#fff" : "#333"}
                      fontSize="clamp(10px, 2vw, 14px)"
                      fontWeight={isSelected ? "bold" : "normal"}
                      className="font-thai select-none"
                      opacity={isSelected || hoveredDistrict === district.name ? 1 : 0.8}
                    >
                      {district.name}
                    </text>
                  </motion.g>
                );
              })}
            </g>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

function isColorDark(color: string): boolean {
  let r = 0, g = 0, b = 0;
  if (color.startsWith("#")) {
    if (color.length === 4) {
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    } else {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    }
  } else if (color.startsWith("rgb")) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}