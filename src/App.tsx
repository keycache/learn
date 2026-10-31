import { DarkModeToggle } from '@/components/DarkModeToggle'
import QuizDemo from './QuizDemo'

export default function App() {
  return (
    <>
      {/* Header with Dark Mode Toggle */}
      <header className="fixed top-0 right-0 p-4 z-50">
        <DarkModeToggle />
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <QuizDemo />
      </main>
    </>
  )
}
