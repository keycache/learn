import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize dark mode from localStorage
const savedTheme = localStorage.getItem('theme')

const html = document.documentElement

if (savedTheme === 'dark') {
  html.classList.add('dark')
} else if (savedTheme === 'light') {
  html.classList.remove('dark')
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  html.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
