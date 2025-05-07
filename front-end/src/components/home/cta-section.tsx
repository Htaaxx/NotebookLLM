"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeIn, slideIn } from "@/lib/motion-utils";

export function CTASection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <motion.div
      className="py-20 text-white relative overflow-hidden w-full"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      {/* Decorative Elements */}
      <motion.div
        className="absolute top-0 left-0 w-0 h-40 bg-white opacity-5 rounded-full"
        variants={slideIn("down", "spring", 0.2, 1)}
        style={{ transform: "translate(-50%, -50%)" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-60 h-60 bg-white opacity-5 rounded-full"
        variants={slideIn("up", "spring", 0.3, 1)}
        style={{ transform: "translate(30%, 30%)" }}
      />

      <div className="w-full relative z-10">
        <motion.div className="max-w-3xl mx-auto text-center" variants={fadeIn("up", 0.2)}>
          <motion.h2
            className="text-6xl mb-4"
            style={{ color: "#E48D44", fontFamily: "Anton, sans-serif" }}
            variants={fadeIn("up", 0.3)}
          >
            Ready to Transform Your Learning Experience?
          </motion.h2>

          <motion.p
            className="text-2xl text-gray-700 mb-6 max-w-xl mx-auto"
            variants={fadeIn("up", 0.4)}
          >
            Join thousands of students and professionals who are already using NoteUS to enhance
            their learning and productivity.
          </motion.p>

          <motion.div variants={fadeIn("up", 0.5)}>
            <Button
              onClick={onGetStarted}
              className="text-white font-semibold px-12 py-5 rounded-full transition shadow-md hover:shadow-lg text-xl"
              style={{ backgroundColor: "#86AB5D" }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#789E4E")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#86AB5D")}
            >
              GET STARTED
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default CTASection;
