"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import AuthUI from "@/components/auth-ui"
import { NavBar } from "@/components/home/navbar"
import { NavbarContainer } from "@/components/home/navbar-container"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { AppScreenshotSection } from "@/components/home/app-screenshot-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { CTASection } from "@/components/home/cta-section"
import { Footer } from "@/components/home/footer"
import { GreenBlock } from "@/components/home/green-block"
import { staggerContainer } from "@/lib/motion-utils"

export default function Home() {
  const [showAuth, setShowAuth] = useState(false)

  const handleNavClick = () => {
    setShowAuth(true)
  }

  return (
    <div className="min-h-screen bg-[#F2F5DA] flex flex-col">
      <div className="relative flex-grow overflow-hidden bg-[#F2F5DA] px-4 md:px-[90px] pt-[20px] md:pt-[40px]">
        {/* Navbar */}
        <div className="w-full md:w-[90%] mx-auto">
          <GreenBlock>
            <NavbarContainer>
              <NavBar onNavClick={handleNavClick} onSignUp={() => setShowAuth(true)} onSignIn={() => setShowAuth(true)} />
            </NavbarContainer>
            <HeroSection onGetStarted={() => setShowAuth(true)} onSeeDemo={() => setShowAuth(false)} />
          </GreenBlock>

        </div>

        <motion.main
          className="relative overflow-hidden mt-0"
          initial="hidden"
          animate="show"
          variants={staggerContainer(0.2, 0.1)}
        >
          <FeaturesSection />

          <AppScreenshotSection />

          <TestimonialsSection />

          <CTASection onGetStarted={() => setShowAuth(true)} />
        </motion.main>
      </div>

      {/* Footer - outside the main content div to ensure full width */}
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
    </div>
  )
}
