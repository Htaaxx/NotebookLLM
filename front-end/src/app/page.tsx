"use client"

import { useState } from "react"
import AuthUI from "@/components/auth-ui"
import { NavBar } from "@/components/home/navbar"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { AppScreenshotSection } from "@/components/home/app-screenshot-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { CTASection } from "@/components/home/cta-section"
import { IntegrationSection } from "@/components/home/integration-section"
import { Footer } from "@/components/home/footer"

export default function Home() {
  const [showAuth, setShowAuth] = useState(false)

  const handleNavClick = () => {
    setShowAuth(true)
  }

  return (
    <main className="min-h-screen relative bg-white">
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuth(false)}></div>
          <div className="z-10 w-full max-w-md">
            <AuthUI />
            <button
              onClick={() => setShowAuth(false)}
              className="mt-4 text-white hover:underline text-sm mx-auto block"
            >
              Return to homepage
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

