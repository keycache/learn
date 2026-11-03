/**
 * CreatableSelect Component
 * A select dropdown that allows users to either select from existing options
 * or type to create a new value
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface CreatableSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  onCreateNew: (value: string) => Promise<boolean>
  placeholder?: string
  label?: string
  disabled?: boolean
  loading?: boolean
  error?: string | null
  required?: boolean
}

export function CreatableSelect({
  options,
  value,
  onChange,
  onCreateNew,
  placeholder = 'Select or type to create...',
  label,
  disabled = false,
  loading = false,
  error = null,
  required = false,
}: CreatableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter options based on input
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  )

  // Check if input is a new value (not in options)
  const isNewValue = inputValue.trim() !== '' && !options.includes(inputValue)

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

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setInputValue('')
    setIsOpen(false)
    setCreateError(null)
  }

  const handleCreateNew = async () => {
    if (!isNewValue || isCreating) return

    const newValue = inputValue.trim()
    setIsCreating(true)
    setCreateError(null)

    try {
      const success = await onCreateNew(newValue)

      if (success) {
        onChange(newValue)
        setInputValue('')
        setIsOpen(false)
      } else {
        setCreateError(`Failed to create "${newValue}"`)
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create item')
    } finally {
      setIsCreating(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setInputValue('')
    setCreateError(null)
  }

  return (
    <div ref={containerRef} className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Main Input/Display */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm
            flex items-center justify-between cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-border/80'}
            ${isOpen ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
          `}
        >
          <div className="flex-1 flex items-center gap-2">
            {!isOpen && value && (
              <>
                <span>{value}</span>
                {!disabled && (
                  <button
                    onClick={handleClear}
                    className="ml-auto p-1 hover:bg-muted rounded"
                    title="Clear selection"
                  >
                    <X size={16} className="text-muted-foreground" />
                  </button>
                )}
              </>
            )}
            {isOpen && (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setCreateError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isNewValue) {
                    handleCreateNew()
                  } else if (e.key === 'Escape') {
                    setIsOpen(false)
                  }
                }}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
            )}
            {!isOpen && !value && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 border border-border rounded-md bg-slate-900 shadow-lg">
            {/* Existing Options */}
            {filteredOptions.length > 0 && (
              <div className="border-b border-border last:border-b-0">
                {filteredOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full px-3 py-2 text-left text-sm transition-colors
                      ${value === option ? 'bg-primary/20 font-medium text-primary' : 'hover:bg-slate-800 text-white'}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Create New Option */}
            {isNewValue && (
              <button
                onClick={handleCreateNew}
                disabled={isCreating}
                className={`
                  w-full px-3 py-2 text-left text-sm border-t border-border
                  ${
                    isCreating
                      ? 'opacity-50 cursor-not-allowed bg-slate-800 text-white'
                      : 'hover:bg-primary/20 text-primary font-medium transition-colors'
                  }
                `}
              >
                {isCreating ? 'Creating...' : `+ Create "${inputValue}"`}
              </button>
            )}

            {/* No Results */}
            {filteredOptions.length === 0 && !isNewValue && (
              <div className="px-3 py-2 text-sm text-muted-foreground bg-slate-800">No options found</div>
            )}
          </div>
        )}
      </div>

      {/* Error Messages */}
      {(error || createError) && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          ⚠️ {error || createError}
        </p>
      )}

      {/* Loading State */}
      {loading && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          ⏳ Loading...
        </p>
      )}
    </div>
  )
}
