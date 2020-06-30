var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;
var User = new Schema({
    firstname : String,
    lastname : String,
    address: String,
    email : String,
    contact : String,
    password : String
});

module.exports = mongoose.model('User', User);