import AuthUI from "@/components/auth-ui"
import { Logo } from "@/components/logo"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {/* Abstract shapes */}
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-green-100 dark:bg-green-900/20 blur-3xl opacity-60 dark:opacity-30" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl opacity-60 dark:opacity-30" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />

        {/* Floating notes */}
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-12 h-16 bg-white dark:bg-gray-800 rounded shadow-md rotate-6 opacity-70" />
        <div className="absolute top-3/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 w-12 h-16 bg-white dark:bg-gray-800 rounded shadow-md -rotate-12 opacity-70" />
        <div className="absolute bottom-1/4 left-1/3 transform -translate-x-1/2 translate-y-1/2 w-10 h-14 bg-white dark:bg-gray-800 rounded shadow-md rotate-12 opacity-70" />
      </div>

      {/* Content */}
      <div className="w-full max-w-md space-y-6 z-10">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md">
            <Logo className="h-12 w-12 text-green-600 dark:text-green-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">NoteGPT</h1>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">Your AI-powered note-taking assistant</p>
        </div>
        <AuthUI />
      </div>
    </main>
  )
}

