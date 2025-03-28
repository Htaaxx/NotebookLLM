export function IntegrationSection() {
  return (
    <section className="py-12 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-gray-500 mb-8">Works with your favorite platforms</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">Google</div>
          <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">YouTube</div>
          <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">Notion</div>
          <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">Evernote</div>
          <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">Dropbox</div>
        </div>
      </div>
    </section>
  )
}

