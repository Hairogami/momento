"use client"
import { motion } from "framer-motion"

export default function SpotlightBackground({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Spotlight 1 — top left, warm white */}
      <motion.div
        initial={{ x: "-50%", y: "-50%" }}
        animate={{
          x: ["-50%", "-30%", "-70%", "-50%"],
          y: ["-50%", "-70%", "-30%", "-50%"],
        }}
        transition={{ duration: 12, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
        style={{
          position: "absolute",
          top: "30%", left: "30%",
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Spotlight 2 — bottom, cooler */}
      <motion.div
        initial={{ x: "0%", y: "0%" }}
        animate={{
          x: ["0%", "25%", "-25%", "0%"],
          y: ["0%", "30%", "10%", "0%"],
        }}
        transition={{ duration: 15, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 3 }}
        style={{
          position: "absolute",
          top: "65%", left: "55%",
          width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(200,150,255,0.25) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Spotlight 3 — top right, pink */}
      <motion.div
        initial={{ x: "0%", y: "0%" }}
        animate={{
          x: ["0%", "-30%", "15%", "0%"],
          y: ["0%", "-20%", "20%", "0%"],
        }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 5 }}
        style={{
          position: "absolute",
          top: "5%", left: "65%",
          width: 450, height: 450,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,150,180,0.28) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  )
}
