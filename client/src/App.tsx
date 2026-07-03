import { useState } from 'react'
import './App.css'
import EmergencyPage from './page/MainPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <EmergencyPage/>
    </>
  )
}

export default App
