import { useState,useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {

  const [users , setUsers] = useState([]) ;
  useEffect(() => {
    axios.get('/api/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  return (
<>
    <div className="App">
      <h1>Users List</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    
    </div>  
    


</>
  )
}

export default App
