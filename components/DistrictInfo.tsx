// components/DistrictInfo.tsx
"use client"; // Required for client-side interactivity in Next.js 15

import { District, HistoricalPeriod } from "@/lib/districts";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { BookOpen, X, ChevronDown } from "lucide-react"; // Example icons (install lucide-react)

interface DistrictInfoProps {
  districts: District[];
  period: HistoricalPeriod;
  isGlobalView?: boolean;
  provinceName?: string;
}

export default function DistrictInfo({
  districts,
  period,
  isGlobalView = false,
  provinceName = "",
}: DistrictInfoProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "events" | "landmarks" | "media"
  >("overview");
  const [isCollabMode, setIsCollabMode] = useState(false);

  const hasCollab = districts.length === 1 && districts[0].collab?.isActive;
  const collabData = districts[0]?.collab;

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "events", name: "Events", count: period.events.length },
    { id: "landmarks", name: "Landmarks", count: period.landmarks.length },
    { id: "media", name: "Gallery", count: period.media.length },
  ];

  const title = isGlobalView
    ? `${provinceName} Province - ${period.era}`
    : districts.length === 1
    ? `${districts[0].name} (${districts[0].thaiName})`
    : `${districts.length} Districts Selected`;

  const toggleCollab = useCallback(() => {
    setIsCollabMode((prev) => !prev);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative glass-effect p-6 md:p-8 rounded-2xl max-w-5xl mx-auto"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <motion.div
          className="flex items-center gap-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div
            className="w-10 h-10 rounded-full border-2 border-glass-border shadow-lg"
            style={{ backgroundColor: period.color }}
          />
          <div>
            <span className="text-sm font-thai text-secondary tracking-wide">
              {period.era}
            </span>
            <h2 className="text-3xl md:text-4xl font-thai font-extrabold text-primary text-shadow">
              {title}
            </h2>
          </div>
        </motion.div>

        {/* Tabs with Collab Toggle */}
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <nav className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {tabs
              .filter(
                (tab) =>
                  tab.id === "overview" ||
                  (tab.count !== undefined && tab.count > 0)
              )
              .map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-primary text-foreground shadow-glow"
                      : "bg-glass-bg text-foreground/80 hover:bg-primary/20"
                  }`}
                >
                  {tab.name} {tab.count ? `(${tab.count})` : ""}
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="tab-indicator"
                      className="absolute inset-0 rounded-full bg-primary/20 -z-10"
                    />
                  )}
                </motion.button>
              ))}
          </nav>

          {hasCollab && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCollab}
              className="self-end flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary hover:bg-secondary/40 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">
                {isCollabMode ? "Original View" : "Story Mode"}
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${isCollabMode}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          {activeTab === "overview" && (
            <div className="space-y-6">
              <motion.p
                className="text-foreground/90 text-base leading-relaxed bg-glass-bg p-6 rounded-xl shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {isCollabMode && collabData
                  ? collabData.storylineSnippet
                  : isGlobalView
                  ? `During the ${period.era} era, ${provinceName} experienced significant developments across its districts.`
                  : districts.length === 1
                  ? period.description
                  : "Select a single district for details."}
              </motion.p>
              {!isGlobalView && districts.length === 1 && !isCollabMode && (
                <>
                  <SectionCard
                    title="Cultural Significance"
                    content={districts[0].culturalSignificance || "No cultural significance data available."}
                  />
                  <SectionCard
                    title="Visitor Tips"
                    content={districts[0].visitorTips || "No visitor tips available."}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === "events" && period.events.length > 0 && (
            <div className="grid gap-4">
              {(isCollabMode && collabData?.characters
                ? collabData.characters
                : period.events
              ).map((item, index) => (
                <EventCard key={index} index={index} content={item} />
              ))}
            </div>
          )}

          {activeTab === "landmarks" && period.landmarks.length > 0 && (
            <div className="grid gap-4">
              {(isCollabMode && collabData?.relatedLandmarks
                ? collabData.relatedLandmarks
                : period.landmarks
              ).map((landmark, index) => (
                <EventCard key={index} index={index} content={landmark} />
              ))}
            </div>
          )}

          {activeTab === "media" && period.media.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(isCollabMode && collabData?.media?.length
                ? collabData.media
                : period.media
              ).map((item, index) => (
                <MediaCard key={index} item={item} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// Reusable Components
const SectionCard = ({ title, content }: { title: string; content: string }) => (
  <motion.div
    className="bg-glass-bg p-6 rounded-xl shadow-md border border-glass-border"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <h4 className="text-xl font-thai font-semibold text-primary mb-3">
      {title}
    </h4>
    <p className="text-foreground/80 text-sm">{content}</p>
  </motion.div>
);

const EventCard = ({ index, content }: { index: number; content: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-glass-bg p-6 rounded-xl shadow-md border border-glass-border flex items-start"
  >
    <span className="w-10 h-10 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center mr-4 text-primary font-bold">
      {index + 1}
    </span>
    <p className="text-foreground/90 text-sm">{content}</p>
  </motion.div>
);

const MediaCard = ({
  item,
  index,
}: {
  item: { type: string; url: string; description?: string };
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.03 }}
    className="bg-glass-bg rounded-xl overflow-hidden shadow-lg border border-glass-border"
  >
    <div className="relative aspect-video">
      {item.type === "image" ? (
        <img
          src={item.url}
          alt={item.description || "Media content"}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <iframe
          src={item.url}
          title={item.description || "Media content"}
          className="w-full h-full"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p className="text-white text-sm">{item.description || "No description available."}</p>
      </div>
    </div>
  </motion.div>
);