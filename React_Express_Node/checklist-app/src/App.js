import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from 'react';
import axios from 'axios'

function App() {
  const [items, setItems] = useState([]); //To record the tasks that we have
  const [newItem, setNewItem] = useState(''); //To record any updates, changes that we may have to the list

  // helps get all the items for our project and this is rendered once
  useEffect(()=>{
    // method to fetch all our items 
    fetchItems();
  }, []);

  //an async function waits for a hand check from a promise
  // used the axios library to get a request to the nodejs our backend and collect the response
  const fetchItems = async()=>{
    try {
      //The port 3001 is where node js is being located. And the get retrieves the items from that route.
      const response = await axios.get('http://localhost:3001/items');

      // set the items to whatever we get from that server
      setItems(response.data);
    } catch (error) {
      console.log("Error fetching items:", error)
    }
  }

  //CreateRUD
  const addItem = async () =>{
    try{
      // inside the post we pass in the route and the dictionary object which has the new item that we want to send to the backend
      const response = await axios.post('http://localhost:3001/items', {item:newItem}); 
      const newItemObj = {id:response.data.id, item:newItem};
      setItems([...items, newItemObj])
      // we return the state back to an empty string
      setNewItem("")

    }catch(error){
      console.error('Error adding item:', error)
    }
  }

  // Update
  const editItem = async (id, updatedItem)=>{
    try {
      await axios.put(`http://localhost:3001/items/${id}`, {item:updatedItem});
      const updatedItems = items.map((item)=>
        item.id === id? {...item, item:updatedItem} : item
      );
      setItems(updatedItems)
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }

  //Delete
  //The asynchronous function is helping us in a way that we need the nodejs server to respond and this can take sometime
  //The await helps us to tell js that it should not move on to setItems until it hears back from the nodejs server
  const deleteItem = async (id)=>{
    try{
      await axios.delete(`http://localhost:3001/items/${id}`);
      setItems(items.filter((item)=> item.id !== id));
    } catch(error){
      console.error('Error deleting item:', error)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
