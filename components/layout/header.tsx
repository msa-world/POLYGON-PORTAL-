'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, Layers, X, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BaseLayerMenu } from '@/components/map/base-layer-menu'
import { EditToolsMenu } from '@/components/map/edit-tools-menu'

interface HeaderProps {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export function Header({ sidebarOpen, toggleSidebar }: HeaderProps) {
  const [showBaseMenu, setShowBaseMenu] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const glassBtn =
    'bg-white/20 backdrop-blur-md border border-white/20 shadow-sm';

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-[2001] h-16"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="h-full border-b rounded-b-3xl shadow-lg bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 backdrop-blur-xl border-white/10"
      >
        <div className="flex items-center justify-between h-full px-6 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-white bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/20 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 rounded-xl"
            style={{ marginRight: 16 }}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center min-w-0">
            <div
              className="bg-white/10 backdrop-blur-md rounded-xl px-2 py-1 shadow mr-2 flex items-center border border-white/10"
              style={{ minWidth: 0 }}
            >
              <a href="https://geoinformaticservices.com/" target="_blank" rel="noopener noreferrer">
                <img
                  src="/geoinformatic-logo.png"
                  alt="Geo Informatic Logo"
                  className="h-10 w-auto rounded"
                  style={{ minWidth: 0 }}
                />
              </a>
            </div>
          </div>

          <motion.h1
            className="absolute left-[40%] top-[42%] transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-white tracking-widest whitespace-nowrap hidden md:block text-shadow-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            GEOINFORMATIC PORTAL
          </motion.h1>

          <div className="flex items-center space-x-3 ml-auto">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditMenu(!showEditMenu)}
                className="text-white bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/20 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 rounded-xl"
              >
                <Edit3 className="h-5 w-5" />
              </Button>
              <EditToolsMenu open={showEditMenu} onClose={() => setShowEditMenu(false)} />
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBaseMenu(!showBaseMenu)}
                className="text-white bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/20 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 rounded-xl w-12 h-12"
              >
                <Layers className="h-6 w-6" />
              </Button>
              <BaseLayerMenu open={showBaseMenu} onClose={() => setShowBaseMenu(false)} />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
