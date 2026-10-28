import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// router imports over here
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// router imports ends here


// react-router imorts start here 
import { Provider } from 'react-redux';
import { store } from './redux/store';
// react-router imorts end here 

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
   <Provider store={store}>
      <App />
    </Provider>
    </BrowserRouter>
  </StrictMode>,
)
