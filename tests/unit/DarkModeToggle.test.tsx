import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

  it('should add dark class to html when toggled to dark', async () => {
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    
    render(<DarkModeToggle />)
    const button = screen.getByLabelText(/toggle dark mode/i)
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('should remove dark class from html when toggled to light', async () => {
    localStorage.setItem('theme', 'dark')
    
    render(<DarkModeToggle />)
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
    
    const button = screen.getByLabelText(/toggle dark mode/i)
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  it('should persist dark mode preference to localStorage', async () => {
    render(<DarkModeToggle />)
    const button = screen.getByLabelText(/toggle dark mode/i)
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('dark')
    })
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('light')
    })
  })

  it('should toggle the dark class on html element', async () => {
    const { container } = render(<DarkModeToggle />)
    const button = screen.getByLabelText(/toggle dark mode/i)
    const html = container.ownerDocument.documentElement
    
    // Initially no dark class
    expect(html.classList.contains('dark')).toBe(false)
    
    // Click to add dark
    fireEvent.click(button)
    await waitFor(() => {
      expect(html.classList.contains('dark')).toBe(true)
    })
    
    // Click to remove dark
    fireEvent.click(button)
    await waitFor(() => {
      expect(html.classList.contains('dark')).toBe(false)
    })
  })
})





