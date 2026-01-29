'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MousePointer2, Map as MapIcon, Hexagon, Layers, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomePopupProps {
    onStartDrawing: () => void
    onDismiss: () => void
}

export function WelcomePopup({ onStartDrawing, onDismiss }: WelcomePopupProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Show after a short delay
        const timer = setTimeout(() => setIsVisible(true), 1200)
        return () => clearTimeout(timer)
    }, [])

    const handleStart = () => {
        setIsVisible(false)
        setTimeout(onStartDrawing, 400)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="relative w-full max-w-[380px] overflow-hidden glass-card rounded-[2.2rem] shadow-2xl border border-white/20 bg-white/70 backdrop-blur-2xl"
                    >
                        {/* Geometric Background Shapes */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                            <motion.div
                                animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-24 -left-24 w-64 h-64 border-2 border-blue-500 rounded-[30%] rotate-12"
                            />
                            <motion.div
                                animate={{
                                    rotate: [0, -360],
                                    scale: [1, 1.2, 1],
                                    x: [0, 20, 0],
                                    y: [0, -20, 0]
                                }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl"
                            />
                        </div>

                        <div className="relative p-6 sm:p-7 flex flex-col items-center text-center">
                            {/* Close Button */}
                            <button
                                onClick={() => setIsVisible(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>

                            {/* Icon Area - Enhanced */}
                            <div className="mb-5 relative">
                                <div className="w-18 h-18 sm:w-22 sm:h-22 flex items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-200/40 ring-4 ring-blue-50/50">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                            rotate: [0, 3, -3, 0]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    >
                                        <MapIcon className="w-9 h-9 text-white" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Text Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mb-1.5 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-900">
                                    Geo Informatic Live Portal
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 mb-5 leading-relaxed max-w-[320px] mx-auto">
                                    Empowering spatial analysis. Mark landmarks and define boundaries with professional precision.
                                </p>

                                {/* Features List */}
                                <div className="grid grid-cols-1 gap-2 mb-7 text-left max-w-[260px] mx-auto">
                                    {[
                                        { title: "Define Boundaries", icon: Hexagon },
                                        { title: "Mark Landmarks", icon: MapIcon },
                                        { title: "Track Encroachments", icon: Layers }
                                    ].map((feat, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm text-gray-700 font-semibold">
                                            <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                                                <feat.icon className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                            {feat.title}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Action Buttons with Interactive Cursor */}
                            <div className="relative w-full">
                                <motion.div
                                    className="flex flex-col sm:flex-row gap-3 w-full"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <motion.div
                                        className="flex-1 relative"
                                        animate={{
                                            scale: [1, 1.02, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Button
                                            onClick={handleStart}
                                            className="relative w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-base shadow-lg shadow-blue-200/50 border-0 transition-all hover:scale-[1.02] active:scale-[0.95] overflow-visible"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Try Now

                                            {/* INTERACTIVE CURSOR ANIMATION - BOLDER & BIGGER & CENTERED */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8, x: 100, y: 100 }}
                                                    animate={{
                                                        opacity: [0, 1, 1, 1, 0],
                                                        x: [100, 0, 0, 0, 100],
                                                        y: [100, 0, 0, 0, 100],
                                                        scale: [0.8, 1.3, 1, 1.3, 0.8]
                                                    }}
                                                    transition={{
                                                        duration: 3.5,
                                                        repeat: Infinity,
                                                        times: [0, 0.3, 0.4, 0.6, 1],
                                                        ease: "easeInOut",
                                                        repeatDelay: 1
                                                    }}
                                                    className="relative"
                                                >
                                                    <div className="relative flex items-center justify-center">
                                                        {/* Cursor Glow Effect - Enhanced */}
                                                        <motion.div
                                                            animate={{
                                                                opacity: [0.3, 0.8, 0.3],
                                                                scale: [1, 1.5, 1],
                                                                filter: ["blur(12px)", "blur(20px)", "blur(12px)"]
                                                            }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                            className="absolute inset-0 bg-blue-400/40 rounded-full"
                                                        />

                                                        <div className="relative">
                                                            <MousePointer2
                                                                className="w-14 h-14 text-white fill-black stroke-white filter drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                                                                strokeWidth={3}
                                                            />

                                                            {/* TRY NOW LABEL ON CURSOR */}
                                                            <motion.div
                                                                animate={{
                                                                    y: [0, -5, 0],
                                                                }}
                                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-600 rounded-full border border-white/30 shadow-lg"
                                                            >
                                                                <span className="text-[10px] font-black text-white whitespace-nowrap">TRY NOW</span>
                                                            </motion.div>
                                                        </div>

                                                        {/* Enhanced Click Impact Effect - Multiple Rings */}
                                                        {[0, 0.2, 0.4].map((delay, i) => (
                                                            <motion.div
                                                                key={i}
                                                                animate={{
                                                                    scale: [0, 2.5, 0],
                                                                    opacity: [0, 0.6, 0]
                                                                }}
                                                                transition={{
                                                                    duration: 0.8,
                                                                    repeat: Infinity,
                                                                    repeatDelay: 2.7,
                                                                    delay: 1.1 + delay
                                                                }}
                                                                className="absolute inset-0 border-2 border-blue-300 rounded-full blur-[1px]"
                                                            />
                                                        ))}

                                                        {/* Inner Core Ripple */}
                                                        <motion.div
                                                            animate={{
                                                                scale: [0, 1.2, 0],
                                                                opacity: [0, 1, 0]
                                                            }}
                                                            transition={{
                                                                duration: 0.5,
                                                                repeat: Infinity,
                                                                repeatDelay: 3,
                                                                delay: 1.1
                                                            }}
                                                            className="absolute inset-0 bg-blue-500/50 rounded-full blur-md"
                                                        />
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </Button>
                                    </motion.div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsVisible(false)}
                                        className="h-12 rounded-xl border-2 border-gray-200 bg-white/40 text-gray-700 font-semibold text-base hover:bg-white/80 transition-all"
                                    >
                                        Later
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Compact How-to Visual */}
                            <div className="mt-5 pt-4 border-t border-gray-100 w-full flex items-center justify-center gap-3">
                                <div className="flex flex-col items-center gap-1 min-w-[50px]">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shadow-inner">
                                        <MousePointer2 className="w-3.5 h-3.5 text-blue-600" />
                                    </div>
                                    <span className="text-[9px] uppercase tracking-wider font-black text-gray-800">Click</span>
                                </div>
                                <div className="w-4 h-[1px] bg-gray-200 mt-[-16px]" />
                                <div className="flex flex-col items-center gap-1 min-w-[50px]">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shadow-inner">
                                        <Hexagon className="w-3.5 h-3.5 text-indigo-600" />
                                    </div>
                                    <span className="text-[9px] uppercase tracking-wider font-black text-gray-800">Shape</span>
                                </div>
                                <div className="w-4 h-[1px] bg-gray-200 mt-[-16px]" />
                                <div className="flex flex-col items-center gap-1 min-w-[50px]">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shadow-inner">
                                        <Layers className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <span className="text-[9px] uppercase tracking-wider font-black text-gray-800">Save</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

