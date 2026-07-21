import React, { useState } from "react";
import About from "./components/About";

const App = () => {
  console.log("App rendering.....");
  const [count, setCount] = useState(0);

  return (
  
      <div className ="p-5">
        <h1>Count - {count}</h1>
        <button
          onClick={() => setCount(count + 1)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-2xl"
        >
          Increment
        </button>

        <About />
      
        <Service />
        <login />
      </div>

  );
};

export default App;
