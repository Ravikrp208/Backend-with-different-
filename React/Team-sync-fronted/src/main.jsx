import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {provider} from 'react-redux'
import { ApiProvider } from '@reduxjs/toolkit/query/react'

createRoot(document.getElementById('root')).render(
<Provider store={store}>  
  <ApiProvider />   
</Provider>
)
