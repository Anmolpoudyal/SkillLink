import { useState } from 'react'
import './App.css'

import ProviderSignup from './pages/ProviderSignup.jsx'
  
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <ProviderSignup />  
    </>
  )
}

export default App;



