import { FileUp, MessageSquare, Brain } from "lucide-react";
import { Anton } from "next/font/google";

// Initialize Anton font
const anton = Anton({ 
  weight: "400", 
  subsets: ["latin"],
  display: "swap",
});

export function AppScreenshotSection() {
  return (
    <section className="py-28 px-6 bg-[#86AB5D] relative">
      <div className="max-w-[1100px] mx-auto relative h-[750px]">
        {/* Container 1: Title and Description - Positioned independently */}
        <div 
          className="absolute bg-[#F2F5DA] rounded-t-3xl rounded-b-xl px-10 py-20 flex flex-col justify-center"
          style={{
            top: "0px",
            left: "0px",
            width: "400px",
            height: "530px"
          }}
        >
          <h2 className={`${anton.className} text-5xl text-[#E48D44] font-bold leading-tight mb-6`}>
            See NoteUS 
            <br />in Action
          </h2>
          <p className="text-gray-700 text-xl">
            Our intuitive interface makes it easy 
            <br />to organize your thoughts and 
            <br />boost your productivity.
          </p>
        </div>
        
        {/* Container 2: Video/Image - Positioned independently */}
        <div 
          className="absolute bg-[#F2F5DA] rounded-3xl px-10 py-12 flex items-center justify-center"
          style={{
            top: "0px",
            right: "0px",
            width: "670px",
            height: "400px"
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 w-full">
            <img
              src="/NoteUS.jpg"
              alt="NoteUS Interface"
              className="w-full h-auto object-cover"
            />
            {/* Optionally add a play button if it's a video */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white bg-opacity-80 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-16 border-l-[#D86018] border-b-8 border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
          <div className="absolute -z-10 -bottom-8 -right-8 w-80 h-80 bg-green-200 rounded-full blur-3xl opacity-50" />
        </div>
        
        {/* Container 3: Feature boxes - Positioned independently */}
        <div 
          className="absolute bg-[#F2F5DA] rounded-3xl px-10 py-12"
          style={{
            top: "430px",
            bottom: "0px",
            left: "0px",
            width: "1100px",
            height: "300px"
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 h-full">
            {[
              {
                icon: <FileUp className="h-6 w-6 text-green-600" />,
                title: "Upload Any File",
                desc: "Import PDFs, images, and documents to extract and organize information.",
              },
              {
                icon: <MessageSquare className="h-6 w-6 text-green-600" />,
                title: "Chat with Your Notes",
                desc: "Ask questions about your content and get accurate answers instantly.",
              },
              {
                icon: <Brain className="h-6 w-6 text-green-600" />,
                title: "Generate Mind Maps",
                desc: "Visualize connections between concepts for better understanding.",
              },
            ].map(({ icon, title, desc }, index) => (
              <div
                key={index}
                className="bg-[#457A4D] rounded-2xl p-6 text-white text-center hover:scale-105 hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center justify-start"
              >
                <div className="w-12 h-12 mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  {icon}
                </div>
                <h3 className={`${anton.className} text-xl font-semibold mb-3`}>{title}</h3>
                <p className="text-base text-[#E9EACF]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}