import { useState } from 'react'
import Map from './components/Map'
import Navi from './components/Navi'
import BuildingForm from './components/BuildingForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navi/>
      <Map/>
      <BuildingForm/>
        
    </>
  )
}

export default App
