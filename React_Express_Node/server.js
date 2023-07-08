// require is the way we import dependencies in javascript
const express = require('express');
//verbose key word means we want a full stack trace to the database
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

//to get the environment variable files from .env file
dotenv.config()

//setting up our express server
const app = express();
const port = 3001;

//including our middlewares. They are interfaces that allow information to be spread around the application
app.use(express.json()) //Send json information across the application 
app.use(cors());// cors access resources in one part of the application that originate from another

const db = new sqlite3.Database('./data.db')
//the serialize helps to ensure that the code runs serially meaning before the next one
db.serialize(()=>{
    db.run('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT)');
});

//This is a post endpoint on our nodejs server
app.post('/items', (req,res)=>{
    const item = req.body.item;
    db.run('INSERT INTO items (item) VALUES (?)', [item], function(err){
        if(err){
            res.status(500).json({error: err.message})
        }else{
            res.json({id: this.lastID})
        }
    })

})

//The read endpoint
app.get('/items',(req, res)=>{
    db.all('SELECT * FROM items', (err)=>{
        if(err){
            res.status(500).json({error: err.message})
        }else{
            res.json(rows)
        }
    })
})

//update endpoint
app.put('/items/:id', (req,res)=>{
    const id = req.params.id;
    const newItem = req.body.item;
    db.run('UPDATE items SET item=? WHERE id=?', [newItem, id], (err)=>{
        if (err) {
            res.status(500).json ({error: err.message})
        }else{
            res.sendStatus(200);
        }
    })
})

//Delete operation
app.delete('/items/:id', (req,res)=>{
    const id = req.params.id
    db.run('DELETE FROM items WHERE id =?',[id], (err)=>{
        if(err){
            res.status(500).json({error:err.message})
        }else{
            res.sendStatus(200)
        }
    })
})

//This starts our application
app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`)
})