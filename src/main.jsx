import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// router imports over here
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// router imports ends here

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <App />
    </BrowserRouter>
  </StrictMode>,
)
