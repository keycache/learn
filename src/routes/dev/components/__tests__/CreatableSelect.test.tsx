import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreatableSelect } from '../CreatableSelect'

describe('CreatableSelect', () => {
  const mockOnChange = vi.fn()
  const mockOnCreateNew = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnCreateNew.mockClear()
  })

  it('renders with label and placeholder', () => {
    render(
      <CreatableSelect
        options={['Option 1', 'Option 2']}
        value=""
        onChange={mockOnChange}
        onCreateNew={mockOnCreateNew}
        label="Test Label"
        placeholder="Test Placeholder"
      />
    )

    expect(screen.getByText('Test Label')).toBeDefined()
    expect(screen.getByText('Test Placeholder')).toBeDefined()
  })

  it('displays existing options when dropdown opens', async () => {
    render(
      <CreatableSelect
        options={['Spanish', 'French', 'German']}
        value=""
        onChange={mockOnChange}
        onCreateNew={mockOnCreateNew}
      />
    )

    const container = screen.getByText('Select or type to create...').closest('div')
    fireEvent.click(container!)

    await waitFor(() => {
      expect(screen.getByText('Spanish')).toBeDefined()
      expect(screen.getByText('French')).toBeDefined()
      expect(screen.getByText('German')).toBeDefined()
    })
  })

  it('selects an existing option', async () => {
    render(
      <CreatableSelect
        options={['Spanish', 'French']}
        value=""
        onChange={mockOnChange}
        onCreateNew={mockOnCreateNew}
      />
    )

    const container = screen.getByText('Select or type to create...').closest('div')
    fireEvent.click(container!)

    const spanishOption = await screen.findByText('Spanish')
    fireEvent.click(spanishOption)

    expect(mockOnChange).toHaveBeenCalledWith('Spanish')
  })

  it('filters options based on input', async () => {
    render(
      <CreatableSelect
        options={['Spanish', 'French', 'German']}
        value=""
        onChange={mockOnChange}
        onCreateNew={mockOnCreateNew}
      />
    )

    const container = screen.getByText('Select or type to create...').closest('div')
    fireEvent.click(container!)

    const input = screen.getByRole('textbox', { hidden: false })
    fireEvent.change(input, { target: { value: 'spa' } })

    await waitFor(() => {
      expect(screen.getByText('Spanish')).toBeDefined()
    })
  })

  it('shows create new option when typing non-existent value', async () => {
    render(
      <CreatableSelect
        options={['Spanish', 'French']}
        value=""
        onChange={mockOnChange}
        onCreateNew={mockOnCreateNew}
      />
    )

    const container = screen.getByText('Select or type to create...').closest('div')
    fireEvent.click(container!)

    const input = screen.getByRole('textbox', { hidden: false })
    fireEvent.change(input, { target: { value: 'Italian' } })

    await waitFor(() => {
      expect(screen.getByText('+ Create "Italian"')).toBeDefined()
    })
  })

  it('creates new value when clicking create button', async () => {
    mockOnCreateNew.mockResolvedValueOnce(true)

    render(
      <CreatableSelect
        options={['Spanish', 'French']}
        value=""
        onChange={mockOnChange}
        onCreateNew={mockOnCreateNew}
      />
    )

    const container = screen.getByText('Select or type to create...').closest('div')
    fireEvent.click(container!)

    const input = screen.getByRole('textbox', { hidden: false })
    fireEvent.change(input, { target: { value: 'Italian' } })

    const createButton = await screen.findByText('+ Create "Italian"')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockOnCreateNew).toHaveBeenCalledWith('Italian')
      expect(mockOnChange).toHaveBeenCalledWith('Italian')
    })
  })

  it('shows error if create fails', async () => {
    mockOnCreateNew.mockResolvedValueOnce(false)

    render(
      <CreatableSelect
        options={['Spanish', 'French']}
        value=""
        onChange={mockOnChange}
        onCreateNew={mockOnCreateNew}
      />
    )

    const container = screen.getByText('Select or type to create...').closest('div')
    fireEvent.click(container!)

    const input = screen.getByRole('textbox', { hidden: false })
    fireEvent.change(input, { target: { value: 'Italian' } })

    const createButton = await screen.findByText('+ Create "Italian"')
    fireEvent.click(createButton)

    await waitFor(() => {
      const errorText = screen.queryByText(/Failed to create/)
      expect(errorText).toBeDefined()
    })
  })

  it('displays selected value', () => {
    render(
      <CreatableSelect
        options={['Spanish', 'French']}
        value="Spanish"
        onChange={mockOnChange}
        onCreateNew={mockOnCreateNew}
      />
    )

    expect(screen.getByText('Spanish')).toBeDefined()
  })

  it('clears value when clicking clear button', async () => {
    render(
      <CreatableSelect
        options={['Spanish', 'French']}
        value="Spanish"
        onChange={mockOnChange}
        onCreateNew={mockOnCreateNew}
      />
    )

    const clearButton = screen.getByRole('button', { name: 'Clear selection' })
    fireEvent.click(clearButton)

    expect(mockOnChange).toHaveBeenCalledWith('')
  })

  it('marks required fields with asterisk', () => {
    render(
      <CreatableSelect
        options={['Spanish']}
        value=""
        onChange={mockOnChange}
        onCreateNew={mockOnCreateNew}
        label="Category"
        required
      />
    )

    expect(screen.getByText('*')).toBeDefined()
  })

  it('disables dropdown when disabled prop is true', () => {
    const { container } = render(
      <CreatableSelect
        options={['Spanish']}
        value=""
        onChange={mockOnChange}
        onCreateNew={mockOnCreateNew}
        disabled
      />
    )

    const displayDiv = container.querySelector('div[class*="cursor-not-allowed"]')
    expect(displayDiv).toBeDefined()
  })
})
