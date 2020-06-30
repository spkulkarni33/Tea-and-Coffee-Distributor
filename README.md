# Tea and Coffee Distributor
User signup: 
Register a new user to the system. 
o	Check the new username or email address if it’s already registered to the system using AJAX. 
o	Form validation: Check if all mandatory fields are filled out. (JQuery)
o	Check if password is strong enough. Define the rules of having a strong password. (JQuery). User passwords should be hashed and hashed version of passwords should be stored in the database.

User login: User should be able to login to the system. Session handling is done using express.

List available products/services in the system. User is able to filter the results based on at least one criterion (i.e. category). Also, able to “Search” for a specific item.  Search and filtering are integrated together.

Paging functionality for listing products/services. Paging incorporated with filtering and search functions as well.

Add item(s) to the cart and checkout. For the online shopping sites, pricing will be included but the actual payment functionality hasn't been implemented. However, we keep track of inventory.

Users are able to update items in the cart (remove items from the cart, update their quantity).

Shows the history of purchases for the user.

For Admin user(s):
o	List all items
o	Add new item
o	Delete item
o	Update item

Admin user has the same interface with regular users, except that he/she will be provided extra features (buttons/links) for addition, update and deletion of products/services.

While adding items to the system, admin user uploads pictures for the items and while updating items, is able to change pictures.

For delete, soft-delete is implemented.

Front-end design
Bootstrap and Bootstrap templates for user interface design, HTML5, CSS, Javascript and EJS.


Back-end design
MongoDB for database component. Node.JS for server side scripting. 
