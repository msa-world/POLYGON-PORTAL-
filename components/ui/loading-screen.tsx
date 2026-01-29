"use client"

import { motion, AnimatePresence, easeInOut, easeOut } from "framer-motion"
import { useState, useEffect } from "react"

// Main App component to demonstrate the loading screen
export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  // Reset progress when loading starts
  useEffect(() => {
    if (isLoading) {
      setProgress(0)
    }
  }, [isLoading])

  // Hide loading when progress completes (wait a tiny bit for transition)
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setIsLoading(false), 500)
      return () => clearTimeout(timer)
    }
  }, [progress])

  return (
    <div className="relative w-full h-screen bg-slate-200 flex items-center justify-center">
      <AnimatePresence>
        {isLoading && <LoadingScreen setProgress={setProgress} progress={progress} />}
      </AnimatePresence>
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full bg-slate-200"
        >
          {/* Content loads here - no welcome message */}
        </motion.div>
      )}
    </div>
  )
}

// Update LoadingScreen to accept setProgress and progress as props
export function LoadingScreen({ setProgress, progress }: { setProgress?: React.Dispatch<React.SetStateAction<number>>, progress?: number }) {
  const [internalProgress, setInternalProgress] = useState(progress || 0);
  const effectiveProgress = progress ?? internalProgress;
  const [loadingText, setLoadingText] = useState("Initializing LIMS Portal...");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showBgAnimation, setShowBgAnimation] = useState(false);

  useEffect(() => {
    const messages = [
      "Initializing LIMS Portal...",
      "Loading Geographic Information Database...",
      "Connecting to Survey Data Networks...",
      "Synchronizing Agricultural Records...",
      "Calibrating Land Measurement Tools...",
      "Preparing Geospatial Analytics...",
      "Finalizing System Integration...",
    ];
    let msgIdx = 0;
    setLoadingText(messages[msgIdx]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setLoadingText(messages[msgIdx]);
      setCurrentMessageIndex(msgIdx);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  // Show background animation after logo is shown for 1.2s
  useEffect(() => {
    const timer = setTimeout(() => setShowBgAnimation(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updateFn = (prev: number) => {
        if (typeof prev !== "number" || isNaN(prev)) return 0;
        if (prev >= 100) return 100;
        return prev + Math.random() * 1.5 + 0.5;
      };

      if (setProgress) {
        setProgress(updateFn);
      } else {
        setInternalProgress(updateFn);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [setProgress]);

  // Store random positions in state after mount
  const [dataPoints, setDataPoints] = useState<{ x: number; y: number }[]>([]);
  useEffect(() => {
    if (showBgAnimation && typeof window !== "undefined") {
      const points = Array.from({ length: 8 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }));
      setDataPoints(points);
    }
  }, [showBgAnimation]);

  // Variants for container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 1.5,
        ease: easeInOut, // use imported function
      },
    },
  };

  // Variants for child element animations
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: easeOut } }, // use imported function
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[3000] bg-gradient-to-br from-slate-900 via-green-950/50 to-slate-900 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Show logo first, then background animation */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[400px]">
        <motion.div className="flex flex-col items-center justify-center mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: easeOut }}
          whileHover={{ scale: 1.015 }}>
          <motion.img
            src="/geoinformatic-logo.png"
            alt="LIMS - Land Information and Management System"
            className="w-56 h-56 rounded-full shadow-2xl object-cover border-4 border-green-400/20 bg-white/8 backdrop-blur-sm mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: easeOut }}
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/224x224/16A34A/FFFFFF?text=LIMS";
            }}
          />
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-green-500 tracking-widest mt-4 mb-2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut }}
          >
            LIMS-COE
          </motion.h2>
        </motion.div>
        {/* Loading sentences */}
        <motion.div className="mt-4 h-8 flex items-center justify-center">
          <motion.span
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-green-300/80 text-lg font-medium tracking-wide text-center"
            transition={{ duration: 0.4 }}
          >
            {loadingText}
          </motion.span>
        </motion.div>
        {/* Thicker loading bar with default 85% width */}
        <div className="w-48 mt-6 mx-auto">
          <div className="flex justify-between text-xs text-green-300/70 mb-1">
            <span>Loading...</span>
            <span>{isNaN(effectiveProgress) ? 85 : Math.max(Math.floor(effectiveProgress), 85)}%</span>
          </div>
          <div className="h-2 bg-slate-800/40 rounded-full overflow-hidden backdrop-blur-sm border border-green-500/15">
            <motion.div
              className="h-full bg-gradient-to-r from-green-600 to-green-400 relative"
              initial={{ width: "85%" }}
              animate={{ width: `${Math.max(Math.min(effectiveProgress, 100), 85)}%` }}
              transition={{ duration: 0.6, ease: easeOut }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/25 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </div>
      {/* Show background animation after logo */}
      {showBgAnimation && (
        <div className="absolute inset-0 z-0 w-full h-full">
          {/* Topographical contour lines */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`contour-${i}`}
              className="absolute border border-green-500/15 rounded-full"
              style={{
                width: 250 + i * 180,
                height: 180 + i * 120,
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%)`,
                borderStyle: i % 3 === 0 ? "solid" : "dashed",
                borderWidth: i % 2 === 0 ? "1px" : "2px",
              }}
              animate={{
                opacity: [0.08, 0.25, 0.08],
                scale: [1, 1.015, 1],
                rotate: [0, 2, 0],
              }}
              transition={{
                duration: 12 + i * 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: easeInOut,
                delay: i * 0.7,
              }}
            />
          ))}

          {/* Agricultural field boundaries */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`field-${i}`}
              className="absolute border border-green-400/12 rounded-sm"
              style={{
                width: 100 + i * 35,
                height: 70 + i * 20,
                left: `${15 + (i % 4) * 22}%`,
                top: `${12 + Math.floor(i / 4) * 22}%`,
              }}
              animate={{
                borderColor: ["rgba(34, 197, 94, 0.12)", "rgba(34, 197, 94, 0.25)", "rgba(34, 197, 94, 0.12)"],
                scale: [1, 1.008, 1],
              }}
              transition={{
                duration: 6 + i * 0.8,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.4,
              }}
            />
          ))}

          {/* GPS Survey markers with crosshairs */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`marker-${i}`}
              className="absolute w-3 h-3 bg-green-400/25 rounded-full"
              style={{
                left: `${12 + (i % 5) * 18}%`,
                top: `${18 + Math.floor(i / 5) * 18}%`,
              }}
              animate={{
                scale: [0.7, 1.8, 0.7],
                opacity: [0.25, 0.7, 0.25],
                boxShadow: [
                  "0 0 6px rgba(34, 197, 94, 0.25)",
                  "0 0 18px rgba(34, 197, 94, 0.5)",
                  "0 0 6px rgba(34, 197, 94, 0.25)",
                ],
              }}
              transition={{
                duration: 4 + i * 0.3,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-0.5 bg-green-400/15 absolute"></div>
                <div className="w-0.5 h-6 bg-green-400/15 absolute"></div>
              </div>
            </motion.div>
          ))}

          {/* Data flow streams */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`dataflow-${i}`}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-green-400/18 to-transparent"
              style={{
                width: "250px",
                left: `${8 + i * 12}%`,
                top: `${25 + i * 8}%`,
                transform: `rotate(${i * 25}deg)`,
              }}
              animate={{
                x: [-60, 60, -60],
                opacity: [0, 0.5, 0],
                scaleX: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 8 + i * 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 1,
              }}
            />
          ))}

          {/* Enhanced coordinate grid */}
          <motion.div
            className="absolute inset-0 opacity-8"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 80,
              repeat: Number.POSITIVE_INFINITY,
            }}
            style={{
              backgroundImage: `
                linear-gradient(rgba(34, 197, 94, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34, 197, 94, 0.15) 1px, transparent 1px),
                linear-gradient(rgba(34, 197, 94, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34, 197, 94, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px, 80px 80px, 25px 25px, 25px 25px",
            }}
          />

          {/* Floating data points */}
          {dataPoints.map((point, i) => (
            <motion.div
              key={`datapoint-${i}`}
              initial={{
                opacity: 0,
                scale: 0,
                y: point.y,
                x: point.x,
              }}
              animate={{
                opacity: [0, 0.35, 0],
                scale: [0, 1.2, 0],
                y: [point.y, Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800)],
                x: [point.x, Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200)],
              }}
              transition={{
                duration: Math.random() * 12 + 18,
                delay: Math.random() * 10,
                repeat: Number.POSITIVE_INFINITY,
              }}
              className="absolute rounded-sm bg-green-400/18 border border-green-400/25"
              style={{
                width: 5,
                height: 5,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
