import { MessageSquare, FileText, Brain, FlashlightIcon as FlashIcon } from "lucide-react"

export function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features for Modern Note-Taking</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered tools help you organize, understand, and remember information more effectively.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Chat Assistant</h3>
            <p className="text-gray-600">
              Chat with your documents and get instant answers based on your notes and files.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart File Management</h3>
            <p className="text-gray-600">
              Organize and access your files from anywhere with our intuitive file management system.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Mind Mapping</h3>
            <p className="text-gray-600">
              Visualize your notes and concepts with interactive mind maps generated from your content.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <FlashIcon className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Flashcards</h3>
            <p className="text-gray-600">Create and study with AI-generated flashcards to reinforce your learning.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

