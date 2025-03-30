"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { fadeIn, slideIn } from "@/lib/motion-utils"

export function CTASection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <motion.div
      className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white relative overflow-hidden"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      {/* Decorative Elements */}
      <motion.div
        className="absolute top-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full"
        variants={slideIn("down", "spring", 0.2, 1)}
        style={{ transform: "translate(-50%, -50%)" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-60 h-60 bg-white opacity-5 rounded-full"
        variants={slideIn("up", "spring", 0.3, 1)}
        style={{ transform: "translate(30%, 30%)" }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div className="max-w-3xl mx-auto text-center" variants={fadeIn("up", 0.2)}>
          <motion.h2 className="text-3xl md:text-4xl font-bold mb-6" variants={fadeIn("up", 0.3)}>
            Ready to Transform Your Learning Experience?
          </motion.h2>

          <motion.p className="text-lg md:text-xl mb-8 text-green-100" variants={fadeIn("up", 0.4)}>
            Join thousands of students and professionals who are already using NoteUS to enhance their learning and
            productivity.
          </motion.p>

          <motion.div variants={fadeIn("up", 0.5)}>
            <Button
              onClick={onGetStarted}
              className="bg-white text-green-700 hover:bg-green-50 px-8 py-3 rounded-lg text-lg font-medium"
            >
              Get Started Now
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default CTASection