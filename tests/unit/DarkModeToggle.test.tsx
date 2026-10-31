import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DarkModeToggle } from '@/components/DarkModeToggle'

describe('DarkModeToggle', () => {
  beforeEach(() => {
    // Clear localStorage and reset DOM
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('should render the toggle button', () => {
    render(<DarkModeToggle />)
    const button = screen.getByLabelText(/toggle dark mode/i)
    expect(button).toBeInTheDocument()
  })

  it('should add dark class to html when toggled to dark', () => {
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    
    render(<DarkModeToggle />)
    const button = screen.getByLabelText(/toggle dark mode/i)
    
    fireEvent.click(button)
    
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should remove dark class from html when toggled to light', () => {
    document.documentElement.classList.add('dark')
    
    render(<DarkModeToggle />)
    const button = screen.getByLabelText(/toggle dark mode/i)
    
    fireEvent.click(button)
    
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('should persist dark mode preference to localStorage', () => {
    render(<DarkModeToggle />)
    const button = screen.getByLabelText(/toggle dark mode/i)
    
    fireEvent.click(button)
    
    expect(localStorage.getItem('theme')).toBe('dark')
    
    fireEvent.click(button)
    
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('should toggle the dark class on html element', () => {
    const { container } = render(<DarkModeToggle />)
    const button = screen.getByLabelText(/toggle dark mode/i)
    const html = container.ownerDocument.documentElement
    
    // Initially no dark class
    expect(html.classList.contains('dark')).toBe(false)
    
    // Click to add dark
    fireEvent.click(button)
    expect(html.classList.contains('dark')).toBe(true)
    
    // Click to remove dark
    fireEvent.click(button)
    expect(html.classList.contains('dark')).toBe(false)
  })
})



