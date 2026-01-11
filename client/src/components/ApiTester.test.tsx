import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ApiTester from './ApiTester'
import { ToastProvider } from './ToastContext'

describe('ApiTester', () => {
  it('renders without crashing', () => {
    render(
      <ToastProvider>
        <ApiTester />
      </ToastProvider>
    )
    expect(screen.getByText(/AI Agent Framework API Tester/i)).toBeInTheDocument()
  })

  it('displays the subtitle', () => {
    render(
      <ToastProvider>
        <ApiTester />
      </ToastProvider>
    )
    expect(screen.getByText(/Test API endpoints without workflows/i)).toBeInTheDocument()
  })

  it('displays predefined test buttons', () => {
    render(
      <ToastProvider>
        <ApiTester />
      </ToastProvider>
    )
    expect(screen.getByText(/Health Check/i)).toBeInTheDocument()
    expect(screen.getByText(/API Info/i)).toBeInTheDocument()
    expect(screen.getByText(/List Agents/i)).toBeInTheDocument()
  })
})
