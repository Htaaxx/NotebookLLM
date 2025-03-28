export function TestimonialsSection() {
  return (
    <section className="py-20 px-6 bg-green-600 text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">What Our Users Say</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <p className="mb-6 text-white/90">
              "NoteUS has completely transformed how I study. The AI chat feature helps me understand complex topics,
              and the mind maps make it easy to connect ideas."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-full mr-4"></div>
              <div>
                <h4 className="font-semibold">Sarah Johnson</h4>
                <p className="text-white/70 text-sm">Computer Science Student</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <p className="mb-6 text-white/90">
              "As a researcher, I need to organize tons of information. NoteUS helps me keep everything structured and
              accessible. The flashcard feature is a game-changer for memorization."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-full mr-4"></div>
              <div>
                <h4 className="font-semibold">David Chen</h4>
                <p className="text-white/70 text-sm">PhD Candidate</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <p className="mb-6 text-white/90">
              "I've tried many note-taking apps, but NoteUS is in a league of its own. The AI capabilities save me hours
              of work every week, and the interface is intuitive and beautiful."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-full mr-4"></div>
              <div>
                <h4 className="font-semibold">Emily Rodriguez</h4>
                <p className="text-white/70 text-sm">Marketing Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

