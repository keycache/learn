/**
 * LessonMultiSelect Component
 * A multi-select dropdown for choosing multiple lessons
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

export interface LessonOption {
  id: string
  label: string
}

interface LessonMultiSelectProps {
  options: LessonOption[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  loading?: boolean
  error?: string | null
  required?: boolean
}

export function LessonMultiSelect({
  options,
  selectedIds,
  onChange,
  placeholder = 'Select lessons...',
  label,
  disabled = false,
  loading = false,
  error = null,
  required = false,
}: LessonMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter options based on search input
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchInput.toLowerCase())
  )

  // Get selected options for display
  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id))

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleToggleOption = (optionId: string) => {
    const newSelectedIds = selectedIds.includes(optionId)
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId]

    onChange(newSelectedIds)
  }

  const handleRemoveTag = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    handleToggleOption(optionId)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative z-0" ref={containerRef}>
        {/* Selected items and input */}
        <div
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          role="button"
          tabIndex={disabled || loading ? -1 : 0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled && !loading) {
              setIsOpen(!isOpen)
            }
          }}
          className={`w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm text-left flex items-center justify-between gap-2 ${
            disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted'
          } ${error ? 'border-red-500' : ''}`}
        >
          <div className="flex flex-wrap gap-1 flex-1 min-h-[1.5rem] items-center">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <span
                  key={opt.id}
                  className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-1 rounded text-xs"
                >
                  {opt.label}
                  <button
                    onClick={(e) => handleRemoveTag(opt.id, e)}
                    className="hover:text-blue-700 dark:hover:text-blue-200"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 border border-border rounded-md shadow-2xl z-[9999] min-w-full bg-slate-900">
            {/* Search input */}
            <div className="p-2 border-b border-border bg-slate-900">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search lessons..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-border rounded bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Options list */}
            <div className="max-h-64 overflow-y-auto bg-slate-900">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 cursor-pointer text-sm transition-colors bg-slate-900 text-white"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(option.id)}
                      onChange={() => handleToggleOption(option.id)}
                      className="w-4 h-4 rounded border-border cursor-pointer"
                    />
                    <span>{option.label}</span>
                  </label>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-slate-400 text-center bg-slate-900">
                  No lessons found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Helper text */}
      {!error && (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length > 0
            ? `${selectedIds.length} lesson${selectedIds.length !== 1 ? 's' : ''} selected`
            : 'Select one or more lessons'}
        </p>
      )}
    </div>
  )
}

export default LessonMultiSelect
