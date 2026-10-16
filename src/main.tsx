import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Profile from './Profile'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><Profile /></StrictMode>,
)
