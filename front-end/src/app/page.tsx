"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import AuthUI from "@/components/auth-ui"
import { NavBar } from "@/components/home/navbar"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { AppScreenshotSection } from "@/components/home/app-screenshot-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { CTASection } from "@/components/home/cta-section"
import { IntegrationSection } from "@/components/home/integration-section"
import { Footer } from "@/components/home/footer"
import { staggerContainer } from "@/lib/motion-utils"

export default function Home() {
  const [showAuth, setShowAuth] = useState(false)

  const handleNavClick = () => {
    setShowAuth(true)
  }

  return (
    <motion.main
      className="min-h-screen relative bg-white overflow-hidden"
      initial="hidden"
      animate="show"
      variants={staggerContainer(0.2, 0.1)}
    >
      <NavBar onNavClick={handleNavClick} onSignUp={() => setShowAuth(true)} onSignIn={() => setShowAuth(true)} />

      <HeroSection onGetStarted={() => setShowAuth(true)} onSeeDemo={() => setShowAuth(true)} />

      <FeaturesSection />

      <AppScreenshotSection />

      <TestimonialsSection />

      <CTASection onGetStarted={() => setShowAuth(true)} />

      <IntegrationSection />

      <Footer onNavClick={handleNavClick} />

      {/* Auth Modal Overlay */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAuth(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="z-10 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <AuthUI />
            <button
              onClick={() => setShowAuth(false)}
              className="mt-4 text-white hover:underline text-sm mx-auto block"
            >
              Return to homepage
            </button>
          </motion.div>
        </div>
      )}
    </motion.main>
  )
}

