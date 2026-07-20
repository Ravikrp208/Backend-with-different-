import React from 'react'
import About from './components/About'

const App = () => {


  const [count ,setcount ] = usestate()


  return (
    <>
  <div>
   <h1> count -{count } </h1>
   <button onClick={()=>setcount(count+1)}>Increment</button>
   <button onClick={()=>setcount(count-1)}>Decrement</button>
    <About /> 
  </div>
  

    </>
  )
}

export default App