import { DarkModeToggle } from '@/components/DarkModeToggle'

export default function App() {
  return (
    <>
      {/* Header with Dark Mode Toggle */}
      <header className="fixed top-0 right-0 p-4 z-50">
        <DarkModeToggle />
      </header>

      {/* Main Content - Fullscreen */}
      <div className="min-h-screen w-screen flex items-center justify-center">
        <h1 className="text-6xl font-bold">
          Hello Learning
        </h1>
      </div>
    </>
  )
}
