/**
 * Developer Generator Component
 * Dev-only feature for generating lessons and quizzes using LLM
 * 
 * This component is only included in development builds (import.meta.env.DEV)
 * and is completely tree-shaken from production builds.
 * 
 * Structure:
 * - 4 tabs: LLM Settings | Selection | Lessons | Quizzes
 * - Settings persist to localStorage
 * - API integration with OpenRouter (extensible to other providers)
 */

import { useState } from 'react'

interface DeveloperGeneratorProps {
  // No props needed - this is a self-contained dev tool
}

export function DeveloperGenerator(_props: DeveloperGeneratorProps) {
  const [activeTab, setActiveTab] = useState<string>('settings')

  // TODO: Phase 8.2 - Create 4 tab components
  // - LLMSettingsTab: Configure API keys, test connection
  // - SelectionTab: Category/subcategory/topic selection
  // - LessonsTab: Generate lessons with custom instructions
  // - QuizzesTab: Generate quizzes with question counts

  const tabs = [
    { id: 'settings', label: 'LLM Settings' },
    { id: 'selection', label: 'Selection' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'quizzes', label: 'Quizzes' },
  ]

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen bg-themed">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Developer Generator</h1>
          <p className="text-muted-foreground">
            Generate lessons and quizzes using LLM (Dev Mode Only)
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-foreground border-b-2 border-primary -mb-px'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 border border-border rounded-lg bg-card">
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">LLM Settings</h2>
              <p className="text-muted-foreground">LLM Settings tab (Phase 8.2)</p>
            </div>
          )}

          {activeTab === 'selection' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selection</h2>
              <p className="text-muted-foreground">Selection tab (Phase 8.2)</p>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Lessons</h2>
              <p className="text-muted-foreground">Lessons tab (Phase 8.2)</p>
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Quizzes</h2>
              <p className="text-muted-foreground">Quizzes tab (Phase 8.2)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
