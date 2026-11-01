import { DarkModeToggle } from '@/components/DarkModeToggle'
import { SkipToContentLink } from '@/components/common/SkipToContentLink'
import AppNavigator from './AppNavigator'

export default function App() {
  return (
    <>
      <SkipToContentLink />

      {/* Header with Dark Mode Toggle */}
      <header className="absolute top-0 right-0 p-4 z-50 pointer-events-auto">
        <DarkModeToggle />
      </header>

      {/* Main Content */}
      <main id="main-content">
        <AppNavigator />
      </main>
    </>
  )
}
