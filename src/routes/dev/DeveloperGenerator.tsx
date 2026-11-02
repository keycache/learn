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
import { LLMSettingsTab } from './tabs/LLMSettingsTab'
import { SelectionTab } from './tabs/SelectionTab'
import { LessonsTab } from './tabs/LessonsTab'
import { QuizzesTab } from './tabs/QuizzesTab'

interface DeveloperGeneratorProps {
  // No props needed - this is a self-contained dev tool
}

export function DeveloperGenerator(_props: DeveloperGeneratorProps) {
  const [activeTab, setActiveTab] = useState<string>('settings')
  const [selectedTopic, setSelectedTopic] = useState<string>('')

  const tabs = [
    { id: 'settings', label: 'LLM Settings' },
    { id: 'selection', label: 'Selection' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'quizzes', label: 'Quizzes' },
  ]

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen bg-themed">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Developer Generator</h1>
          <p className="text-muted-foreground">
            Generate lessons and quizzes using LLM (Dev Mode Only)
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-border sticky top-0 bg-themed">
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
            <LLMSettingsTab />
          )}

          {activeTab === 'selection' && (
            <SelectionTab 
              onSelectionChange={(selection) => {
                setSelectedTopic(selection.topic)
                // Auto-switch to appropriate tab based on selection
                if (selection.type === 'lesson') {
                  setActiveTab('lessons')
                } else if (selection.type === 'quiz') {
                  setActiveTab('quizzes')
                }
              }}
            />
          )}

          {activeTab === 'lessons' && (
            <LessonsTab 
              selectedTopic={selectedTopic}
              onGenerate={(form) => {
                console.log('Lesson generation requested:', form)
                // TODO: Phase 8.5 - Implement LLM API call
              }}
            />
          )}

          {activeTab === 'quizzes' && (
            <QuizzesTab 
              selectedTopic={selectedTopic}
              onGenerate={(form) => {
                console.log('Quiz generation requested:', form)
                // TODO: Phase 8.5 - Implement LLM API call
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 p-4 bg-muted rounded-lg text-xs text-muted-foreground text-center">
          <p>Phase 8.2 - UI Components Complete | Next: Phase 8.3 - State Management</p>
        </div>
      </div>
    </div>
  )
}
