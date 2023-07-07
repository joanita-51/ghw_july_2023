#this line imports functionality into our project, so we don't have to write it ourselves
from flask import Flask, render_template, request, redirect 

#initializing our flask application
app = Flask(__name__, template_folder="templates")  

#CRUD OPERATIONS (CREATE, READ, UPDATE, DELETE)
#storage list for now. items is a global variable
items = []


#CReadUD : Taking place at the home path
#by default route uses the GET method. Only lets the user receive the data not send it . read info from the backend
@app.route('/')
def checklist():
    #let us pass the items list to the template so that we can use that list
    return render_template('checklist.html', items=items)

#CreateRUD
@app.route ('/add', methods= ['POST'])
def add_item():
    item = request.form['item']
    items.append(item) #Append the new item to the list (not stored in the database)
    return redirect('/') # we want the view function to return us to the home page or home route


#CRUpdate
#two methods because we want to retrieve an item then update it not only to update it
@app.route('/edit/<int:item_id>', methods=['GET', 'POST'])
def edit_item(item_id):
    item = items[item_id-1] #retrieve the item based on its index

    if request.method == 'POST':
        new_item = request.form['item']
        items[item_id-1] = new_item
        return redirect('/')
    return render_template('edit.html', item=item, item_id=item_id)

#CRUDelete
@app.route('/delete/<int:item_id>')
def delete_item(item_id):
    del items[item_id-1]
    return redirect('/')



