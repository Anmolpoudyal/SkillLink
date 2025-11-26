import { useState } from 'react'
import './App.css'
import LandingPage from './pages/firstlandingpage.jsx'

import HomePage from './pages/home.jsx'
  
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <LandingPage />
    </>
  )
}

export default App;



