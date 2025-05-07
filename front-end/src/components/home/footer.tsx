"use client"

export function Footer({ onNavClick }: { onNavClick: () => void }) {
  return (
    <footer className="w-full bg-[#1E1E1E] text-gray-300">
      <div className="w-full py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Description */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 bg-[#E9B872]"></div>
                <span
                  className="font-['Anton'] text-[30px] text-[#86AB5D]"
                  style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400 }}
                >
                  NoteUS
                </span>
              </div>
              <p
                className="text-[16px] text-[#F2F5DA]"
                style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700 }}
              >
                Your AI-powered note-taking assistant that helps you study smarter, not harder.
              </p>
            </div>

            {/* Features Column */}
            <div>
              <h4
                className="font-bold text-[18px] text-[#F2F5DA] mb-3"
                style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700 }}
              >
                FEATURES
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    onClick={onNavClick}
                    className="hover:text-[#F2F5DA] hover:underline transition-colors text-[16px] text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 400 }}
                  >
                    AI Chat
                  </a>
                </li>
                <li>
                  <a
                    onClick={onNavClick}
                    className="hover:text-[#F2F5DA] hover:underline transition-colors text-[16px] text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 400 }}
                  >
                    File Management
                  </a>
                </li>
                <li>
                  <a
                    onClick={onNavClick}
                    className="hover:text-[#F2F5DA] hover:underline transition-colors text-[16px] text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 400 }}
                  >
                    Mind Mapping
                  </a>
                </li>
                <li>
                  <a
                    onClick={onNavClick}
                    className="hover:text-[#F2F5DA] hover:underline transition-colors text-[16px] text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 400 }}
                  >
                    Flashcards
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4
                className="font-bold text-[18px] text-[#F2F5DA] mb-3"
                style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700 }}
              >
                COMPANY
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    onClick={onNavClick}
                    className="hover:text-[#F2F5DA] hover:underline transition-colors text-[16px] text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 400 }}
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    onClick={onNavClick}
                    className="hover:text-[#F2F5DA] hover:underline transition-colors text-[16px] text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 400 }}
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    onClick={onNavClick}
                    className="hover:text-[#F2F5DA] hover:underline transition-colors text-[16px] text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 400 }}
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    onClick={onNavClick}
                    className="hover:text-[#F2F5DA] hover:underline transition-colors text-[16px] text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 400 }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4
                className="font-bold text-[18px] text-[#F2F5DA] mb-3"
                style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 700 }}
              >
                LEGAL
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    onClick={onNavClick}
                    className="hover:text-[#F2F5DA] hover:underline transition-colors text-[16px] text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 400 }}
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    onClick={onNavClick}
                    className="hover:text-[#F2F5DA] hover:underline transition-colors text-[16px] text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 400 }}
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    onClick={onNavClick}
                    className="hover:text-[#F2F5DA] hover:underline transition-colors text-[16px] text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 400 }}
                  >
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-[14px]" style={{ fontFamily: "'Quicksand', sans-serif", fontWeight: 400 }}>
              &copy; {new Date().getFullYear()} NoteUS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
