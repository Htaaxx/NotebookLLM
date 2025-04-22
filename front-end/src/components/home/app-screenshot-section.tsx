import { FileUp, MessageSquare, Brain } from "lucide-react"

export function AppScreenshotSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">See NoteUS in Action</h2>
            <p className="text-xl text-gray-600 mb-8">
              Our intuitive interface makes it easy to organize your thoughts and boost your productivity.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FileUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Upload Any File</h3>
                  <p className="text-gray-600">
                    Import PDFs, images, and documents to extract and organize information.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Chat with Your Notes</h3>
                  <p className="text-gray-600">Ask questions about your content and get accurate answers instantly.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Generate Mind Maps</h3>
                  <p className="text-gray-600">Visualize connections between concepts for better understanding.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200  w-full md:w-[700px] ">
              <img
                src="/NoteUS.jpg"
                alt="NoteUS Interface"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -z-10 -bottom-6 -right-6 w-64 h-64 bg-green-200 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -z-10 -top-6 -left-6 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

