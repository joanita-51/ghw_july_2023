#this line imports functionality into our project, so we don't have to write it ourselves
from flask import Flask, render_template, request, redirect, jsonify
import sqlite3

#initializing our flask application
app = Flask(__name__) 

# Allows python to access different directories in your environment. it will be used to access the environment variables in the dotenv
import os 
import sendgrid
from sendgrid.helpers.mail import Mail

sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
reminder_email = os.getenv('REMINDER_EMAIL')
receiver_email = os.getenv('RECEIVER_EMAIL')


#CRUD OPERATIONS (CREATE, READ, UPDATE, DELETE)
#storage list for now. items is a global variable
items = []

db_path = 'checklist.db'

#CREATE
def create_table():
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS checklist
    (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT)''')
    conn.commit() #This commits the changes to the database
    conn.close() #This closes the database connection because it doesn't need to be open once we are done modifying

#READ
def get_items():
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute ("SELECT * FROM checklist")
    items = c.fetchall() #fetches all the items from the database and stores them into items 
    conn.close()
    return items

#CREATE
def add_item(item):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("INSERT INTO checklist (item) VALUES (?)", (item,))
    conn.commit()
    conn.close()

#UPDATE
def update_item(item_id, new_item):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("UPDATE checklist SET item = ? WHERE id = ?", (new_item, item_id))
    conn.commit()
    conn.close()

#DELETE
def delete_item(item_id):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("DELETE FROM checklist WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()

# The sendgrid api function
def send_email(subject, body):
    message = Mail(
        from_email=reminder_email,
        to_emails=receiver_email,
        subject=subject,
        plain_text_content=body)

    try:
        sg = sendgrid.SendGridAPIClient(api_key=sendgrid_api_key)
        response = sg.send(message)
        if response.status_code == 202:
            return True
    except Exception as e:
        print("An error occurred while sending email:", str(e))
    
    return False

# OUR ROUTES
#CReadUD : Taking place at the home path
#by default route uses the GET method. Only lets the user receive the data not send it . read info from the backend
@app.route('/')
def checklist():
    create_table()
    items = get_items()
    #let us pass the items list to the template so that we can use that list
    return render_template('checklist.html', items=items)

#CreateRUD
@app.route ('/add', methods= ['POST'])
def add():
    item = request.form['item']
    add_item(item)
    return redirect('/') # we want the view function to return us to the home page or home route


#CRUpdate
#two methods because we want to retrieve an item then update it not only to update it
@app.route('/edit/<int:item_id>', methods=['GET', 'POST'])
def edit(item_id):


    if request.method == 'POST':
        new_item = request.form['item']
        update_item(item_id, new_item)
        return redirect('/')
    else:
        items = get_items()
        #associating your tasks with the item id
        item = next((x[1] for x in items if x[0] == item_id), None)
    return render_template('edit.html', item=item, item_id=item_id)

#CRUDelete
@app.route('/delete/<int:item_id>')
def delete(item_id):
    delete_item(item_id)
    return redirect('/')

# send email route
@app.route('/send_email', methods=['POST'])
def send_email_route():
    data = request.get_json()
    item = data['item']
    subject = "Reminder: {}".format(item)
    body = "This is a reminder for the task:{}".format(item)

    if send_email(subject, body):
        return jsonify(success=True)
    else:
        return jsonify(success=False), 500

