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

  //Read (CReadUD)
  //an async function waits for a hand check from a promise
  // used the axios library to get a request to the nodejs our backend and collect the response
  const fetchItems = async()=>{
    try {
      //The port 3001 is where node js is being located. And the get retrieves the items from that route.
      const response = await axios.get('http://localhost:3001/items');

      // set the items to whatever we get from that server
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error)
    }
  }

  //Create (A way to add new entries to the database and display them on the screen)
  const addItem = async () =>{
    try{
      // inside the post we pass in the route and the dictionary object which has the new item that we want to send to the backend (Both send and receive data)
      const response = await axios.post('http://localhost:3001/items', {item:newItem}); 
      const newItemObj = {id:response.data.id, item:newItem};
      setItems([...items, newItemObj])
      // we return the state back to an empty string
      setNewItem("")

    }catch(error){
      console.error('Error adding item:', error)
    }
  }

  // Update (with post , we not only send information to the server but we also receive it back)
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
  //This time we are not passing any new information to the server, we are just sending the request to the path and the endpoint will execute on the server.
  const deleteItem = async (id)=>{
    try{
      await axios.delete(`http://localhost:3001/items/${id}`);
      // updating the values on our frontend
      // filter the items so that we can get a list of every item such that it is not the same as the one we want to delete
      setItems(items.filter((item)=> item.id !== id));
    } catch(error){
      console.error('Error deleting item:', error)
    }
  }

  // Function for the reminders
  const setReminder = async(id)=>{
    try {
      const item = items.find((item)=> item.id === id)
      const confirmed = window.confirm(['Reminder:' + item.item])
      if(confirmed){
        await axios.post('http://localhost:3001/send_email', {item: item.item})
      }
    } catch (error) {
      console.error("Error sending reminder:", error)
      
    }
  }

  return (
    <div className="container">
      <h1>Hacker Planner</h1>
      <ul className='checklist-items'>
        {/* The map maps every single item inside our list database to its own list element  */}
        {items.map((item)=>(
          <li key={item.id}>
            <span>{item.item}</span>
            <button className='remind-button'
              onClick={()=> editItem(item.id, prompt('Enter updated item',item.item))}
            >
              Edit
            </button>
            <button onClick={()=>deleteItem(item.id)}>
              Delete
            </button>
            <button onClick={()=>setReminder(item.id)}>
              Remind
            </button>
          </li>
        ))}
      </ul>

      {/* Used to add items */}
      <div className='add-form'>
          <input type="text" value={newItem} onChange={(e)=> setNewItem(e.target.value)}/>
          <button onClick={addItem}>Add</button>
      </div>

    </div>
  );
}

export default App;
